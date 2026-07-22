// hooks/useAutoRefresh.ts
import { ref, onMounted, onUnmounted, computed } from 'vue'

interface UseAutoRefreshOptions {
  interval?: number
  immediate?: boolean
  onRefresh?: () => void | Promise<void>
  retryCount?: number // 错误重试次数，默认 3
  retryDelay?: number // 重试延迟（毫秒），默认 1000
  debounce?: number // 防抖时间（毫秒），默认 0
  enableVisibility?: boolean // 是否启用页面可见性控制，默认 true
}

export const useAutoRefresh = (options: UseAutoRefreshOptions = {}) => {
  const {
    interval = 30000,
    immediate = true,
    onRefresh,
    retryCount = 3,
    retryDelay = 1000,
    debounce = 0,
    enableVisibility = true,
  } = options

  const isRefreshing = ref(false)
  const isAutoRefresh = ref(true)
  const errorCount = ref(0)
  const timer = ref<number | null>(null)
  const debounceTimer = ref<number | null>(null)

  // 带重试的刷新
  const refreshWithRetry = async (): Promise<boolean> => {
    let attempts = 0

    while (attempts < retryCount) {
      try {
        isRefreshing.value = true
        await onRefresh?.()
        errorCount.value = 0
        return true
      } catch (error) {
        attempts++
        errorCount.value = attempts
        console.error(`刷新失败 (${attempts}/${retryCount}):`, error)

        if (attempts < retryCount) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay))
        }
      } finally {
        if (attempts >= retryCount || errorCount.value === 0) {
          isRefreshing.value = false
        }
      }
    }

    isRefreshing.value = false
    return false
  }

  // 刷新（带防抖）
  const refresh = async () => {
    if (debounce > 0) {
      if (debounceTimer.value) {
        clearTimeout(debounceTimer.value)
      }
      return new Promise((resolve) => {
        debounceTimer.value = window.setTimeout(async () => {
          await refreshWithRetry()
          resolve(true)
        }, debounce)
      })
    }

    await refreshWithRetry()
  }

  // 启动定时器
  const start = () => {
    if (!isAutoRefresh.value) return
    stop()
    timer.value = window.setInterval(refresh, interval)
  }

  // 停止定时器
  const stop = () => {
    if (timer.value) {
      clearInterval(timer.value)
      timer.value = null
    }
    if (debounceTimer.value) {
      clearTimeout(debounceTimer.value)
      debounceTimer.value = null
    }
  }

  // 暂停自动刷新
  const pause = () => {
    isAutoRefresh.value = false
    stop()
  }

  // 恢复自动刷新
  const resume = () => {
    isAutoRefresh.value = true
    start()
  }

  // 切换自动刷新
  const toggle = () => {
    if (isAutoRefresh.value) {
      pause()
    } else {
      resume()
    }
  }

  // 手动触发刷新
  const manualRefresh = async () => {
    pause()
    await refresh()
    if (isAutoRefresh.value) {
      start()
    }
  }

  // 重置定时器
  const reset = () => {
    stop()
    if (isAutoRefresh.value) {
      start()
    }
  }

  // 页面可见性变化处理
  const handleVisibilityChange = () => {
    if (!enableVisibility) return

    if (document.hidden) {
      stop()
    } else {
      if (isAutoRefresh.value) {
        start()
      }
    }
  }

  onMounted(() => {
    if (immediate) {
      refresh()
    }
    start()

    if (enableVisibility) {
      document.addEventListener('visibilitychange', handleVisibilityChange)
    }
  })

  onUnmounted(() => {
    stop()
    if (enableVisibility) {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  })

  return {
    isRefreshing,
    isAutoRefresh,
    errorCount,
    refresh: manualRefresh,
    start,
    stop,
    pause,
    resume,
    toggle,
    reset,
  }
}
