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
    const parentIdKey = '_parentId'
    const levelKey = '_level'
    const childrenKey = 'children'
    const hasChildrenKey = 'hasChildren'
    const originalTableInstance = tableInstance['$']
    const isDebug = options.isDebug
    let originData = options.originData || tableInstance.$attrs?.originData || []
    let originalDataBackup: any[] = []
    let originalDataSortBackup: any[] = []
    let originDataChild: { [key: number | string]: any } = {}
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
    const treeProps =
      tableInstance.treeProps || tableInstance.$props?.treeProps || tableInstance.$attrs?.treeProps

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
      return []
    }
    const log = (...args: (string | any[])[]) => {
      isDebug && console.log(...args)
    }
    const interceptorLog = (event: any, ...args: any[]) => {
      log(`${event} 🔒 拦截器:`, args)
    }
    const originLoad = tableInstance.load
    originalTableInstance.props.load = (row: any, treeNode: any, resolve: any) => {
      const id = row[rowKey]
      const child = originDataChild[id]
      if (child && child.length > 0) {
        resolve(child)
      } else {
        originLoad(row, treeNode, (res: any[]) => {
          originDataChild[id] = res
          resolve(res)
        })
      }
    }
    let isExpanded = false
    let isExpandedRow: { [key: string]: any } = {}

    const childOpen: { [key: string]: boolean } = {}

    const hasChildren = (row: { [x: string]: any }) => {
      return (
        (!!row[treeProps[childrenKey]] && row[treeProps[childrenKey]].length > 0) ||
        row[treeProps[hasChildrenKey]] == true
      )
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
        const { node, parentId: nodeParentId, level: nodeLevel } = stack.pop()
        const children = node[treeProps[childrenKey]]

        // 添加 _level 和 _parentId 到当前节点
        node[levelKey] = nodeLevel
        node[parentIdKey] = nodeParentId

        if (children && children.length > 0) {
          // 记录当前节点的子节点
          map[node[rowKey]] = children

          // 将子节点加入栈，继续处理（level + 1，当前节点ID作为parentId）
          for (let i = children.length - 1; i >= 0; i--) {
            stack.push({
              node: children[i],
              parentId: node[rowKey],
              level: nodeLevel + 1,
            })
          }

          // 删除当前节点的 children 属性
          delete node[treeProps[childrenKey]]
          node[treeProps[hasChildrenKey]] = true
        }
      }

      return map
    }
    const createTreeChild = (data) => {
      Object.assign(originDataChild, flattenTreeToChildrenMap(data))
    }

    const getVisibleData = (oriData = originData) => {
      let data = [...oriData.slice(config.currentStart, config.currentEnd)]
      const allNodeMap = new Map(oriData.map((item) => [item[rowKey], item]))

      // 收集需要展开的父节点ID
      const parentsToExpand = new Set()

      for (const item of data) {
        let parentId = item[parentIdKey]
        while (parentId && allNodeMap.has(parentId)) {
          parentsToExpand.add(parentId)
          parentId = allNodeMap.get(parentId)?.[parentIdKey]
        }
      }

      // 按层级排序（浅→深）
      const sortedParents = [...parentsToExpand].sort((a, b) => {
        const levelA = allNodeMap.get(a)?.[levelKey] ?? 0
        const levelB = allNodeMap.get(b)?.[levelKey] ?? 0
        return levelA - levelB
      })

      // 补充缺失的父节点到 data 中
      for (const parentId of sortedParents) {
        if (!data.some((item) => item[rowKey] === parentId)) {
          const parentNode = allNodeMap.get(parentId)
          if (parentNode) {
            // 找到第一个子节点的位置，插入到前面
            const firstChildIndex = data.findIndex((item) => item[parentIdKey] === parentId)
            if (firstChildIndex !== -1) {
              data.splice(firstChildIndex, 0, parentNode)
            } else {
              data.push(parentNode)
            }
          }
        }
      }

      // 重新构建当前页的映射（因为 data 可能已变化）
      const dataNodeMap = new Map(data.map((item) => [item[rowKey], item]))

      // 逐层展开
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

      createTreeChild(data)
      return data
    }


    const updateView = (oriData = originData) => {
      const savedScrollTop = scrollContainer.scrollTop

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
      // 关键：补偿滚动位置
      const compensatedScrollTop = savedScrollTop + 1
      // 使用 requestAnimationFrame 确保在浏览器调整滚动位置后立即纠正
      // requestAnimationFrame(() => {
      //   if (scrollContainer.scrollTop !== compensatedScrollTop) {
      //     scrollContainer.scrollTop = compensatedScrollTop
      //   }
      // })
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
        log('scrollToRow 触发视图更新')
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
          log('handleScroll 触发视图更新')
          updateView()
        }
        rafId = null
      })
    }

    const refresh = () => {
      config.currentStart = 0
      config.currentEnd = Math.min(config.visibleCount + config.bufferSize, originData.length)
      scrollContainer.scrollTop = 0
      log('refresh 触发视图更新')
      updateView()
    }

    // 初始化
    config.currentEnd = Math.min(config.visibleCount + config.bufferSize, originData.length)
    log('初始化 触发视图更新')
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
      log('updateData 触发视图更新')
      updateView()

      // 重置滚动位置
      if (scrollContainer) {
        scrollContainer.scrollTop = 0
      }
    }
    // region 事件拦截
    const interceptorsMap: interceptorsMapType = {
      'sort-change': (value: { prop: any; order: any }) => {
        interceptorLog('sort-change', value)
        const { prop, order } = value
        if (originalDataSortBackup.length === 0) {
          originalDataSortBackup = [...originData]
        }
        switch (order) {
          case 'ascending':
            log('sort-change ascending 触发视图更新')
            updateView(
              originData
                .filter((item: { [x: string]: any }) => item[levelKey] === 0 || typeof item[levelKey] === 'undefined')
                .sort(
                  (a: { [x: string]: number }, b: { [x: string]: number }) => a[prop] - b[prop],
                ),
            )
            break
          case 'descending':
            log('sort-change descending 触发视图更新')
            updateView(
              originData
                .filter((item: { [x: string]: any }) => item[levelKey] === 0 || typeof item[levelKey] === 'undefined')
                .sort(
                  (a: { [x: string]: number }, b: { [x: string]: number }) => b[prop] - a[prop],
                ),
            )
            break
          default:
            log('sort-change default 触发视图更新')
            originData = [...originalDataSortBackup]
            originalDataSortBackup.length = 0
            updateView(originData)
            break
        }
      },
      select: (value, row) => {
        interceptorLog('select', value, '行数据:', row)
        const isSelect = value.includes(row)
        if (isSelect) selectedKeys.add(getRowKey(row))
        else selectedKeys.delete(getRowKey(row))
        return [originData.filter((row: any) => selectedKeys.has(getRowKey(row))), row]
        // console.log(selectedKeys)
      },
      'select-all': (value) => {
        interceptorLog('select-all', value)
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
      'selection-change': (value) => {
        interceptorLog('select-change', value)
        const selectedRows = originData.filter((row: any) => selectedKeys.has(getRowKey(row)))
        return [selectedRows || []]
      },
      scroll: (value: { scrollLeft: number; scrollTop: number }) => {
        // interceptorLoglog('scroll', value)
        handleScroll(value.scrollTop)
      },
      'filter-change': (value) => {
        interceptorLog('filter-change', value)
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
      'expand-change': (row, expanded) => {
        interceptorLog('expand-change', row, expanded)
        if (typeof expanded === 'boolean') {
          //树
          const index = originData.findIndex(
            (item: { [x: string]: any }) => item[rowKey] === row[rowKey],
          )
          if (!expanded) {
            const sortedParents = []
            let id = row[rowKey]
            let childSize = originData.filter((item: { [x: string]: any }) => item[parentIdKey] == id).length
            while (childSize > 0) {
              originData.splice(index + 1, childSize)
              sortedParents.push(id)
              const child = originData.filter((item: { [x: string]: any }) => item[parentIdKey] == id)
              childSize = child.length
              id = child[0]?.[parentIdKey]
            }
            sortedParents.sort().forEach((item) => {
              tableInstance.updateKeyChildren(item, [])
              store.states.treeData.value[item].loaded = false
            })
          } else {
            if (!originData.find((item: { [x: string]: any }) => item[parentIdKey] === row[rowKey])) {
              originData.splice(
                index + 1,
                0,
                ...originDataChild[row[rowKey]].map((item: { [x: string]: any }) => {
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
        } else {
        }
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
                log(`⛔ 事件被阻止: ${event}`)
                return
              }
              const types = ['[object Array]', '[object Object]']
              if (types.includes(Object.prototype.toString.call(result))) {
                if (Array.isArray(result)) {
                  // 返回数组：完全替换
                  args = result
                  log(`🔄 参数数组被替换: ${event}`, args)
                } else if (args.length === 1) {
                  // 单参数场景：允许直接返回值
                  args = [result]
                  log(`🔄 单参数被替换: ${event}`, args)
                } else {
                  // 多参数场景：不支持非数组返回值
                  log(`⚠️ 多参数事件 ${event} 的拦截器返回了非数组，已忽略`, result)
                }
              }
            }

            return originalEmit!.call(this, event, ...args)
          }

          targetInstance.__interceptorInstalled = true
          targetInstance.__originalEmit = originalEmit

          log('✅ 事件拦截器安装成功', Object.keys(interceptorsMap))
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
