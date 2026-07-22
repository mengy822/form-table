const easeInOutQuad = (t: number, b: number, c: number, d: number) => {
  t /= d / 2
  if (t < 1) {
    return (c / 2) * t * t + b
  }
  t--
  return (-c / 2) * (t * (t - 2) - 1) + b
}

// requestAnimationFrame for Smart Animating http://goo.gl/sx5sts
const requestAnimFrame = (function () {
  return (
    window.requestAnimationFrame ||
    (window as any).webkitRequestAnimationFrame ||
    (window as any).mozRequestAnimationFrame ||
    function (callback) {
      return window.setTimeout(callback, 1000 / 60)
    }
  )
})()

// 取消动画帧的兼容函数
const cancelAnimFrame = (function () {
  return (
    window.cancelAnimationFrame ||
    (window as any).webkitCancelAnimationFrame ||
    (window as any).mozCancelAnimationFrame ||
    function (id) {
      window.clearTimeout(id)
    }
  )
})()

/**
 * Because it's so fucking difficult to detect the scrolling element, just move them all
 * @param {number} amount
 */
const move = (dom?: HTMLElement, amount: number) => {
  if (dom) {
    dom.scrollTop = amount
    return
  }
  document.documentElement.scrollTop = amount
  ;(document.body.parentNode as HTMLElement).scrollTop = amount
  document.body.scrollTop = amount
}

const position = (dom?: HTMLElement) => {
  return (
    dom?.scrollTop ||
    document.documentElement.scrollTop ||
    (document.body.parentNode as HTMLElement).scrollTop ||
    document.body.scrollTop
  )
}

// 存储当前活跃的动画 ID
let activeAnimationId: number | null = null
// 存储当前动画的取消标志
let isCurrentAnimationCancelled = false

/**
 * 取消当前正在执行的滚动动画
 */
export const cancelScroll = () => {
  isCurrentAnimationCancelled = true
  if (activeAnimationId !== null) {
    cancelAnimFrame(activeAnimationId)
    activeAnimationId = null
  }
}

/**
 * 滚动到指定位置
 * @param {number} to - 目标滚动位置
 * @param {number} duration - 动画持续时间（毫秒）
 * @param {HTMLElement} dom - 滚动的 DOM 元素（可选）
 * @param {Function} callback - 动画完成回调
 * @returns {Function} 取消函数 - 调用可取消当前动画
 */
export const scrollTo = (
  to: number,
  duration: number,
  dom?: HTMLElement,
  callback?: any,
): (() => void) => {
  // 取消之前的动画
  cancelScroll()

  const start = position(dom)
  const change = to - start
  const increment = 20
  let currentTime = 0
  duration = typeof duration === 'undefined' ? 500 : duration

  // 重置取消标志
  isCurrentAnimationCancelled = false

  const animateScroll = function () {
    // ✅ 检查是否已被取消
    if (isCurrentAnimationCancelled) {
      activeAnimationId = null
      return
    }

    currentTime += increment
    const val = easeInOutQuad(currentTime, start, change, duration)
    move(dom, val)

    if (currentTime < duration) {
      activeAnimationId = requestAnimFrame(animateScroll)
    } else {
      activeAnimationId = null
      if (callback && typeof callback === 'function') {
        callback()
      }
    }
  }

  activeAnimationId = requestAnimFrame(animateScroll)

  // ✅ 返回取消函数，方便调用方在组件销毁时取消
  return () => {
    cancelScroll()
  }
}

/**
 * 滚动到顶部
 * @param {number} duration - 动画持续时间（毫秒）
 * @param {HTMLElement} dom - 滚动的 DOM 元素（可选）
 * @param {Function} callback - 动画完成回调
 * @returns {Function} 取消函数
 */
export const scrollToTop = (
  duration: number = 500,
  dom?: HTMLElement,
  callback?: any,
): (() => void) => {
  return scrollTo(0, duration, dom, callback)
}

/**
 * 滚动到底部
 * @param {number} duration - 动画持续时间（毫秒）
 * @param {HTMLElement} dom - 滚动的 DOM 元素（可选）
 * @param {Function} callback - 动画完成回调
 * @returns {Function} 取消函数
 */
export const scrollToBottom = (
  duration: number = 500,
  dom?: HTMLElement,
  callback?: any,
): (() => void) => {
  const maxScrollTop = dom
    ? dom.scrollHeight - dom.clientHeight
    : document.documentElement.scrollHeight - document.documentElement.clientHeight
  return scrollTo(maxScrollTop, duration, dom, callback)
}
