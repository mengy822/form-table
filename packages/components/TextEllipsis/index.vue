<!--
  TextEllipsis —— 单行文本溢出省略组件（Vue 3 + TypeScript）

  能力：
  1. 支持三种省略方向：start（前置）/ middle（中间）/ end（后置）
  2. 用 Canvas 精确测量文本宽度 + 二分查找，命中"刚好不溢出"的最长片段
  3. 按 Unicode 码点切分，不会把 emoji 劈成半个
  4. ResizeObserver 监听容器尺寸，宽度变化自动重算；字体加载完成后自动重算
  5. 鼠标移入显示完整内容（Teleport 到 body 的自定义浮层，自动避让视口边界）

  基本用法：
    <TextEllipsis text="一段很长的文字……" mode="middle" style="width: 200px" />

  也支持默认插槽 / h 函数：
    <TextEllipsis mode="middle">一段很长的文字</TextEllipsis>
    h(TextEllipsis, { mode: 'middle' }, () => '一段很长的文字')
    <TextEllipsis :content="() => h('b', '一段很长的文字')" mode="middle" />
-->
<script lang="ts">
import {
  cloneVNode,
  Comment,
  computed,
  createTextVNode,
  defineComponent,
  Fragment,
  isVNode,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  Text,
  useSlots,
  watch,
  type PropType,
  type VNode,
  type VNodeChild,
} from 'vue'

export type EllipsisMode = 'start' | 'middle' | 'end'
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right' | 'auto'
export type EllipsisContent = string | number | VNode | VNode[] | (() => VNodeChild)

export interface TruncateOptions {
  text: string
  maxWidth: number
  measure: (s: string) => number
  ellipsis: string
  mode: EllipsisMode
  balance: number
}

export interface TruncateResult {
  text: string
  truncated: boolean
  /** 保留的前缀字符数（码点） */
  headLen: number
  /** 保留的后缀字符数（码点） */
  tailLen: number
}

/** 递归提取 VNode 树里的纯文本，用于宽度测量与截断计算 */
export function vnodeToText(node: VNodeChild): string {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(vnodeToText).join('')
  if (!isVNode(node)) return ''
  if (node.type === Comment) return ''
  if (node.type === Text) return vnodeToText(node.children as VNodeChild)
  if (node.type === Fragment) return vnodeToText(node.children as VNodeChild)

  const children = node.children
  if (typeof children === 'string' || Array.isArray(children)) {
    return vnodeToText(children as VNodeChild)
  }
  if (children && typeof children === 'object') {
    const def = (children as Record<string, unknown>).default
    if (typeof def === 'function') return vnodeToText(def() as VNodeChild)
  }
  return ''
}

/** 判断内容里是否含有非文本 VNode（即带标签/样式的富文本） */
function hasRichNode(nodes: VNodeChild[]): boolean {
  return nodes.some((node) => isVNode(node) && node.type !== Text && node.type !== Comment)
}

interface SliceState {
  pos: number
}

function sliceOne(
  node: VNodeChild,
  start: number,
  end: number,
  state: SliceState,
): VNodeChild[] {
  if (node == null || typeof node === 'boolean') return []

  if (typeof node === 'string' || typeof node === 'number') {
    const chars = Array.from(String(node))
    const from = state.pos
    state.pos += chars.length
    if (from >= end) return []
    const a = Math.max(0, start - from)
    const b = Math.min(chars.length, end - from)
    return b > a ? [chars.slice(a, b).join('')] : []
  }

  if (Array.isArray(node)) {
    const out: VNodeChild[] = []
    for (const child of node) out.push(...sliceOne(child, start, end, state))
    return out
  }

  if (!isVNode(node) || node.type === Comment) return []
  if (node.type === Text) return sliceOne(node.children as VNodeChild, start, end, state)
  if (node.type === Fragment) return sliceOne(node.children as VNodeChild, start, end, state)

  const children = node.children
  if (typeof children === 'string' || Array.isArray(children)) {
    const kept = sliceOne(children as VNodeChild, start, end, state)
    if (!kept.length) return []
    const cloned = cloneVNode(node)
    cloned.children = kept
    return [cloned]
  }
  if (children && typeof children === 'object') {
    const def = (children as Record<string, unknown>).default
    if (typeof def === 'function') {
      const kept = sliceOne(def() as VNodeChild, start, end, state)
      if (!kept.length) return []
      const cloned = cloneVNode(node)
      cloned.children = { default: () => kept }
      return [cloned]
    }
  }
  return []
}

