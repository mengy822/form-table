import { interceptorsMapType, virtualConfig } from './types'

// ==================== 类型定义 ====================
export interface VirtualScrollOptions {
  originData?: any[]
  rowHeight?: number
  maxLength?: number
  bufferSize?: number
  count?: number
  isVirtual?: boolean
  isDebug?: boolean
  interceptorsMap?: interceptorsMapType
  onInit?: (callback: (data: any[]) => void) => Promise<any[]> | void
  onScroll?: (data: ScrollData) => void
  throttleDelay?: number
}

interface ScrollData {
  scrollTop: number
  startIndex: number
  endIndex: number
  totalCount: number
}

interface Range {
  startIndex: number
  endIndex: number
}

interface UpdateDataOptions {
  resetSelection?: boolean
  resetScroll?: boolean
  callback?: () => void
}

// ==================== 清理管理器 ====================
class CleanupManager {
  private cleanupFunctions: Array<() => void> = []
  private isCleaned = false

  add(fn: () => void) {
    if (this.isCleaned) {
      console.warn('[VirtualScroll] CleanupManager 已清理')
      return
    }
    this.cleanupFunctions.push(fn)
  }

  cleanup() {
    if (this.isCleaned) return

    for (let i = this.cleanupFunctions.length - 1; i >= 0; i--) {
      try {
        this.cleanupFunctions[i]()
      } catch (error) {
        console.error('[VirtualScroll] 清理函数执行失败:', error)
      }
    }

    this.cleanupFunctions = []
    this.isCleaned = true
  }

  isCleanedUp() {
    return this.isCleaned
  }
}

