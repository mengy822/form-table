// composables/useLoadingCursor.ts
import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export interface UseLoadingCursorOptions {
  /** 光标水平偏移量（px），默认 16 */
  offsetX?: number
  /** 光标垂直偏移量（px），默认 16 */
  offsetY?: number
  /** 光标尺寸（px），默认 16 */
  cursorSize?: number
  /** 主色 CSS 变量名，默认 '--el-color-primary' */
  primaryColorVar?: string
  /** 浅色 CSS 变量名，默认 '--el-color-primary-light-3' */
  lightColorVar?: string
}

export interface UseLoadingCursorReturn {
  /** 是否正在加载中 */
  isLoading: Ref<boolean>
  /** 开始加载（显示自定义光标动画） */
  startLoading: () => void
  /** 结束加载（隐藏自定义光标动画） */
  stopLoading: () => void
}

/**
 * 极致性能鼠标 Loading 动画 Hook
 *
 * @description 页面卡顿时仍能保持跟随的优化方案
 * @performance 关键优化：
 * 1. 使用 requestAnimationFrame 节流，避免主线程阻塞
 * 2. 卡顿时丢帧但保证最终位置正确
 * 3. 圆点完美居中，支持 Element Plus CSS 变量
 */
export function useLoadingCursor(options: UseLoadingCursorOptions = {}): UseLoadingCursorReturn {
  const {
    offsetX = 16,
    offsetY = 16,
    cursorSize = 16,
    primaryColorVar = '--el-color-primary',
    lightColorVar = '--el-color-primary-light-3'
  } = options

  const isLoading = ref(false)

  // 静态变量
  let cursorEl: HTMLElement | null = null
  let isMouseInside = false
  let active = false

  // 边界缓存
  let viewportW = 0
  let viewportH = 0

  // 颜色缓存
  let primaryColor = ''
  let lightColor = ''

  // 节流标志
  let pendingUpdate = false
  let rafId: number | null = null
  let currentMouseX = 0
  let currentMouseY = 0

  const getCssVar = (varName: string): string => {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
  }

  const updateColors = () => {
    const newPrimary = getCssVar(primaryColorVar)
    const newLight = getCssVar(lightColorVar)
    if (newPrimary) primaryColor = newPrimary
    if (newLight) lightColor = newLight
    if (!primaryColor) primaryColor = '#409eff'
    if (!lightColor) lightColor = '#79bbff'
  }

  /** 创建光标元素 */
  const createCursorElement = (): HTMLElement => {
    const existing = document.getElementById('lc')
    if (existing) return existing

    updateColors()

    const div = document.createElement('div')
    div.id = 'lc'

    div.style.cssText = `
      position:fixed;
      top:0;
      left:0;
      width:${cursorSize}px;
      height:${cursorSize}px;
      pointer-events:none;
      z-index:99999;
      will-change:transform;
      display:none;
    `

    // 圆点大小：cursorSize 的 30%，最小 4px，最大 8px
    const dotSize = Math.min(8, Math.max(4, Math.floor(cursorSize * 0.3)))

    div.innerHTML = `
      <style>
        .lc-i {
          position:relative;
          width:100%;
          height:100%;
          animation:lc-pulse 0.6s ease-in-out infinite alternate;
          will-change: transform;
        }
        .lc-r {
          position:absolute;
          inset:0;
          border-radius:50%;
          border:1.5px solid ${lightColor};
          border-top-color:${primaryColor};
          border-right-color:${primaryColor};
          animation:lc-spin 0.6s linear infinite;
          box-shadow:0 0 3px ${primaryColor}40;
        }
        .lc-d {
          position:absolute;
          top:50%;
          left:50%;
          width:${dotSize}px;
          height:${dotSize}px;
          background:${primaryColor};
          border-radius:50%;
          transform:translate(-50%, -50%);
          animation:lc-blink 0.8s ease-in-out infinite;
          box-shadow:0 0 4px ${primaryColor};
        }
        @keyframes lc-spin {
          0%{transform:rotate(0deg)}
          100%{transform:rotate(360deg)}
        }
        @keyframes lc-pulse {
          0%{transform:scale(0.85);opacity:0.7}
          100%{transform:scale(1.1);opacity:1}
        }
        @keyframes lc-blink {
          0%,100%{opacity:0.5;transform:translate(-50%,-50%) scale(0.7)}
          50%{opacity:1;transform:translate(-50%,-50%) scale(1.2)}
        }
      </style>
      <div class="lc-i"><div class="lc-r"></div><div class="lc-d"></div></div>
    `

    document.body.appendChild(div)
    return div
  }

  const updateDisplay = () => {
    if (!cursorEl) return
    const shouldShow = isLoading.value && isMouseInside
    cursorEl.style.display = shouldShow ? 'block' : 'none'
  }

  /** 提交位置更新 */
  const commitPosition = () => {
    if (!cursorEl || !isMouseInside) return

    let x = currentMouseX + offsetX
    let y = currentMouseY + offsetY

    // 边界检查
    if (x + cursorSize > viewportW) x = viewportW - cursorSize - 2
    if (y + cursorSize > viewportH) y = viewportH - cursorSize - 2
    if (x < 2) x = 2
    if (y < 2) y = 2

    cursorEl.style.transform = `translate3d(${x}px, ${y}px, 0)`
  }

  /** 使用 requestAnimationFrame 节流更新位置 */
  const schedulePositionUpdate = () => {
    if (pendingUpdate) return
    pendingUpdate = true
    rafId = requestAnimationFrame(() => {
      commitPosition()
      pendingUpdate = false
    })
  }

  /** 鼠标移动 - 只记录坐标 */
  const onMove = (e: MouseEvent) => {
    if (!isMouseInside) return
    currentMouseX = e.clientX
    currentMouseY = e.clientY
    if (isLoading.value) {
      schedulePositionUpdate()
    }
  }

  /** 立即更新位置 */
  const updatePositionImmediate = () => {
    if (pendingUpdate) {
      cancelAnimationFrame(rafId!)
      pendingUpdate = false
    }
    commitPosition()
  }

  const onLeave = () => {
    isMouseInside = false
    if (cursorEl) {
      cursorEl.style.display = 'none'
    }
  }

  const onEnter = (e: MouseEvent) => {
    isMouseInside = true
    currentMouseX = e.clientX
    currentMouseY = e.clientY
    if (isLoading.value) {
      updatePositionImmediate()
      updateDisplay()
    }
  }

  const onResize = () => {
    viewportW = window.innerWidth
    viewportH = window.innerHeight
    if (isLoading.value && isMouseInside) {
      updatePositionImmediate()
    }
  }

  /** 监听 CSS 变量变化 */
  let colorObserver: MutationObserver | null = null

  const watchCssVariables = () => {
    colorObserver = new MutationObserver(() => {
      const newPrimary = getCssVar(primaryColorVar)
      const newLight = getCssVar(lightColorVar)

      if (newPrimary && newPrimary !== primaryColor) {
        primaryColor = newPrimary
        if (cursorEl) {
          const styleEl = cursorEl.querySelector('style')
          if (styleEl) {
            let content = styleEl.innerHTML
            content = content.replace(/border-top-color:[^;]+;/, `border-top-color:${primaryColor};`)
            content = content.replace(/border-right-color:[^;]+;/, `border-right-color:${primaryColor};`)
            content = content.replace(/background:[^;]+;/, `background:${primaryColor};`)
            content = content.replace(/box-shadow:0 0 4px [^;]+;/, `box-shadow:0 0 4px ${primaryColor};`)
            styleEl.innerHTML = content
          }
        }
      }

      if (newLight && newLight !== lightColor) {
        lightColor = newLight
        if (cursorEl) {
          const styleEl = cursorEl.querySelector('style')
          if (styleEl) {
            let content = styleEl.innerHTML
            content = content.replace(/border:1.5px solid [^;]+;/, `border:1.5px solid ${lightColor};`)
            styleEl.innerHTML = content
          }
        }
      }
    })

    colorObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style', 'class']
    })
  }

  // ========== 公共 API ==========

  const startLoading = () => {
    if (isLoading.value) return
    isLoading.value = true
    if (isMouseInside && cursorEl) {
      updatePositionImmediate()
      cursorEl.style.display = 'block'
    }
  }

  const stopLoading = () => {
    if (!isLoading.value) return
    isLoading.value = false
    if (cursorEl) {
      cursorEl.style.display = 'none'
    }
  }

  // ========== 初始化 ==========
  onMounted(() => {
    cursorEl = createCursorElement()
    viewportW = window.innerWidth
    viewportH = window.innerHeight
    isMouseInside = false

    window.addEventListener('mousemove', onMove, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeave)
    document.documentElement.addEventListener('mouseenter', onEnter)
    window.addEventListener('resize', onResize, { passive: true })

    watchCssVariables()

    active = true
  })

  onUnmounted(() => {
    active = false
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
    if (colorObserver) {
      colorObserver.disconnect()
      colorObserver = null
    }
    window.removeEventListener('mousemove', onMove)
    document.documentElement.removeEventListener('mouseleave', onLeave)
    document.documentElement.removeEventListener('mouseenter', onEnter)
    window.removeEventListener('resize', onResize)

    if (cursorEl?.parentNode) {
      cursorEl.parentNode.removeChild(cursorEl)
    }
    cursorEl = null
  })

  return {
    isLoading,
    startLoading,
    stopLoading
  }
}