/** 按全局字符区间 [start, end) 裁剪 VNode 树，保留原有标签与样式 */
export function sliceVNodes(nodes: VNodeChild[], start: number, end: number): VNodeChild[] {
  const state: SliceState = { pos: 0 }
  const result: VNodeChild[] = []
  for (const node of nodes) {
    result.push(...sliceOne(node, start, end, state))
    if (state.pos >= end) break
  }
  return result
}

/**
 * 纯函数版截断逻辑，可单独引入做单元测试
 */
export function truncateText(options: TruncateOptions): TruncateResult {
  const { text, maxWidth, measure, ellipsis, mode, balance } = options

  // 按码点切分，避免 emoji / 代理对被截断成乱码
  const chars = Array.from(text)
  const total = chars.length

  if (!text) return { text: '', truncated: false, headLen: 0, tailLen: 0 }
  if (maxWidth <= 0) return { text: '', truncated: true, headLen: 0, tailLen: 0 }
  if (measure(text) <= maxWidth) return { text, truncated: false, headLen: total, tailLen: 0 }
  const ellipsisWidth = measure(ellipsis)

  // 连省略号都放不下
  if (ellipsisWidth >= maxWidth) return { text: '', truncated: true, headLen: 0, tailLen: 0 }

  const avail = maxWidth - ellipsisWidth
  const head = (len: number) => chars.slice(0, len).join('')
  const tail = (len: number) => chars.slice(total - len).join('')

  /** 在 [0, limit] 内二分，找到宽度不超过 budget 的最大前缀长度 */
  const maxHeadLen = (budget: number, limit = total) => {
    if (budget <= 0) return 0
    let lo = 0
    let hi = Math.min(limit, total)
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1
      if (measure(head(mid)) <= budget) lo = mid
      else hi = mid - 1
    }
    return lo
  }

  /** 在 [0, limit] 内二分，找到宽度不超过 budget 的最大后缀长度 */
  const maxTailLen = (budget: number, limit = total) => {
    if (budget <= 0) return 0
    let lo = 0
    let hi = Math.min(limit, total)
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1
      if (measure(tail(mid)) <= budget) lo = mid
      else hi = mid - 1
    }
    return lo
  }

  if (mode === 'end') {
    const len = maxHeadLen(avail)
    return { text: len > 0 ? head(len) + ellipsis : ellipsis, truncated: true, headLen: len, tailLen: 0 }
  }

  if (mode === 'start') {
    const len = maxTailLen(avail)
    return { text: len > 0 ? ellipsis + tail(len) : ellipsis, truncated: true, headLen: 0, tailLen: len }
  }

  // ---- middle：按 balance 分配首尾预算，一侧放不满时把余量补给另一侧 ----
  const ratio = Math.min(Math.max(balance, 0.1), 0.9)
  let headLen = maxHeadLen(avail * ratio)
  const headWidth = measure(head(headLen))
  let tailLen = maxTailLen(avail - headWidth, total - headLen)
  const tailWidth = measure(tail(tailLen))

  const leftover = avail - headWidth - tailWidth
  if (leftover > 0.5) {
    const widened = maxHeadLen(headWidth + leftover, total - tailLen)
    if (widened > headLen) headLen = widened
  }

  if (headLen === 0 && tailLen === 0) return { text: ellipsis, truncated: true, headLen: 0, tailLen: 0 }
  if (headLen + tailLen >= total) return { text, truncated: false, headLen: total, tailLen: 0 }

  return { text: head(headLen) + ellipsis + tail(tailLen), truncated: true, headLen, tailLen }
}
</script>

