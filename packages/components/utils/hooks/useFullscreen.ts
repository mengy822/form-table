// composables/useFullscreen.js
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

export function useFullscreen(targetElement1: any, options: { onResize ?:any} = {}) {
  const {
    onResize = null, // 全屏/退出时的回调函数（用于地图重绘）
    onEnter = null, // 进入全屏后的额外回调
    onExit = null, // 退出全屏后的额外回调
    autoResize = true, // 是否自动触发 resize
  } = options
  let targetElement = targetElement1
  const isFullscreen = ref(false)

  const getFullscreenElement = () => {
    return (
      document.fullscreenElement ||
      //@ts-ignore
      document.webkitFullscreenElement ||
      //@ts-ignore
      document.mozFullScreenElement ||
      //@ts-ignore
      document.msFullscreenElement
    )
  }

  /**
   * 触发 resize 回调（关键：用于地图组件刷新）
   */
  const triggerResize = async () => {
    await nextTick() // 等待 DOM 更新完成
    if (typeof onResize === 'function') {
      onResize()
    }
  }

  const enter = async (target: undefined) => {
    if (!targetElement) targetElement = target
    const el = targetElement
    if (!el) {
      console.warn('目标元素不存在')
      return
    }

    if (getFullscreenElement() === el) return

    try {
      // 进入全屏
      if (el.requestFullscreen) {
        await el.requestFullscreen()
      } else if (el.webkitRequestFullScreen) {
        await el.webkitRequestFullScreen()
      } else if (el.mozRequestFullScreen) {
        await el.mozRequestFullScreen()
      } else if (el.msRequestFullscreen) {
        await el.msRequestFullscreen()
      } else {
        console.warn('当前浏览器不支持全屏 API')
        return
      }

      // 全屏后延迟触发 resize（地图需要时间渲染）
      if (autoResize) {
        setTimeout(() => {
          triggerResize()
        }, 100)
      }

      if (typeof onEnter === 'function') {
        onEnter()
      }
    } catch (err) {
      console.error('进入全屏失败:', err)
    }
  }

  const exit = async () => {
    if (!getFullscreenElement()) return

    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen()
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen()
      } else if (document.mozCancelFullScreen) {
        await document.mozCancelFullScreen()
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen()
      } else {
        console.warn('当前浏览器不支持退出全屏')
        return
      }

      // 退出全屏后延迟触发 resize
      if (autoResize) {
        setTimeout(() => {
          triggerResize()
        }, 100)
      }

      if (typeof onExit === 'function') {
        onExit()
      }
    } catch (err) {
      console.error('退出全屏失败:', err)
    }
  }

  const toggle = async (target: undefined) => {
    if (isFullscreen.value) {
      await exit()
    } else {
      await enter(target)
    }
  }

  const onFullscreenChange = () => {
    const currentFullscreenEl = getFullscreenElement()

    if (targetElement?.value) {
      isFullscreen.value = currentFullscreenEl === targetElement.value
    } else {
      isFullscreen.value = !!currentFullscreenEl
    }

    // 状态变化时自动触发 resize（兼容用户按 ESC 退出）
    if (autoResize) {
      setTimeout(() => {
        triggerResize()
      }, 100)
    }
  }

  const onFullscreenError = (err) => {
    console.error('全屏操作失败:', err)
    isFullscreen.value = false
  }

  onMounted(() => {
    document.addEventListener('fullscreenchange', onFullscreenChange)
    document.addEventListener('fullscreenerror', onFullscreenError)
    document.addEventListener('webkitfullscreenchange', onFullscreenChange)
    document.addEventListener('webkitfullscreenerror', onFullscreenError)
    document.addEventListener('mozfullscreenchange', onFullscreenChange)
    document.addEventListener('mozfullscreenerror', onFullscreenError)
    document.addEventListener('msfullscreenchange', onFullscreenChange)
    document.addEventListener('msfullscreenerror', onFullscreenError)

    // 初始化状态
    onFullscreenChange()
  })

  onUnmounted(() => {
    document.removeEventListener('fullscreenchange', onFullscreenChange)
    document.removeEventListener('fullscreenerror', onFullscreenError)
    document.removeEventListener('webkitfullscreenchange', onFullscreenChange)
    document.removeEventListener('webkitfullscreenerror', onFullscreenError)
    document.removeEventListener('mozfullscreenchange', onFullscreenChange)
    document.removeEventListener('mozfullscreenerror', onFullscreenError)
    document.removeEventListener('msfullscreenchange', onFullscreenChange)
    document.removeEventListener('msfullscreenerror', onFullscreenError)
  })

  return { isFullscreen, enter, exit, toggle }
}