// ==================== 虚拟滚动指令 ====================
const virtualScrollDirective = {
  mounted(
    el: {
      _virtualScrollUpdateData: (
        newData: any[],
        isVirtual?: boolean,
        options?: UpdateDataOptions,
      ) => void
      _virtualScrollRefresh: () => void
      _virtualScrollToRow: (rowIndex: any, animate?: boolean) => void
      _virtualScrollSelectAll: () => any[]
      _virtualScrollClearAll: () => any[]
      _virtualScrollToBottom: () => void
      _virtualScrollToTop: () => void
      _virtualScrollToggleMode: (enableVirtual: boolean) => void
      _virtualScrollGetMode: () => boolean
      _virtualScrollGetDataLength: () => number
      _cleanup: () => void
      _cleanupManager: CleanupManager
      __vueParentComponent: { proxy: any }
      querySelector: (arg0: string) => any
    },
    binding: { value: VirtualScrollOptions },
    vnode: any,
  ) {
    // ==================== 初始化清理管理器 ====================
    const cleanupManager = new CleanupManager()
    el._cleanupManager = cleanupManager

    // ==================== 获取配置 ====================
    const options = binding.value || { originData: [] }
    const isDebug = options.isDebug || false
    // ===== 修改1：节流延迟从 16 改为 8 =====
    const throttleDelay = options.throttleDelay || 8
    const MAX_RENDER_COUNT = 50

    const error = (...args: any[]) => {
      console.error('[VirtualScroll]', ...args)
    }

    // ==================== 获取表格实例 ====================
    const tableInstance = el.__vueParentComponent?.proxy
    if (!tableInstance) {
      error('无法获取表格实例')
      return
    }

    // ==================== 常量定义 ====================
    const parentIdKey = '_parentId'
    const levelKey = '_level'
    const childrenKey = 'children'
    const hasChildrenKey = 'hasChildren'
    const originalTableInstance = tableInstance['$']

    // ==================== 数据初始化 ====================
    let originData = options.originData || tableInstance.$attrs?.originData || []
    let originalDataBackup: any[] = []
    let originalDataSortBackup: any[] = []
    let originDataChild: { [key: number | string]: any } = {}
    let isFilter = false

    // ==================== 虚拟化状态 ====================
    let isVirtualEnabled = options.isVirtual !== false
    let originalTableData: any[] = []

    // ==================== 异步数据初始化 ====================
    if (options.onInit && (!originData || originData.length === 0)) {
      try {
        const result = options.onInit((data: any[]) => {
          if (data && data.length > 0) {
            originData = data
            if (!cleanupManager.isCleanedUp()) {
              refresh()
            }
          }
        })

        if (result && typeof result.then === 'function') {
          result
            .then((data) => {
              if (data && data.length > 0) {
                originData = data
                if (!cleanupManager.isCleanedUp()) {
                  refresh()
                }
              }
            })
            .catch((err) => {
              error('数据初始化失败:', err)
            })
        }
      } catch (err) {
        error('onInit 执行失败:', err)
      }
    }

    if (!Array.isArray(originData)) {
      error('originData 必须是数组')
      return
    }

    // ==================== 获取 Store ====================
    const states = tableInstance.store?.states
    const tableData = states?.data
    if (!tableData) {
      error('无法获取表格数据 store')
      return
    }
    // ==================== 在 getRowKey 之前添加 ====================
    // 独立的 ID 管理器，使用 WeakMap 避免内存泄漏
    const idMap = new WeakMap<any, number>()
    let _idCounter = 0

    const getRowId = (row: any): number => {
      if (!row) return 0
      if (idMap.has(row)) {
        return idMap.get(row)!
      }
      const id = ++_idCounter
      idMap.set(row, id)
      return id
    }

    // ==================== 修改 getRowKey ====================
    const getRowKey = (row: any): string | number => {
      if (!row) return ''

      if (rowKeyCache.has(row)) {
        return rowKeyCache.get(row)!
      }

      let key: string | number | undefined
      if (isRowKeyFunction) {
        key = rowKey(row)
      } else if (rowKey && row[rowKey] !== undefined) {
        key = row[rowKey]
      }

      // 如果没有有效的 rowKey，使用自动生成的 ID
      if (key === undefined || key === null || key === '') {
        key = getRowId(row)
      }

      rowKeyCache.set(row, key)
      return key
    }

    // ==================== 在清理时重置 ID 计数器 ====================
    // 在 cleanupManager.add 中添加

    // ==================== 获取配置 ====================
    const rowKey =
      tableInstance.rowKey ||
      tableInstance.$props?.rowKey ||
      tableInstance.$attrs?.rowKey ||
      'id'
    const isRowKeyFunction = typeof rowKey === 'function'

    let rowKeyCache = new WeakMap<any, string | number>()

    const treeProps = tableInstance.treeProps ||
      tableInstance.$props?.treeProps ||
      tableInstance.$attrs?.treeProps || { children: 'children', hasChildren: 'hasChildren' }

    const getTreeProp = (row: any, key: string) => {
      const propKey = treeProps[key]
      return propKey ? row[propKey] : undefined
    }

    const hasChildrenSafe = (row: any) => {
      const children = getTreeProp(row, childrenKey)
      const hasChildren = getTreeProp(row, hasChildrenKey)
      return (!!children && children.length > 0) || hasChildren === true
    }

    // ===== 修改2：bufferSize 从 5 改为 8 =====
    const config = {
      rowHeight: options.rowHeight || 40,
      bufferSize: Math.min(Math.max(options.bufferSize || 8, 2), 15),
      visibleCount: Math.min(options.count || 20, MAX_RENDER_COUNT),
      currentStart: 0,
      currentEnd: 0,
      scrollTop: 0,
      pendingScrollTop: undefined as number | undefined,
    }

    // ==================== DOM 引用 ====================
    const scrollContainer = el.querySelector('.el-scrollbar__wrap')
    if (!scrollContainer) {
      error('无法找到滚动容器')
      return
    }

    const tableEl = el.querySelector('.el-table__body-wrapper')?.querySelector('table')

    // ==================== 状态管理 ====================
    const selectedKeys = new Map<string | number, any>()
    const store = tableInstance.store
    const selection = store?.states?.selection

    let isExpanded = false
    let isExpandedRow: { [key: string]: any } = {}
    const childOpen: { [key: string]: boolean } = {}

    // ==================== 滚动相关 ====================
    let rafId: number | null = null
    let scrollHandler: ((event: Event) => void) | null = null
    let resizeObserver: ResizeObserver | null = null
    let containerResizeObserver: ResizeObserver | null = null
    let resizeTimer: number | null = null

    let lastScrollTime = 0
    let pendingScrollUpdate = false
    let lastProcessedScrollTop = -1

    // 动画状态
    let isAnimating = false
    let animationRafId: number | null = null

    // 行高变化监听
    let rowHeightObserver: MutationObserver | null = null

    // ==================== 拦截器相关 ====================
    let originalEmit: Function | null = null
    let targetInstance: any = null
    let retryCount = 0
    const maxRetries = 30

    // ==================== 树形数据缓存 ====================
    let cachedTreeMap: { [key: string]: any } | null = null
    let treeDataVersion = 0

    let selectionBackup: Map<string | number, any> | null = null

    // ==================== 日志函数 ====================
    const logInfo = (...args: (string | any[])[]) => {
      if (isDebug) console.log('[VirtualScroll]', ...args)
    }

    const interceptorLog = (event: any, ...args: any[]) => {
      logInfo(`${event} 🔒 拦截器:`, args)
    }

    // ==================== 安全拦截器包装 ====================
    const safeInterceptor = (fn: Function, ...args: any[]) => {
      try {
        return fn(...args)
      } catch (err) {
        error('拦截器执行失败:', err)
        return false
      }
    }

    // ==================== 核心函数 ====================

    const getSelectable = () => {
      const selectionColumn = tableInstance?.columns?.find(
        (col: { type: string }) => col.type === 'selection',
      )
      return selectionColumn?.selectable || (() => true)
    }

    const updateSelection = (data: any[] = getVisibleData()) => {
      if (!selection || cleanupManager.isCleanedUp()) return
      const selects = data!.filter((row: any) => {
        const key = getRowKey(row)
        return selectedKeys.has(key)
      })

      if (selects.length === 0 && selectedKeys.size > 0) {
        const found = originData?.find((row: any) => selectedKeys.has(getRowKey(row)))
        // console.log(found)
        if (found) selects.push(found)
      }
      selection.value = selects
    }

    const selectAll = () => {
      if (cleanupManager.isCleanedUp()) return []
      const selectable = getSelectable()
      const nowSelectData: any[] = []
      originData.forEach((row: any) => {
        if (selectable(row)) {
          selectedKeys.set(getRowKey(row), row)
          nowSelectData.push(row)
        }
      })
      updateSelection()
      return nowSelectData
    }

    const clearAll = () => {
      if (cleanupManager.isCleanedUp()) return []
      selectedKeys.clear()
      updateSelection()
      return []
    }

    const backupSelection = () => {
      selectionBackup = new Map(selectedKeys)
    }

    const restoreSelection = () => {
      if (!selectionBackup) return

      const dataKeys = new Set(originData.map((item: any) => getRowKey(item)))
      selectedKeys.clear()
      for (const [key, value] of selectionBackup) {
        if (dataKeys.has(key)) {
          selectedKeys.set(key, value)
        }
      }
      selectionBackup = null
      updateSelection()
    }

    // ==================== 树形数据处理 ====================
    const hasChildren = (row: any) => {
      return hasChildrenSafe(row)
    }

    const flattenTreeToChildrenMap = (data: any[], parentId = undefined, level = 0) => {
      const map: { [key: string]: any } = {}
      const stack = [
        ...data.map((node) => ({
          node,
          parentId: node[parentIdKey] || parentId,
          level: node[levelKey] || level,
        })),
      ]

      while (stack.length) {
        const { node, parentId: nodeParentId, level: nodeLevel } = stack.pop()!
        const children = getTreeProp(node, childrenKey)

        node[levelKey] = nodeLevel
        node[parentIdKey] = nodeParentId

        if (children && children.length > 0) {
          map[node[rowKey]] = children

          for (let i = children.length - 1; i >= 0; i--) {
            stack.push({
              node: children[i],
              parentId: node[rowKey],
              level: nodeLevel + 1,
            })
          }

          delete node[treeProps[childrenKey]]
          node[treeProps[hasChildrenKey]] = true
        }
      }

      return map
    }

    const createTreeChild = (data: any[]) => {
      if (cleanupManager.isCleanedUp()) return
      Object.assign(originDataChild, flattenTreeToChildrenMap(data))
    }

    // ==================== 计算和渲染函数 ====================
    const calculateRange = (scrollTop: number): Range => {
      const dataLength = originData ? originData.length : 0
      if (dataLength === 0) {
        return { startIndex: 0, endIndex: 0 }
      }

      return {
        startIndex: Math.max(Math.floor(scrollTop / config.rowHeight) - config.bufferSize, 0),
        endIndex: Math.min(
          Math.floor(scrollTop / config.rowHeight) + config.visibleCount + config.bufferSize,
          dataLength,
        ),
      }
    }

    const getTreeMap = (data: any[]) => {
      let cacheKey = `${data.length}`
      if (data.length > 0) {
        cacheKey += `_${getRowKey(data[0])}`
        cacheKey += `_${getRowKey(data[data.length - 1])}`
      }

      if (cachedTreeMap && treeDataVersion === cacheKey) {
        return cachedTreeMap
      }

      cachedTreeMap = flattenTreeToChildrenMap(data)
      treeDataVersion = cacheKey
      return cachedTreeMap
    }

    const getVisibleData = (oriData = originData) => {
      if (cleanupManager.isCleanedUp()) return []
      if (!oriData || oriData.length === 0) return []

      const dataLength = oriData.length
      const safeStart = Math.max(0, Math.min(config.currentStart, dataLength - 1))
      const safeEnd = Math.max(safeStart + 1, Math.min(config.currentEnd, dataLength))

      let data = [...oriData.slice(safeStart, safeEnd)]
      const allNodeMap = new Map<string | number, any>(
        oriData.map((item: any) => [item[rowKey], item]),
      )

      const parentsToExpand = new Set<string | number>()

      for (const item of data) {
        let parentId = item[parentIdKey]
        while (parentId && allNodeMap.has(parentId)) {
          parentsToExpand.add(parentId)
          parentId = allNodeMap.get(parentId)?.[parentIdKey]
        }
      }

      const sortedParents = [...parentsToExpand].sort((a, b) => {
        const levelA = allNodeMap.get(a)?.[levelKey] ?? 0
        const levelB = allNodeMap.get(b)?.[levelKey] ?? 0
        return levelA - levelB
      })

      for (const parentId of sortedParents) {
        if (!data.some((item) => item[rowKey] === parentId)) {
          const parentNode = allNodeMap.get(parentId)
          if (parentNode) {
            const firstChildIndex = data.findIndex((item) => item[parentIdKey] === parentId)
            if (firstChildIndex !== -1) {
              data.splice(firstChildIndex, 0, parentNode)
            } else {
              data.push(parentNode)
            }
          }
        }
      }

      const dataNodeMap = new Map(data.map((item) => [item[rowKey], item]))

      for (const parentId of sortedParents) {
        const parentNode = dataNodeMap.get(parentId)
        if (!parentNode) continue

        if (store.states.treeData.value[parentId]) {
          store.states.treeData.value[parentId].expanded = true
        } else {
          store.states.treeData.value[parentId] = {
            children: [],
            lazy: true,
            level: parentNode[levelKey] || 0,
            expanded: true,
            loaded: false,
            loading: false,
            display: true,
          }
        }

        const children = data.filter((item) => item[parentIdKey] === parentId)
        tableInstance.updateKeyChildren(parentId, children)
        tableInstance.toggleRowExpansion(parentNode, true)
        data = data.filter((item) => item[parentIdKey] !== parentId)
      }

      const treeMap = getTreeMap(data)
      Object.assign(originDataChild, treeMap)

      return data
    }

    // ===== 修改3：GPU 加速 translate3d =====
    const updateTablePosition = () => {
      if (!tableEl) return

      const dataLength = originData ? originData.length : 0
      if (dataLength === 0) {
        tableEl.style.transform = 'translate3d(0px, 0px, 0px)'
        tableEl.style.paddingBottom = '0px'
        return
      }

      const offsetY = config.currentStart * config.rowHeight
      tableEl.style.transform = `translate3d(0px, ${offsetY}px, 0px)`
      tableEl.style.willChange = 'transform'

      const totalHeight = dataLength * config.rowHeight
      const visibleHeight = (config.currentEnd - config.currentStart) * config.rowHeight
      const paddingBottom = Math.max(0, totalHeight - visibleHeight - offsetY)
      tableEl.style.paddingBottom = `${paddingBottom}px`
    }

    // ==================== 更新视图 ====================
    const updateView = (oriData = originData) => {
      if (cleanupManager.isCleanedUp()) return

      try {
        const dataLength = oriData ? oriData.length : 0

        if (dataLength === 0) {
          tableData.value = []
          if (tableEl) {
            tableEl.style.transform = 'translate3d(0px, 0px, 0px)'
            tableEl.style.paddingBottom = '0px'
          }
          return
        }

        if (config.currentStart >= dataLength) {
          config.currentStart = Math.max(0, dataLength - config.visibleCount - config.bufferSize)
        }
        if (config.currentEnd > dataLength) {
          config.currentEnd = dataLength
        }
        if (config.currentStart < 0) {
          config.currentStart = 0
        }
        if (config.currentEnd < config.currentStart + 1) {
          config.currentEnd = Math.min(
            config.currentStart + config.visibleCount + config.bufferSize,
            dataLength,
          )
        }

        const visibleData = getVisibleData(oriData)

        const currentData = tableData.value
        let dataChanged = currentData.length !== visibleData.length
        if (!dataChanged) {
          for (let i = 0; i < currentData.length; i++) {
            if (currentData[i] !== visibleData[i]) {
              dataChanged = true
              break
            }
          }
        }

        if (dataChanged) {
          tableData.value = visibleData
        }

        updateSelection(visibleData)
        updateTablePosition()

        if (scrollContainer) {
          const maxScrollTop = Math.max(
            0,
            dataLength * config.rowHeight - scrollContainer.clientHeight,
          )
          if (scrollContainer.scrollTop > maxScrollTop) {
            scrollContainer.scrollTop = maxScrollTop
          }
        }

        options.onScroll?.({
          scrollTop: config.scrollTop,
          startIndex: config.currentStart,
          endIndex: config.currentEnd,
          totalCount: dataLength,
        })
      } catch (err) {
        error('updateView 执行失败:', err)
        if (oriData && oriData.length <= 100) {
          tableData.value = oriData
        } else {
          tableData.value = oriData?.slice(0, 50) || []
        }
      }
    }

    // ==================== 渲染模式 ====================
    const renderDirect = (data: any[]) => {
      if (cleanupManager.isCleanedUp()) return

      if (tableEl) {
        tableEl.style.transform = 'translate3d(0px, 0px, 0px)'
        tableEl.style.paddingBottom = '0px'
        tableEl.style.willChange = 'auto'
      }

      tableData.value = data
      logInfo('直接渲染模式，数据量:', String(data ? data.length : 0))
    }

    const renderVirtual = (data: any[]) => {
      if (cleanupManager.isCleanedUp()) return

      originData = data || []
      const dataLength = originData.length

      originDataChild = {}
      cachedTreeMap = null
      treeDataVersion = 0

      config.currentStart = 0
      config.currentEnd = Math.min(config.visibleCount + config.bufferSize, dataLength)
      config.scrollTop = 0

      updateView()

      if (scrollContainer) {
        scrollContainer.scrollTop = 0
      }

      logInfo('虚拟化渲染模式，数据量:', String(dataLength))
    }

    // ==================== refresh 函数 ====================
    const refresh = () => {
      if (cleanupManager.isCleanedUp()) return

      const dataLength = originData ? originData.length : 0

      if (!isVirtualEnabled) {
        renderDirect(originData)
        return
      }

      originDataChild = {}
      cachedTreeMap = null
      treeDataVersion = 0

      config.currentStart = 0
      config.currentEnd = Math.min(config.visibleCount + config.bufferSize, dataLength)
      config.scrollTop = 0

      if (scrollContainer) {
        scrollContainer.scrollTop = 0
      }

      logInfo('refresh 触发视图更新，数据长度:', dataLength)
      updateView()
    }

    // ==================== 切换虚拟化模式 ====================
    const switchVirtualMode = (enableVirtual: boolean, data?: any[]) => {
      if (cleanupManager.isCleanedUp()) return

      const targetData = data || originData

      if (!targetData || !Array.isArray(targetData)) {
        error('switchVirtualMode: 数据无效')
        return
      }

      if (isVirtualEnabled === enableVirtual) {
        if (enableVirtual) {
          renderVirtual(targetData)
        } else {
          renderDirect(targetData)
        }
        return
      }

      isVirtualEnabled = enableVirtual
      logInfo(`🔄 切换虚拟化模式: ${enableVirtual ? '虚拟化' : '直接渲染'}`)

      originDataChild = {}
      cachedTreeMap = null
      treeDataVersion = 0

      if (enableVirtual) {
        if (!isVirtualEnabled && originalTableData.length > 0) {
          originData = [...originalTableData]
        } else {
          originData = targetData
        }

        selectedKeys.clear()

        config.currentStart = 0
        config.currentEnd = Math.min(config.visibleCount + config.bufferSize, originData.length)
        config.scrollTop = 0

        if (!scrollHandler) {
          scrollHandler = (event: Event) => {
            const target = event.target as HTMLElement
            if (target && !cleanupManager.isCleanedUp()) {
              handleScroll(target.scrollTop)
            }
          }
          scrollContainer.addEventListener('scroll', scrollHandler, { passive: true })

          cleanupManager.add(() => {
            if (scrollContainer && scrollHandler) {
              scrollContainer.removeEventListener('scroll', scrollHandler)
              scrollHandler = null
              logInfo('✅ 滚动事件已移除')
            }
          })
        }

        if (!resizeObserver && typeof ResizeObserver !== 'undefined') {
          resizeObserver = new ResizeObserver(() => {
            if (resizeTimer) {
              clearTimeout(resizeTimer)
            }
            resizeTimer = setTimeout(() => {
              if (!cleanupManager.isCleanedUp()) {
                refresh()
              }
              resizeTimer = null
            }, 200)
          })
          resizeObserver.observe(scrollContainer)

          cleanupManager.add(() => {
            if (resizeObserver) {
              resizeObserver.disconnect()
              resizeObserver = null
            }
            if (resizeTimer) {
              clearTimeout(resizeTimer)
              resizeTimer = null
            }
            logInfo('✅ ResizeObserver 已清理')
          })
        }

        if (!containerResizeObserver && typeof ResizeObserver !== 'undefined') {
          containerResizeObserver = new ResizeObserver(() => {
            if (cleanupManager.isCleanedUp()) return
            if (!isVirtualEnabled) return

            const containerHeight = scrollContainer.clientHeight
            const newVisibleCount = Math.ceil(containerHeight / config.rowHeight)
            if (newVisibleCount !== config.visibleCount && newVisibleCount > 0) {
              config.visibleCount = Math.min(newVisibleCount + 2, MAX_RENDER_COUNT)
              logInfo('容器尺寸变化，更新 visibleCount:', config.visibleCount)
              refresh()
            }
          })
          containerResizeObserver.observe(scrollContainer)

          cleanupManager.add(() => {
            if (containerResizeObserver) {
              containerResizeObserver.disconnect()
              containerResizeObserver = null
              logInfo('✅ 容器尺寸监听已清理')
            }
          })
        }

        if (!rowHeightObserver && tableEl) {
          rowHeightObserver = new MutationObserver(() => {
            if (cleanupManager.isCleanedUp()) return
            if (!isVirtualEnabled) return

            const firstRow = tableEl.querySelector('.el-table__row')
            if (firstRow) {
              const newHeight = firstRow.getBoundingClientRect().height
              if (newHeight > 0 && Math.abs(newHeight - config.rowHeight) > 2) {
                config.rowHeight = newHeight
                logInfo('行高变化:', newHeight)
                refresh()
              }
            }
          })

          rowHeightObserver.observe(tableEl, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class'],
          })

          cleanupManager.add(() => {
            if (rowHeightObserver) {
              rowHeightObserver.disconnect()
              rowHeightObserver = null
              logInfo('✅ 行高监听已清理')
            }
          })
        }

        renderVirtual(originData)
      } else {
        originalTableData = [...targetData]

        if (scrollHandler) {
          scrollContainer.removeEventListener('scroll', scrollHandler)
          scrollHandler = null
        }

        if (resizeObserver) {
          resizeObserver.disconnect()
          resizeObserver = null
        }
        if (containerResizeObserver) {
          containerResizeObserver.disconnect()
          containerResizeObserver = null
        }
        if (rowHeightObserver) {
          rowHeightObserver.disconnect()
          rowHeightObserver = null
        }
        if (resizeTimer) {
          clearTimeout(resizeTimer)
          resizeTimer = null
        }

        if (rafId) {
          cancelAnimationFrame(rafId)
          rafId = null
        }

        renderDirect(targetData)
      }
    }

    // ==================== 滚动处理 ====================
    const processScroll = (scrollTop: number) => {
      if (cleanupManager.isCleanedUp()) return
      if (!isVirtualEnabled) return
      if (isAnimating) return

      const dataLength = originData ? originData.length : 0
      if (dataLength === 0) return

      const totalHeight = dataLength * config.rowHeight
      const containerHeight = scrollContainer.clientHeight
      const maxScrollTop = Math.max(0, totalHeight - containerHeight)

      const clampedScrollTop = Math.max(0, Math.min(scrollTop, maxScrollTop))

      if (Math.abs(clampedScrollTop - lastProcessedScrollTop) < 2) {
        return
      }

      config.scrollTop = clampedScrollTop
      const { startIndex, endIndex } = calculateRange(config.scrollTop)

      if (config.currentStart !== startIndex || config.currentEnd !== endIndex) {
        config.currentStart = startIndex
        config.currentEnd = Math.min(endIndex, dataLength)
        logInfo('handleScroll 触发视图更新')
        updateView()
        lastProcessedScrollTop = clampedScrollTop
      }
    }

    const handleScroll = (scrollTop: number) => {
      if (cleanupManager.isCleanedUp()) return
      if (!isVirtualEnabled) return
      if (isAnimating) return

      const now = Date.now()

      if (now - lastScrollTime < throttleDelay) {
        config.pendingScrollTop = scrollTop
        if (!pendingScrollUpdate) {
          pendingScrollUpdate = true
          if (rafId) cancelAnimationFrame(rafId)
          rafId = requestAnimationFrame(() => {
            if (config.pendingScrollTop !== undefined) {
              processScroll(config.pendingScrollTop)
              config.pendingScrollTop = undefined
              pendingScrollUpdate = false
            }
            rafId = null
          })
        }
        return
      }

      lastScrollTime = now
      processScroll(scrollTop)
    }

    // ==================== 公共方法 ====================
    const scrollToRow = (rowIndex: number, animate: boolean = false) => {
      if (cleanupManager.isCleanedUp()) return
      if (!isVirtualEnabled) {
        logInfo('非虚拟化模式，不支持 scrollToRow')
        return
      }

      const dataLength = originData ? originData.length : 0
      if (rowIndex < 0 || rowIndex >= dataLength) return

      const targetScrollTop = rowIndex * config.rowHeight
      const maxScrollTop = Math.max(0, dataLength * config.rowHeight - scrollContainer.clientHeight)
      const clampedScrollTop = Math.min(targetScrollTop, maxScrollTop)

      if (animate) {
        if (animationRafId) {
          cancelAnimationFrame(animationRafId)
          animationRafId = null
        }

        isAnimating = true
        const start = scrollContainer.scrollTop
        const end = clampedScrollTop
        const duration = 300
        const startTime = performance.now()

        const animateScroll = (currentTime: number) => {
          if (cleanupManager.isCleanedUp()) {
            isAnimating = false
            return
          }

          const elapsed = currentTime - startTime
          const progress = Math.min(elapsed / duration, 1)
          const ease =
            progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2

          scrollContainer.scrollTop = start + (end - start) * ease

          if (progress < 1) {
            animationRafId = requestAnimationFrame(animateScroll)
          } else {
            scrollContainer.scrollTop = end
            isAnimating = false
            animationRafId = null

            const { startIndex, endIndex } = calculateRange(end)
            if (config.currentStart !== startIndex || config.currentEnd !== endIndex) {
              config.currentStart = startIndex
              config.currentEnd = Math.min(endIndex, dataLength)
              logInfo('scrollToRow 动画结束，触发视图更新')
              updateView()
            }
            lastProcessedScrollTop = end
          }
        }
        animationRafId = requestAnimationFrame(animateScroll)
      } else {
        scrollContainer.scrollTop = clampedScrollTop
        const { startIndex, endIndex } = calculateRange(clampedScrollTop)
        if (config.currentStart !== startIndex || config.currentEnd !== endIndex) {
          config.currentStart = startIndex
          config.currentEnd = Math.min(endIndex, dataLength)
          logInfo('scrollToRow 触发视图更新')
          updateView()
        }
        lastProcessedScrollTop = clampedScrollTop
      }
    }

    const scrollToBottom = () => {
      if (cleanupManager.isCleanedUp()) return
      if (!isVirtualEnabled) {
        logInfo('非虚拟化模式，不支持 scrollToBottom')
        return
      }

      const dataLength = originData ? originData.length : 0
      if (dataLength === 0) return

      const maxScrollTop = Math.max(0, dataLength * config.rowHeight - scrollContainer.clientHeight)
      scrollContainer.scrollTop = maxScrollTop
      logInfo('滚动到底部，位置:', maxScrollTop)
    }

    const scrollToTop = () => {
      if (cleanupManager.isCleanedUp()) return
      if (!isVirtualEnabled) {
        logInfo('非虚拟化模式，不支持 scrollToTop')
        return
      }
      scrollContainer.scrollTop = 0
    }

    const toggleVirtualMode = (enableVirtual: boolean) => {
      if (cleanupManager.isCleanedUp()) return

      if (isVirtualEnabled === enableVirtual) {
        logInfo('模式已经是:', enableVirtual ? '虚拟化' : '直接渲染')
        return
      }

      const currentData = tableData.value || originData
      switchVirtualMode(enableVirtual, currentData)
    }

    const getVirtualMode = () => isVirtualEnabled

    const getDataLength = () => (originData ? originData.length : 0)

    // ==================== updateData ====================
    const updateData = (
      newData: any[],
      isVirtual: boolean = options.isVirtual !== false,
      updateOptions?: UpdateDataOptions,
    ) => {
      if (cleanupManager.isCleanedUp()) {
        logInfo('组件已清理，跳过 updateData')
        return
      }

      if (!newData || !Array.isArray(newData)) {
        error('updateData: 数据必须是数组')
        return
      }

      originData = newData

      originDataChild = {}
      cachedTreeMap = null
      treeDataVersion = 0

      logInfo('📊 updateData 调用:', {
        数据量: newData.length,
        虚拟化: isVirtual,
        选项: updateOptions,
      })

      if (updateOptions?.resetSelection !== false) {
        selectedKeys.clear()
      } else {
        const newDataKeys = new Set(newData.map((item: any) => getRowKey(item)))
        for (const [key] of selectedKeys) {
          if (!newDataKeys.has(key)) {
            selectedKeys.delete(key)
          }
        }
      }

      switchVirtualMode(isVirtual, newData)

      if (updateOptions?.resetScroll !== false && scrollContainer) {
        scrollContainer.scrollTop = 0
      }

      if (updateOptions?.callback) {
        try {
          updateOptions.callback()
        } catch (err) {
          error('回调执行失败:', err)
        }
      }

      logInfo('✅ updateData 完成，当前数据长度:', originData.length)
    }

    // ==================== 事件拦截器 ====================
    const interceptorsMap: interceptorsMapType = {
      'sort-change': (value: { prop: any; order: any }) => {
        interceptorLog('sort-change', value)
        if (cleanupManager.isCleanedUp() || !isVirtualEnabled) return

        backupSelection()

        const { prop, order } = value
        if (originalDataSortBackup.length === 0) {
          originalDataSortBackup = [...originData]
        }
        switch (order) {
          case 'ascending':
            logInfo('sort-change ascending 触发视图更新')
            updateView(
              originData
                .filter(
                  (item: any) => item[levelKey] === 0 || typeof item[levelKey] === 'undefined',
                )
                .sort((a: any, b: any) => a[prop] - b[prop]),
            )
            break
          case 'descending':
            logInfo('sort-change descending 触发视图更新')
            updateView(
              originData
                .filter(
                  (item: any) => item[levelKey] === 0 || typeof item[levelKey] === 'undefined',
                )
                .sort((a: any, b: any) => b[prop] - a[prop]),
            )
            break
          default:
            logInfo('sort-change default 触发视图更新')
            originData = [...originalDataSortBackup]
            originalDataSortBackup.length = 0
            updateView(originData)
            break
        }

        restoreSelection()
      },
      select: (value: any[], row: any) => {
        interceptorLog('select', value, '行数据:', row)
        if (cleanupManager.isCleanedUp()) return

        const isSelect = value.includes(row)
        if (isSelect) selectedKeys.set(getRowKey(row), row)
        else selectedKeys.delete(getRowKey(row))
        return [originData.filter((row: any) => selectedKeys.has(getRowKey(row))), row]
      },
      'select-all': (value: any[]) => {
        interceptorLog('select-all', value)
        if (cleanupManager.isCleanedUp()) return

        const valueLength = value.length
        let data
        if (valueLength === 0) {
          data = [clearAll()]
        } else {
          data = [selectAll()]
        }
        tableInstance.$emit?.('selection-change')
        return data
      },
      'selection-change': (value: any[]) => {
        interceptorLog('selection-change', value)
        if (cleanupManager.isCleanedUp()) return

        const selectedRows = originData.filter((row: any) => selectedKeys.has(getRowKey(row)))
        return [selectedRows || []]
      },
      scroll: (value: { scrollLeft: number; scrollTop: number }) => {
        handleScroll(value.scrollTop)
      },
      'filter-change': (value: any) => {
        interceptorLog('filter-change', value)
        if (cleanupManager.isCleanedUp() || !isVirtualEnabled) return

        backupSelection()

        const filterCondition: any[][] = Object.values(value)
        const isNowFilter = !!filterCondition.find(
          (filterConditionItem: any[]) => filterConditionItem.length > 0,
        )
        if (!isFilter && isNowFilter) originalDataBackup = [...originData]
        else originData = [...originalDataBackup]
        isFilter = isNowFilter
        states.columns.value.map(
          (columnConfig: {
            filterMethod: (value: any, row: any, column: any) => boolean
            filteredValue: any[]
            columnKey: string
          }) => {
            const filterNowData = columnConfig.filteredValue
            if (filterNowData.length > 0) {
              const filterMethod = columnConfig.filterMethod
              if (!filterMethod) {
                return
              }
              originData = originData.filter((dataItem: any) => {
                return !!filterNowData.find((filterNowDataItem: any) =>
                  filterMethod(filterNowDataItem, dataItem, columnConfig),
                )
              })
            }
          },
        )

        refresh()

        restoreSelection()
      },
      'expand-change': (row: any, expanded: boolean) => {
        interceptorLog('expand-change', row, expanded)
        if (cleanupManager.isCleanedUp() || !isVirtualEnabled) return

        if (typeof expanded === 'boolean') {
          const index = originData.findIndex((item: any) => item[rowKey] === row[rowKey])
          if (!expanded) {
            const sortedParents = []
            let id = row[rowKey]
            let childSize = originData.filter((item: any) => item[parentIdKey] == id).length
            while (childSize > 0) {
              originData.splice(index + 1, childSize)
              sortedParents.push(id)
              const child = originData.filter((item: any) => item[parentIdKey] == id)
              childSize = child.length
              id = child[0]?.[parentIdKey]
            }
            sortedParents.sort().forEach((item) => {
              tableInstance.updateKeyChildren(item, [])
              store.states.treeData.value[item].loaded = false
            })
          } else {
            if (!originData.find((item: any) => item[parentIdKey] === row[rowKey])) {
              originData.splice(
                index + 1,
                0,
                ...originDataChild[row[rowKey]].map((item: any) => {
                  item[levelKey] = (row[levelKey] || 0) + 1
                  item[parentIdKey] = row[rowKey]
                  return item
                }),
              )
            }
          }
          isExpanded = expanded
          isExpandedRow = row
          childOpen[row[rowKey]] = expanded
          updateView()
        }
      },
      'virtual-mode-change': (enableVirtual: boolean) => {
        interceptorLog('virtual-mode-change', enableVirtual)
        toggleVirtualMode(enableVirtual)
      },
      ...(options.interceptorsMap || {}),
    }

    // ==================== 安装拦截器 ====================
    const installInterceptor = () => {
      if (cleanupManager.isCleanedUp()) return

      const childProxy =
        tableInstance || tableInstance.$refs?.childRef || tableInstance.refs?.childRef

      if (childProxy) {
        let childInstance = null

        if (childProxy.$) {
          childInstance = childProxy.$
        } else if (childProxy.__vnode) {
          childInstance = childProxy.__vnode.component
        } else if (childProxy._) {
          childInstance = childProxy._
        } else if (childProxy.proxy) {
          childInstance = childProxy.proxy
        }

        targetInstance = childInstance?.emit ? childInstance : childProxy

        if (
          targetInstance &&
          typeof targetInstance.emit === 'function' &&
          !targetInstance.__interceptorInstalled
        ) {
          originalEmit = targetInstance.emit

          targetInstance.emit = function (event: string, ...args: any[] | any) {
            try {
              const interceptor = interceptorsMap[event]
              if (interceptor) {
                const result = safeInterceptor(interceptor, ...args)
                if (result === false) {
                  logInfo(`⛔ 事件被阻止: ${event}`)
                  return
                }
                const types = ['[object Array]', '[object Object]']
                if (types.includes(Object.prototype.toString.call(result))) {
                  if (Array.isArray(result)) {
                    args = result
                    logInfo(`🔄 参数数组被替换: ${event}`, args)
                  } else if (args.length === 1) {
                    args = [result]
                    logInfo(`🔄 单参数被替换: ${event}`, args)
                  } else {
                    logInfo(`⚠️ 多参数事件 ${event} 的拦截器返回了非数组，已忽略`, result)
                  }
                }
              }
            } catch (err) {
              error(`事件 ${event} 处理失败:`, err)
            }
            return originalEmit!.call(this, event, ...args)
          }

          targetInstance.__interceptorInstalled = true
          targetInstance.__originalEmit = originalEmit

          cleanupManager.add(() => {
            if (targetInstance && originalEmit) {
              targetInstance.emit = originalEmit
              targetInstance.__interceptorInstalled = false
              targetInstance.__originalEmit = null
              logInfo('✅ 拦截器已清理')
            }
          })

          logInfo('✅ 事件拦截器安装成功', Object.keys(interceptorsMap))
          return
        }
      }

      retryCount++
      if (retryCount < maxRetries) {
        setTimeout(installInterceptor, 100)
      } else {
        error('❌ 未能找到子组件实例')
      }
    }

    // ==================== 初始化树形数据加载 ====================
    const originLoad = tableInstance.load
    if (originLoad && typeof originLoad === 'function') {
      const originalLoadFn = originLoad

      originalTableInstance.props.load = (row: any, treeNode: any, resolve: any) => {
        if (cleanupManager.isCleanedUp()) {
          resolve([])
          return
        }

        const id = row[rowKey]
        const child = originDataChild[id]
        if (child && child.length > 0) {
          resolve(child)
        } else {
          originalLoadFn(row, treeNode, (res: any[]) => {
            if (cleanupManager.isCleanedUp()) {
              resolve([])
              return
            }
            originDataChild[id] = res
            resolve(res)
          })
        }
      }

      cleanupManager.add(() => {
        if (originalTableInstance && originalTableInstance.props && originalLoadFn) {
          originalTableInstance.props.load = originalLoadFn
          logInfo('✅ load 方法已恢复')
        }
      })
    }

    // ==================== 初始化渲染 ====================
    if (isVirtualEnabled) {
      const dataLength = originData ? originData.length : 0
      config.currentEnd = Math.min(config.visibleCount + config.bufferSize, dataLength)
      logInfo('初始化虚拟化渲染，数据长度:', dataLength)
      updateView()
    } else {
      logInfo('初始化直接渲染')
      renderDirect(originData)
    }

    // ==================== 添加滚动事件监听 ====================
    if (isVirtualEnabled) {
      scrollHandler = (event: Event) => {
        const target = event.target as HTMLElement
        if (target && !cleanupManager.isCleanedUp()) {
          handleScroll(target.scrollTop)
        }
      }
      scrollContainer.addEventListener('scroll', scrollHandler, { passive: true })

      cleanupManager.add(() => {
        if (scrollContainer && scrollHandler) {
          scrollContainer.removeEventListener('scroll', scrollHandler)
          scrollHandler = null
          logInfo('✅ 滚动事件已移除')
        }
      })

      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(() => {
          if (resizeTimer) {
            clearTimeout(resizeTimer)
          }
          resizeTimer = setTimeout(() => {
            if (!cleanupManager.isCleanedUp()) {
              refresh()
            }
            resizeTimer = null
          }, 200)
        })
        resizeObserver.observe(scrollContainer)

        cleanupManager.add(() => {
          if (resizeObserver) {
            resizeObserver.disconnect()
            resizeObserver = null
          }
          if (resizeTimer) {
            clearTimeout(resizeTimer)
            resizeTimer = null
          }
          logInfo('✅ ResizeObserver 已清理')
        })
      }

      if (typeof ResizeObserver !== 'undefined') {
        containerResizeObserver = new ResizeObserver(() => {
          if (cleanupManager.isCleanedUp()) return
          if (!isVirtualEnabled) return

          const containerHeight = scrollContainer.clientHeight
          const newVisibleCount = Math.ceil(containerHeight / config.rowHeight)
          if (newVisibleCount !== config.visibleCount && newVisibleCount > 0) {
            config.visibleCount = Math.min(newVisibleCount + 2, MAX_RENDER_COUNT)
            logInfo('容器尺寸变化，更新 visibleCount:', config.visibleCount)
            refresh()
          }
        })
        containerResizeObserver.observe(scrollContainer)

        cleanupManager.add(() => {
          if (containerResizeObserver) {
            containerResizeObserver.disconnect()
            containerResizeObserver = null
            logInfo('✅ 容器尺寸监听已清理')
          }
        })
      }

      if (tableEl) {
        rowHeightObserver = new MutationObserver(() => {
          if (cleanupManager.isCleanedUp()) return
          if (!isVirtualEnabled) return

          const firstRow = tableEl.querySelector('.el-table__row')
          if (firstRow) {
            const newHeight = firstRow.getBoundingClientRect().height
            if (newHeight > 0 && Math.abs(newHeight - config.rowHeight) > 2) {
              config.rowHeight = newHeight
              logInfo('行高变化:', newHeight)
              refresh()
            }
          }
        })

        rowHeightObserver.observe(tableEl, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['style', 'class'],
        })

        cleanupManager.add(() => {
          if (rowHeightObserver) {
            rowHeightObserver.disconnect()
            rowHeightObserver = null
            logInfo('✅ 行高监听已清理')
          }
        })
      }

      if (tableInstance.$watch) {
        const unwatch = tableInstance.$watch(
          () => tableInstance.$attrs?.originData,
          (newData: any[]) => {
            if (newData && Array.isArray(newData) && newData !== originData) {
              originData = newData
              refresh()
            }
          },
          { deep: true },
        )

        cleanupManager.add(() => {
          if (unwatch) unwatch()
        })
      }
    }

    // ==================== 安装拦截器 ====================
    installInterceptor()

    // ==================== 清理所有资源 ====================
    cleanupManager.add(() => {
      if (rafId) {
        cancelAnimationFrame(rafId)
        rafId = null
      }
      if (animationRafId) {
        cancelAnimationFrame(animationRafId)
        animationRafId = null
        isAnimating = false
      }
      logInfo('✅ 所有动画已清理')
    })

    cleanupManager.add(() => {
      selectedKeys.clear()
      selectionBackup = null
      originData = []
      originalDataBackup = []
      originalDataSortBackup = []
      originalTableData = []
      originDataChild = {}
      cachedTreeMap = null
      treeDataVersion = 0
      rowKeyCache = new WeakMap()
      Object.keys(childOpen).forEach((key) => {
        delete childOpen[key]
      })
      isExpanded = false
      isExpandedRow = {}
      logInfo('✅ 数据引用已清理')
    })

    cleanupManager.add(() => {
      if (tableInstance) {
        delete tableInstance._virtualScrollUpdateData
        delete tableInstance._virtualScrollRefresh
        delete tableInstance._virtualScrollToRow
        delete tableInstance._virtualScrollSelectAll
        delete tableInstance._virtualScrollClearAll
        delete tableInstance._virtualScrollToBottom
        delete tableInstance._virtualScrollToTop
        delete tableInstance._virtualScrollToggleMode
        delete tableInstance._virtualScrollGetMode
        delete tableInstance._virtualScrollGetDataLength
        delete tableInstance._cleanup
      }
      logInfo('✅ 表格引用已清理')
    })

    // ==================== 暴露方法 ====================
    const cleanup = () => {
      cleanupManager.cleanup()
      //@ts-ignore
      el._cleanup = undefined
      //@ts-ignore
      el._cleanupManager = undefined
      logInfo('✅ 所有资源已清理')
    }

    el._virtualScrollUpdateData = updateData
    el._virtualScrollRefresh = refresh
    el._virtualScrollToRow = scrollToRow
    el._virtualScrollSelectAll = selectAll
    el._virtualScrollClearAll = clearAll
    el._virtualScrollToBottom = scrollToBottom
    el._virtualScrollToTop = scrollToTop
    el._virtualScrollToggleMode = toggleVirtualMode
    el._virtualScrollGetMode = getVirtualMode
    el._virtualScrollGetDataLength = getDataLength
    el._cleanup = cleanup

    tableInstance._virtualScrollUpdateData = updateData
    tableInstance._virtualScrollRefresh = refresh
    tableInstance._virtualScrollToRow = scrollToRow
    tableInstance._virtualScrollSelectAll = selectAll
    tableInstance._virtualScrollClearAll = clearAll
    tableInstance._virtualScrollToBottom = scrollToBottom
    tableInstance._virtualScrollToTop = scrollToTop
    tableInstance._virtualScrollToggleMode = toggleVirtualMode
    tableInstance._virtualScrollGetMode = getVirtualMode
    tableInstance._virtualScrollGetDataLength = getDataLength
    tableInstance._cleanup = cleanup

    logInfo(
      '✅ 虚拟滚动指令初始化完成，当前模式:',
      isVirtualEnabled ? '虚拟化' : '直接渲染',
      '数据长度:',
      originData ? originData.length : 0,
    )
  },

  // ==================== 卸载清理 ====================
  unmounted(el: { _cleanup: () => void; _cleanupManager?: CleanupManager }) {
    if (el._cleanupManager) {
      el._cleanupManager.cleanup()
    }
    if (el._cleanup) {
      el._cleanup()
    }
  },
}

export default virtualScrollDirective