<script setup lang="ts">
const slots = useSlots()

/** 内部渲染器：把 VNode 数组渲染成片段，纯文本包成文本节点，并补 key */
const VNodeList = defineComponent({
  name: 'TextEllipsisVNodeList',
  props: {
    nodes: { type: Array as PropType<VNodeChild[]>, required: true },
  },
  setup(props) {
    return () =>
      props.nodes.map((node, index) => {
        const vnode =
          typeof node === 'string' || typeof node === 'number'
            ? createTextVNode(String(node))
            : (node as VNode)
        return cloneVNode(vnode, { key: index })
      })
  },
})

const props = withDefaults(
  defineProps<{
    /**
     * 完整文本。也可不传 text，改用默认插槽或 content（h 函数 / VNode）。
     * 优先级：默认插槽 > content > text
     */
    text?: string | number
    /** 内容，支持字符串 / VNode / 返回 VNode 的函数（h 函数） */
    content?: EllipsisContent
    /** 省略位置：start 前置省略 / middle 中间省略 / end 后置省略 */
    mode?: EllipsisMode
    /** 省略符 */
    ellipsis?: string
    /** 中间省略时首部占比，0.1 ~ 0.9 */
    balance?: number
    /** 是否启用悬浮提示 */
    tooltip?: boolean
    /** 未发生截断时是否也显示悬浮提示 */
    tooltipAlways?: boolean
    /** 悬浮层位置，空间不足时自动翻转到另一侧 */
    placement?: TooltipPlacement
    /** 悬浮延迟（ms） */
    tooltipDelay?: number
    /** 悬浮层最大宽度（px） */
    tooltipMaxWidth?: number
    /** 使用行内块布局（默认块级，宽度由父级约束） */
    inline?: boolean
    /**
     * 行内自适应（零配置，默认开启）：组件自动把父容器变成 flex 行并按内容占空间，
     * 短文本不留白、长文本省略。父容器本来就是 flex 时不会接管；传 false 可关闭。
     */
    fluid?: boolean
  }>(),
  {
    mode: 'end',
    ellipsis: '…',
    balance: 0.5,
    tooltip: true,
    tooltipAlways: false,
    placement: 'top',
    tooltipDelay: 60,
    tooltipMaxWidth: 420,
    inline: false,
    fluid: true,
  },
)

const rootRef = ref<HTMLElement | null>(null)
const tooltipRef = ref<HTMLElement | null>(null)

/**
 * 把内容来源统一解析成 VNode 子节点数组：
 *   1. 默认插槽（<TextEllipsis>文字</TextEllipsis>，h 的第三个参数函数也是这个）
 *   2. content prop（字符串 / VNode / () => VNodeChild）
 *   3. text prop
 */
const sourceNodes = computed<VNodeChild[]>(() => {
  if (slots.default) {
    const nodes = slots.default()
    if (nodes?.length) return nodes
  }
  if (props.content != null) {
    const value = typeof props.content === 'function' ? props.content() : props.content
    return Array.isArray(value) ? value : [value as VNodeChild]
  }
  return [props.text == null ? '' : String(props.text)]
})

/** 从 VNode 树提取的纯文本，用于宽度测量与二分截断 */
const fullText = computed(() => sourceNodes.value.map(vnodeToText).join(''))
/** 是否含富文本节点（带标签 / 样式），决定截断后如何渲染 */
const isRich = computed(() => hasRichNode(sourceNodes.value))

