import { interceptorsMapType, virtualConfig } from './types'

const virtualScrollDirective = {
  mounted(
    el: {
      _virtualScrollUpdateData: (newData: any[]) => void
      __vueParentComponent: { proxy: any }
      querySelector: (arg0: string) => {
        clientHeight: number
        removeEventListener(arg0: string, handleScroll: () => void): unknown
        addEventListener(arg0: string, handleScroll: () => void): unknown
        scrollTop: number
        (): any
        new (): any
        querySelector: { (arg0: string): any; new (): any }
      }
      _virtualScrollRefresh: () => void
      _virtualScrollToRow: (rowIndex: any) => void
      _virtualScrollSelectAll: () => void
      _virtualScrollClearAll: () => void
      _virtualScrollToBottom: () => void
      _virtualScrollToTop: () => void
      _cleanup: () => void
      _stopWatch: () => void
    },
    binding: { value: virtualConfig },
    vnode: any,
  ) {
    const options = binding.value || { originData: [] }
    const tableInstance = el.__vueParentComponent?.proxy
    if (!tableInstance) return
    const isDebug = options.isDebug
    let originData = options.originData || tableInstance.$attrs?.originData || []
    let originalDataBackup: any[] = []
    let isFilter = false
    if (options.onInit && (!originData || originData.length === 0)) {
      const result = options.onInit((data: any[]) => {
        // 回调方式
        if (data && data.length > 0) {
          originData = data
          refresh()
        }
      })

      // Promise 方式
      if (result && typeof result.then === 'function') {
        result.then((data) => {
          if (data && data.length > 0) {
            originData = data
            refresh()
          }
        })
      }
    }
    if (!originData) return
    const states = tableInstance.store?.states
    const tableData = states?.data
    if (!tableData) return

    if (!options.isVirtual) {
      tableData.value = originData
      return
    }
    // 获取 row-key
    const rowKey =
      tableInstance.rowKey || tableInstance.$props?.rowKey || tableInstance.$attrs?.rowKey || 'id'
    const getRowKey =
      typeof rowKey === 'function' ? rowKey : (row: { [x: string]: any }) => row[rowKey]

    const config = {
      rowHeight: options.rowHeight || 40,
      bufferSize: options.bufferSize || 5,
      visibleCount: options.count || 20,
      currentStart: 0,
      currentEnd: 0,
      scrollTop: 0,
    }

    const scrollContainer = el.querySelector('.el-scrollbar__wrap')
    if (!scrollContainer) return

    const tableEl = el.querySelector('.el-table__body-wrapper')?.querySelector('table')

    // 存储选中的 key
    const selectedKeys = new Set()

    const store = tableInstance.store
    const selection = store?.states?.selection

    // 获取 selectable 函数
    const getSelectable = () => {
      // 从表格列中获取 selectable 属性
      const selectionColumn = tableInstance?.columns?.find(
        (col: { type: string }) => col.type === 'selection',
      )
      return selectionColumn?.selectable || (() => true)
    }

    // 更新表格选中状态
    const updateSelection = (data: virtualConfig['originData'] | undefined = undefined) => {
      if (!selection) return
      if (!data) data = getVisibleData()
      const selects = data!.filter((row: any) => selectedKeys.has(getRowKey(row)))
      if (selects.length === 0 && selectedKeys.size > 0)
        selects.push(originData!.find((row: any) => selectedKeys.has(getRowKey(row))))
      selection.value = selects
    }

    const selectAll = () => {
      const selectable = getSelectable()
      const nowSelectData: any[] = []
      originData.forEach(
        (row: any) =>
          selectable(row) && selectedKeys.add(getRowKey(row)) && nowSelectData.push(row),
      )
      updateSelection()
      return nowSelectData
    }

    const clearAll = () => {
      selectedKeys.clear()
      updateSelection()
    }

    // region 事件拦截
    const interceptorsMap: interceptorsMapType = {
      'sort-change': (value: { prop: any; order: any }) => {
        isDebug && console.log('sort-change 🔒 拦截器:', value)
        const { prop, order } = value
        switch (order) {
          case 'ascending':
            isDebug && console.log('sort-change ascending 触发视图更新')
            updateView(
              originData.toSorted(
                (a: { [x: string]: number }, b: { [x: string]: number }) => a[prop] - b[prop],
              ),
            )
            break
          case 'descending':
            isDebug && console.log('sort-change descending 触发视图更新')
            updateView(
              originData.toSorted(
                (a: { [x: string]: number }, b: { [x: string]: number }) => b[prop] - a[prop],
              ),
            )
            break
          default:
            isDebug && console.log('sort-change default 触发视图更新')
            updateView(originData)
            break
        }
      },
      select: (value, row) => {
        isDebug && console.log('select 🔒 拦截器:', value, '行数据:', row)
        const isSelect = value.includes(row)
        if (isSelect) selectedKeys.add(getRowKey(row))
        else selectedKeys.delete(getRowKey(row))
        return [originData.filter((row: any) => selectedKeys.has(getRowKey(row))), row]
        // console.log(selectedKeys)
      },
      'select-all': (value) => {
        isDebug && console.log('select-all 🔒 拦截器:', value)
        const valueLength = value.length
        let data
        if (valueLength === 0) {
          data = clearAll()
        } else {
          data = selectAll()
        }
        return data
      },
      'selection-change': (value) => {
        isDebug && console.log('select-all 🔒 拦截器:', value)
        const selectedRows = originData.filter((row: any) => selectedKeys.has(getRowKey(row)))
        return [selectedRows || []]
      },
      scroll: (value: { scrollLeft: number; scrollTop: number }) => {
        // isDebug && console.log('scroll 🔒 拦截器:', value)
        handleScroll(value.scrollTop)
      },
      'filter-change': (value) => {
        isDebug && console.log('filter-change 🔒 拦截器:', value)
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
      },

      ...(options.interceptorsMap || {}),
    }

    // 获取父组件实例
    const parentInstance = tableInstance
    if (!parentInstance) {
      console.error('无法获取父组件实例')
      return
    }

    let retryCount = 0
    const maxRetries = 30

    const installInterceptor = () => {
      // 获取子组件 ref
      const childProxy =
        parentInstance || parentInstance.$refs?.childRef || parentInstance.refs?.childRef

      if (childProxy) {
        // 正确处理 Vue 3 的组件实例
        let childInstance = null

        // 尝试多种方式获取真正的组件实例
        if (childProxy.$) {
          // Vue 3 组合式 API 的实例
          childInstance = childProxy.$
        } else if (childProxy.__vnode) {
          childInstance = childProxy.__vnode.component
        } else if (childProxy._) {
          childInstance = childProxy._
        } else if (childProxy.proxy) {
          childInstance = childProxy.proxy
        }

        // 确定有 emit 方法的实例
        const targetInstance = childInstance?.emit ? childInstance : childProxy

        if (
          targetInstance &&
          typeof targetInstance.emit === 'function' &&
          !targetInstance.__interceptorInstalled
        ) {
          const originalEmit = targetInstance.emit
          targetInstance.emit = function (event: string, ...args: any[] | any) {
            const interceptor = interceptorsMap[event]

            if (interceptor) {
              const result = interceptor(...args)
              if (result === false) {
                isDebug && console.log(`⛔ 事件被阻止: ${event}`)
                return
              }
              const types = ['[object Array]', '[object Object]']
              if (types.includes(Object.prototype.toString.call(result))) {
                if (Array.isArray(result)) {
                  // 返回数组：完全替换
                  args = result
                  isDebug && console.log(`🔄 参数数组被替换: ${event}`, args)
                } else if (args.length === 1) {
                  // 单参数场景：允许直接返回值
                  args = [result]
                  isDebug && console.log(`🔄 单参数被替换: ${event}`, args)
                } else {
                  // 多参数场景：不支持非数组返回值
                  isDebug &&
                    console.info(`⚠️ 多参数事件 ${event} 的拦截器返回了非数组，已忽略`, result)
                }
              }
            }

            return originalEmit!.call(this, event, ...args)
          }

          targetInstance.__interceptorInstalled = true
          targetInstance.__originalEmit = originalEmit

          isDebug && console.log('✅ 事件拦截器安装成功', Object.keys(interceptorsMap))
          return
        }
      }

      retryCount++
      if (retryCount < maxRetries) {
        setTimeout(installInterceptor, 100)
      } else {
        console.error('❌ 未能找到子组件实例')
      }
    }

    installInterceptor()
    //endregion

    const getVisibleData = (oriData = originData) =>
      oriData.slice(config.currentStart, config.currentEnd)
    const updateView = (oriData = originData) => {
      const visibleData = getVisibleData(oriData)
      tableData.value.splice(0, tableData.value.length, ...visibleData)
      updateSelection(visibleData)

      if (tableEl) {
        tableEl.style.paddingTop = `${config.currentStart * config.rowHeight}px`
        tableEl.style.paddingBottom = `${(originData.length - config.currentEnd) * config.rowHeight}px`
      }

      options.onScroll?.({
        scrollTop: config.scrollTop,
        startIndex: config.currentStart,
        endIndex: config.currentEnd,
        totalCount: originData.length,
      })
    }

    const calculateRange = (scrollTop: number) => ({
      startIndex: Math.max(Math.floor(scrollTop / config.rowHeight) - config.bufferSize, 0),
      endIndex: Math.min(
        Math.floor(scrollTop / config.rowHeight) + config.visibleCount + config.bufferSize,
        originData.length,
      ),
    })

    const scrollToRow = (rowIndex: number) => {
      if (rowIndex < 0 || rowIndex >= originData.length) return
      const targetScrollTop = rowIndex * config.rowHeight
      scrollContainer.scrollTop = targetScrollTop
      const { startIndex, endIndex } = calculateRange(targetScrollTop)
      if (config.currentStart !== startIndex || config.currentEnd !== endIndex) {
        config.currentStart = startIndex
        config.currentEnd = endIndex
        isDebug && console.log('scrollToRow 触发视图更新')
        updateView()
      }
    }

    let rafId: number | null = null
    const handleScroll = (scrollTop: number) => {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        config.scrollTop = scrollTop
        const { startIndex, endIndex } = calculateRange(config.scrollTop)

        if (config.currentStart !== startIndex || config.currentEnd !== endIndex) {
          config.currentStart = startIndex
          config.currentEnd = endIndex
          isDebug && console.log('handleScroll 触发视图更新')
          updateView()
        }
        rafId = null
      })
    }

    const refresh = () => {
      config.currentStart = 0
      config.currentEnd = Math.min(config.visibleCount + config.bufferSize, originData.length)
      scrollContainer.scrollTop = 0
      isDebug && console.log('refresh 触发视图更新')
      updateView()
    }

    // 初始化
    config.currentEnd = Math.min(config.visibleCount + config.bufferSize, originData.length)
    isDebug && console.log('初始化 触发视图更新')
    updateView()

    let resizeObserver = null
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => refresh())
      //@ts-ignore
      resizeObserver.observe(scrollContainer)
    }
    // 滚动到底部 - 修复
    const scrollToBottom = () => {
      // 计算最大滚动距离
      const maxScrollTop = originData.length * config.rowHeight - scrollContainer.clientHeight
      scrollContainer.scrollTop = Math.max(0, maxScrollTop)
    }

    // 滚动到顶部 - 修复
    const scrollToTop = () => {
      scrollContainer.scrollTop = 0
    }
    // 添加手动更新数据的方法
    const updateData = (newData: any[]) => {
      if (!newData || !Array.isArray(newData)) return

      originData = newData
      selectedKeys.clear() // 可选：清空选中状态

      // 重新计算范围
      config.currentStart = 0
      config.currentEnd = Math.min(config.visibleCount + config.bufferSize, originData.length)
      config.scrollTop = 0

      // 更新视图
      isDebug && console.log('updateData 触发视图更新')
      updateView()

      // 重置滚动位置
      if (scrollContainer) {
        scrollContainer.scrollTop = 0
      }
    }

    // 暴露方法
    el._virtualScrollUpdateData = updateData
    // 暴露方法
    el._virtualScrollRefresh = refresh
    el._virtualScrollToRow = scrollToRow
    el._virtualScrollSelectAll = selectAll
    el._virtualScrollClearAll = clearAll
    el._virtualScrollToBottom = scrollToBottom
    el._virtualScrollToTop = scrollToTop
    tableInstance._virtualScrollUpdateData = updateData
    tableInstance._virtualScrollRefresh = refresh
    tableInstance._virtualScrollToRow = scrollToRow
    tableInstance._virtualScrollSelectAll = selectAll
    tableInstance._virtualScrollClearAll = clearAll
    tableInstance._virtualScrollToBottom = scrollToBottom
    tableInstance._virtualScrollToTop = scrollToTop
    el._cleanup = () => {
      resizeObserver?.disconnect()
      if (rafId) cancelAnimationFrame(rafId)
    }
    tableInstance._cleanup = el._cleanup
  },

  unmounted(el: { _cleanup: () => void }) {
    el._cleanup?.()
  },
}

export default virtualScrollDirective