/** 最终渲染的内容节点：富文本裁剪 VNode 树，纯文本直接用字符串（省一层 VNode） */
const displayNodes = computed<VNodeChild[]>(() => {
  const full = fullText.value
  const total = Array.from(full).length
  const start = cutRange.value

  if (!start.truncated || !isRich.value) {
    return [displayText.value]
  }

  const head = sliceVNodes(sourceNodes.value, 0, start.headLen)
  const tail = start.tailLen > 0
    ? sliceVNodes(sourceNodes.value, total - start.tailLen, total)
    : []

  if (props.mode === 'end') return [...head, createTextVNode(props.ellipsis)]
  if (props.mode === 'start') return [createTextVNode(props.ellipsis), ...tail]
  return [...head, createTextVNode(props.ellipsis), ...tail]
})

/** 当前截断的字符范围，由 compute 写入 */
const cutRange = ref({ truncated: false, headLen: 0, tailLen: 0 })

const displayText = ref(fullText.value)
const truncated = ref(false)

/* ------------------------------------------------------------------ *
 * 文本测量
 * ------------------------------------------------------------------ */

let measure: ((s: string) => number) | null = null
let measureFontKey = ''

function createMeasurer(el: HTMLElement): (s: string) => number {
  const cs = getComputedStyle(el)
  const fontKey = [cs.fontStyle, cs.fontWeight, cs.fontSize, cs.fontFamily, cs.letterSpacing].join('|')

  if (measure && fontKey === measureFontKey) return measure

  const ctx = document.createElement('canvas').getContext('2d')
  if (!ctx) {
    // 极端降级：拿不到 canvas 就按固定字宽估算
    return (s: string) => Array.from(s).length * 8
  }

  const font = cs.font || `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
  ctx.font = font

  const letterSpacing = Number.parseFloat(cs.letterSpacing)
  if (!Number.isNaN(letterSpacing) && letterSpacing !== 0 && 'letterSpacing' in ctx) {
    ;(ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${letterSpacing}px`
  }

  measureFontKey = fontKey
  measure = (s: string) => (s ? ctx.measureText(s).width : 0)
  return measure
}

/* ------------------------------------------------------------------ *
 * 核心计算
 * ------------------------------------------------------------------ */

/** 允许的亚像素误差：完整文本比容器宽不到 1px 时视为放得下，避免"截一个字→变窄→再截"的雪崩 */
const SAFE_EPS = 1

/** 元素内容区宽度（clientWidth 含 padding，要减掉） */
function contentWidth(el: HTMLElement | null): number {
  if (!el) return 0
  const cs = getComputedStyle(el)
  const padX = (Number.parseFloat(cs.paddingLeft) || 0) + (Number.parseFloat(cs.paddingRight) || 0)
  return Math.max(0, el.clientWidth - padX)
}

/*
 * 测量基准宽度（baselineWidth）
 *
 * 为什么要缓存：元素宽度在某些布局下（flex item、inline-block、绝对定位）
 * 由自身内容撑开，一旦按"当前宽度"去截断，内容变短 → 宽度变小 → 下帧截得更短，
 * 形成单向收敛，最后文字缩成一小撮。
 *
 * 因此：父容器尺寸变化时（外部原因）才重置基准，否则只允许变大。
 */
let baselineWidth = 0
let lastParentWidth = -1

function compute() {
  const el = rootRef.value
  if (!el) return

  const full = fullText.value
  if (!full) {
    displayText.value = ''
    truncated.value = false
    cutRange.value = { truncated: false, headLen: 0, tailLen: 0 }
    return
  }

  const available = contentWidth(el)

  // 元素不可见（display:none / 宽度为 0）时不做截断，等 ResizeObserver 再次触发
  if (available <= 0) {
    displayText.value = full
    truncated.value = false
    cutRange.value = { truncated: false, headLen: Array.from(full).length, tailLen: 0 }
    return
  }

  // 父容器可用宽度变了 => 外部布局变化，重新以当前宽度为基准
  // 父容器没变 => 宽度变化只可能来自我们自己的截断结果，保持较大基准
  const parentWidth = contentWidth(el.parentElement)
  if (baselineWidth <= 0 || Math.abs(parentWidth - lastParentWidth) > 0.5) {
    baselineWidth = available
  } else if (available > baselineWidth) {
    baselineWidth = available
  }
  lastParentWidth = parentWidth

  const measure = createMeasurer(el)

  // fluid 模式：把最大宽度限制为完整文本宽度。
  // flex:1 会无条件吃满剩余空间，文字短时右侧留下大片空白；限制 max-width 后，
  // 组件最多和文字一样宽，右侧内容紧跟其后；文字长时仍由 flex 分配剩余空间并省略。
  if (props.fluid) {
    const cs = getComputedStyle(el)
    const extraX =
      (Number.parseFloat(cs.paddingLeft) || 0) +
      (Number.parseFloat(cs.paddingRight) || 0) +
      (Number.parseFloat(cs.borderLeftWidth) || 0) +
      (Number.parseFloat(cs.borderRightWidth) || 0)
    const maxW = `${Math.ceil(measure(full) + extraX)}px`
    if (el.style.maxWidth !== maxW) el.style.maxWidth = maxW
  }

  // 完整文本放得下（含 1px 容差）就原样显示
  if (measure(full) <= baselineWidth + SAFE_EPS) {
    displayText.value = full
    truncated.value = false
    cutRange.value = { truncated: false, headLen: Array.from(full).length, tailLen: 0 }
    return
  }

  const options = {
    text: full,
    measure,
    ellipsis: props.ellipsis,
    mode: props.mode,
    balance: props.balance,
  }

  let result = truncateText({ ...options, maxWidth: baselineWidth })

  // 兜底：若基准偏大导致结果仍溢出容器，退回到真实可用宽度重算
  if (measure(result.text) > available + SAFE_EPS) {
    baselineWidth = available
    result = truncateText({ ...options, maxWidth: available })
  }

  displayText.value = result.text
  truncated.value = result.truncated
  cutRange.value = { truncated: result.truncated, headLen: result.headLen, tailLen: result.tailLen }
}

let rafId = 0
function scheduleCompute() {
  if (rafId) return
  rafId = requestAnimationFrame(() => {
    rafId = 0
    compute()
  })
}

/* ------------------------------------------------------------------ *
 * 悬浮提示
 * ------------------------------------------------------------------ */

const tooltipVisible = ref(false)
const tooltipStyle = ref<Record<string, string>>({})
/** 实际生效的方位（可能与传入值不同：空间不足时会自动翻转） */
const resolvedPlacement = ref<TooltipPlacement>('top')

const hoverable = computed(() => props.tooltip && (props.tooltipAlways || truncated.value))

let showTimer: number | undefined
let hideTimer: number | undefined
/** 鼠标离开触发元素后延迟关闭，留出时间移入浮层（跨越 GAP 间隙） */
const HIDE_DELAY = 180

const GAP = 8
const EDGE = 8
/** 箭头中心距浮层边缘的最小距离，防止箭头跑出圆角外 */
const ARROW_INSET = 12

function updatePosition() {
  const trigger = rootRef.value
  const tip = tooltipRef.value
  if (!trigger || !tip) return

  const r = trigger.getBoundingClientRect()
  const t = tip.getBoundingClientRect()
  const vw = document.documentElement.clientWidth
  const vh = document.documentElement.clientHeight

  const fitsTop = r.top - GAP >= t.height
  const fitsBottom = vh - r.bottom - GAP >= t.height
  const fitsLeft = r.left - GAP >= t.width
  const fitsRight = vw - r.right - GAP >= t.width

  let placement = props.placement
  if (placement === 'auto') {
    // 优先上方，上方放不下才考虑下方
    placement = fitsTop || !fitsBottom ? 'top' : 'bottom'
  }
  // 指定方位空间不足时自动翻转到另一侧
  if (placement === 'top' && !fitsTop && fitsBottom) placement = 'bottom'
  if (placement === 'bottom' && !fitsBottom && fitsTop) placement = 'top'
  if (placement === 'left' && !fitsLeft && fitsRight) placement = 'right'
  if (placement === 'right' && !fitsRight && fitsLeft) placement = 'left'

  let top = 0
  let left = 0

  switch (placement) {
    case 'top':
      top = r.top - GAP - t.height
      left = r.left + r.width / 2 - t.width / 2
      break
    case 'bottom':
      top = r.bottom + GAP
      left = r.left + r.width / 2 - t.width / 2
      break
    case 'left':
      top = r.top + r.height / 2 - t.height / 2
      left = r.left - GAP - t.width
      break
    case 'right':
      top = r.top + r.height / 2 - t.height / 2
      left = r.right + GAP
      break
  }

  // 视口边界收敛
  left = Math.min(Math.max(EDGE, left), Math.max(EDGE, vw - t.width - EDGE))
  top = Math.min(Math.max(EDGE, top), Math.max(EDGE, vh - t.height - EDGE))

  resolvedPlacement.value = placement

  const style: Record<string, string> = {
    top: `${Math.round(top)}px`,
    left: `${Math.round(left)}px`,
    maxWidth: `${props.tooltipMaxWidth}px`,
  }

  // 箭头对准触发元素中心；浮层贴边时箭头收回到边缘内侧
  const maxArrowX = Math.max(ARROW_INSET, t.width - ARROW_INSET)
  const maxArrowY = Math.max(ARROW_INSET, t.height - ARROW_INSET)
  if (placement === 'top' || placement === 'bottom') {
    const x = r.left + r.width / 2 - left
    style['--te-arrow-x'] = `${Math.round(Math.min(Math.max(x, ARROW_INSET), maxArrowX))}px`
  } else {
    const y = r.top + r.height / 2 - top
    style['--te-arrow-y'] = `${Math.round(Math.min(Math.max(y, ARROW_INSET), maxArrowY))}px`
  }

  tooltipStyle.value = style
}

function onViewportChange() {
  const trigger = rootRef.value
  if (!trigger) return

  // 滚动导致触发元素离开视口时直接关闭，避免浮层贴在视口边缘
  const rect = trigger.getBoundingClientRect()
  const vh = document.documentElement.clientHeight
  if (rect.bottom < 0 || rect.top > vh) {
    closeTooltip()
    return
  }

  updatePosition()
}

/** 浮层尺寸变化（换行、字体加载）后重新定位，保证箭头始终对准触发元素 */
let tipRO: ResizeObserver | null = null

async function openTooltip() {
  if (tooltipVisible.value || !hoverable.value) return

  // 首帧就带上宽度限制：否则浏览器先按单行排版，定位时算到的是错误的高度/宽度，
  // 换行生效后浮层尺寸变了，箭头就会与触发文字错开
  tooltipStyle.value = {
    top: '-9999px',
    left: '-9999px',
    maxWidth: `${props.tooltipMaxWidth}px`,
  }
  tooltipVisible.value = true

  await nextTick()
  updatePosition()

  // 字体回退、异步布局可能下一帧才稳定，再校正一次
  requestAnimationFrame(updatePosition)

  if (typeof ResizeObserver !== 'undefined' && tooltipRef.value) {
    tipRO?.disconnect()
    tipRO = new ResizeObserver(() => {
      if (tooltipVisible.value) updatePosition()
    })
    tipRO.observe(tooltipRef.value)
  }

  window.addEventListener('scroll', onViewportChange, true)
  window.addEventListener('resize', onViewportChange)
}

function closeTooltip() {
  window.clearTimeout(hideTimer)
  if (!tooltipVisible.value) return
  tooltipVisible.value = false
  tipRO?.disconnect()
  tipRO = null
  window.removeEventListener('scroll', onViewportChange, true)
  window.removeEventListener('resize', onViewportChange)
}

function onMouseEnter() {
  if (!hoverable.value) return
  window.clearTimeout(hideTimer)
  window.clearTimeout(showTimer)
  showTimer = window.setTimeout(openTooltip, props.tooltipDelay)
}

function onMouseLeave() {
  window.clearTimeout(showTimer)
  window.clearTimeout(hideTimer)
  hideTimer = window.setTimeout(closeTooltip, HIDE_DELAY)
}

/** 鼠标进入浮层：取消挂起的关闭，保证内容可选中复制 */
function onTooltipEnter() {
  window.clearTimeout(hideTimer)
}

/** 鼠标离开浮层：同样延迟关闭，避免误碰边缘立即消失 */
function onTooltipLeave() {
  window.clearTimeout(hideTimer)
  hideTimer = window.setTimeout(closeTooltip, HIDE_DELAY)
}

/* ------------------------------------------------------------------ *
 * 生命周期
 * ------------------------------------------------------------------ */

/*
 * fluid 模式：组件自己把父容器变成 flex 行，调用方无需写任何样式。
 * 用 WeakMap 记录原 inline 样式 + 引用计数，多个 fluid 子组件共用一个父容器时不会互相冲突；
 * 父容器本来就是 flex 时不接管（尊重调用方自己的布局）。
 */
type FluidStyleKey = 'display' | 'alignItems' | 'whiteSpace' | 'gap'
interface FluidParentState {
  count: number
  injected: boolean
  original: Partial<Record<FluidStyleKey, string>>
}
const fluidParents = new WeakMap<HTMLElement, FluidParentState>()
const FLUID_KEYS: FluidStyleKey[] = ['display', 'alignItems', 'whiteSpace', 'gap']

function injectFluidParent(el: HTMLElement): HTMLElement | null {
  const parent = el.parentElement
  if (!parent) return null

  const cs = getComputedStyle(parent)
  if (cs.display === 'flex' || cs.display === 'inline-flex') return null

  let state = fluidParents.get(parent)
  if (!state) {
    state = { count: 0, injected: false, original: {} }
    fluidParents.set(parent, state)
  }
  if (!state.injected) {
    FLUID_KEYS.forEach((key) => {
      state!.original[key] = parent.style[key]
    })
    parent.style.display = 'flex'
    parent.style.alignItems = 'baseline'
    parent.style.whiteSpace = 'nowrap'
    if (!parent.style.gap) parent.style.gap = '4px'
    state.injected = true
  }
  state.count++
  return parent
}

function restoreFluidParent(parent: HTMLElement | null) {
  if (!parent) return
  const state = fluidParents.get(parent)
  if (!state) return
  state.count--
  if (state.count <= 0 && state.injected) {
    FLUID_KEYS.forEach((key) => {
      parent.style[key] = state.original[key] ?? ''
    })
    fluidParents.delete(parent)
  }
}

let fluidParent: HTMLElement | null = null
let ro: ResizeObserver | null = null

onMounted(() => {
  if (props.fluid && rootRef.value) fluidParent = injectFluidParent(rootRef.value)
  compute()

  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(() => scheduleCompute())
    if (rootRef.value) ro.observe(rootRef.value)
  } else {
    window.addEventListener('resize', scheduleCompute)
  }

  // 字体加载完成后再算一次，避免首次用后备字体测量导致截断位置偏移
  document.fonts?.ready.then(() => scheduleCompute()).catch(() => {})
})

onBeforeUnmount(() => {
  window.clearTimeout(showTimer)
  window.clearTimeout(hideTimer)
  closeTooltip()
  restoreFluidParent(fluidParent)
  fluidParent = null
  tipRO?.disconnect()
  tipRO = null
  ro?.disconnect()
  ro = null
  window.removeEventListener('resize', scheduleCompute)
  if (rafId) cancelAnimationFrame(rafId)
})

watch(
  () => [fullText.value, props.mode, props.ellipsis, props.balance] as const,
  () => {
    // 先回填完整文本，避免旧内容停留一帧
    displayText.value = fullText.value
    truncated.value = false
    cutRange.value = { truncated: false, headLen: Array.from(fullText.value).length, tailLen: 0 }
    // 文本/配置变了，基准宽度需要重新确定
    baselineWidth = 0
    lastParentWidth = -1
    scheduleCompute()
  },
)

watch(
  () => props.fluid,
  (enabled) => {
    if (!rootRef.value) return
    if (enabled) {
      fluidParent = injectFluidParent(rootRef.value)
    } else {
      restoreFluidParent(fluidParent)
      fluidParent = null
      rootRef.value.style.maxWidth = ''
    }
    scheduleCompute()
  },
)

defineExpose({ refresh: scheduleCompute })
</script>

<template>
  <span
    ref="rootRef"
    class="te-root"
    :class="{ 'te-root--inline': inline, 'te-root--fluid': fluid }"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @focusin="onMouseEnter"
    @focusout="onMouseLeave"
  >
    <span class="te-root__text"><VNodeList :nodes="displayNodes" /></span>

    <Teleport to="body">
      <Transition name="te-fade">
        <div
          v-if="tooltipVisible"
          ref="tooltipRef"
          class="te-tooltip"
          :class="`te-tooltip--${resolvedPlacement}`"
          role="tooltip"
          :style="tooltipStyle"
          @mouseenter="onTooltipEnter"
          @mouseleave="onTooltipLeave"
        >
          <VNodeList :nodes="sourceNodes" />
        </div>
      </Transition>
    </Teleport>
  </span>
</template>

<style scoped>
.te-root {
  display: block;
  box-sizing: border-box;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  vertical-align: bottom;
}

.te-root--inline {
  display: inline-block;
}

/* flex 父容器中占满剩余空间；min-width:0 是 flex item 能收缩到内容以下的前提。
   最大宽度由 JS 限制为完整文本宽度，避免短文本时撑出空白 */
.te-root--fluid {
  flex: 1 1 0;
  min-width: 0;
}

.te-root__text {
  white-space: nowrap;
}

.te-tooltip {
  position: fixed;
  z-index: 9999;
  box-sizing: border-box;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(17, 24, 39, 0.94);
  color: #fff;
  font-family: inherit;
  font-size: 12px;
  line-height: 1.55;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
  pointer-events: auto;
  user-select: text;
  cursor: auto;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
}

/* ---- 指向触发元素的箭头（border 三角，颜色与浮层一致） ---- */

.te-tooltip::after {
  content: '';
  position: absolute;
  width: 0;
  height: 0;
  border: 6px solid transparent;
}

/* 浮层在上方：底部向下的小箭头 */
.te-tooltip--top::after {
  top: 100%;
  left: var(--te-arrow-x, 50%);
  transform: translateX(-50%);
  border-top-color: rgba(17, 24, 39, 0.94);
  border-bottom-width: 0;
}

/* 浮层在下方：顶部向上的小箭头 */
.te-tooltip--bottom::after {
  bottom: 100%;
  left: var(--te-arrow-x, 50%);
  transform: translateX(-50%);
  border-bottom-color: rgba(17, 24, 39, 0.94);
  border-top-width: 0;
}

/* 浮层在左侧：右侧向右的小箭头 */
.te-tooltip--left::after {
  left: 100%;
  top: var(--te-arrow-y, 50%);
  transform: translateY(-50%);
  border-left-color: rgba(17, 24, 39, 0.94);
  border-right-width: 0;
}

/* 浮层在右侧：左侧向左的小箭头 */
.te-tooltip--right::after {
  right: 100%;
  top: var(--te-arrow-y, 50%);
  transform: translateY(-50%);
  border-right-color: rgba(17, 24, 39, 0.94);
  border-left-width: 0;
}

.te-fade-enter-active,
.te-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.te-fade-enter-from,
.te-fade-leave-to {
  opacity: 0;
  transform: translateY(-2px);
}
</style>
