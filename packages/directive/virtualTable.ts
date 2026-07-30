import { interceptorsMapType, virtualConfig } from './types'

// ==================== 类型定义 ====================
interface VirtualScrollOptions {
  originData?: any[];
  rowHeight?: number;
  bufferSize?: number;
  count?: number;
  isVirtual?: boolean;
  isDebug?: boolean;
  interceptorsMap?: interceptorsMapType;
  onInit?: (callback: (data: any[]) => void) => Promise<any[]> | void;
  onScroll?: (data: ScrollData) => void;
}

interface ScrollData {
  scrollTop: number;
  startIndex: number;
  endIndex: number;
  totalCount: number;
}

interface Range {
  startIndex: number;
  endIndex: number;
}

interface UpdateDataOptions {
  resetSelection?: boolean;
  resetScroll?: boolean;
  callback?: () => void;
}

// ==================== 清理管理器 ====================
class CleanupManager {
  private cleanupFunctions: Array<() => void> = [];
  private isCleaned = false;

  add(fn: () => void) {
    if (this.isCleaned) {
      console.warn('[VirtualScroll] CleanupManager 已清理');
      return;
    }
    this.cleanupFunctions.push(fn);
  }

  cleanup() {
    if (this.isCleaned) return;

    for (let i = this.cleanupFunctions.length - 1; i >= 0; i--) {
      try {
        this.cleanupFunctions[i]();
      } catch (error) {
        console.error('[VirtualScroll] 清理函数执行失败:', error);
      }
    }

    this.cleanupFunctions = [];
    this.isCleaned = true;
  }

  isCleanedUp() {
    return this.isCleaned;
  }
}

// ==================== 虚拟滚动指令 ====================
const virtualScrollDirective = {
  mounted(
    el: {
      _virtualScrollUpdateData: (newData: any[], isVirtual?: boolean, options?: UpdateDataOptions) => void;
      _virtualScrollRefresh: () => void;
      _virtualScrollToRow: (rowIndex: any) => void;
      _virtualScrollSelectAll: () => any[];
      _virtualScrollClearAll: () => any[];
      _virtualScrollToBottom: () => void;
      _virtualScrollToTop: () => void;
      _virtualScrollToggleMode: (enableVirtual: boolean) => void;
      _virtualScrollGetMode: () => boolean;
      _cleanup: () => void;
      _cleanupManager: CleanupManager;
      __vueParentComponent: { proxy: any };
      querySelector: (arg0: string) => any;
    },
    binding: { value: virtualConfig },
    vnode: any,
  ) {
    // ==================== 初始化清理管理器 ====================
    const cleanupManager = new CleanupManager();
    el._cleanupManager = cleanupManager;

    // ==================== 获取配置 ====================
    const options = binding.value || { originData: [] };
    const isDebug = options.isDebug || !false;

    const log = (...args: (string | any[])[]) => {
      if (isDebug) console.log('[VirtualScroll]', ...args);
    };

    const error = (...args: any[]) => {
      console.error('[VirtualScroll]', ...args);
    };

    // ==================== 获取表格实例 ====================
    const tableInstance = el.__vueParentComponent?.proxy;
    if (!tableInstance) {
      error('无法获取表格实例');
      return;
    }

    // ==================== 常量定义 ====================
    const parentIdKey = '_parentId';
    const levelKey = '_level';
    const childrenKey = 'children';
    const hasChildrenKey = 'hasChildren';
    const originalTableInstance = tableInstance['$'];

    // ==================== 数据初始化 ====================
    let originData = options.originData || tableInstance.$attrs?.originData || [];
    let originalDataBackup: any[] = [];
    let originalDataSortBackup: any[] = [];
    let originDataChild: { [key: number | string]: any } = {};
    let isFilter = false;

    // ==================== 虚拟化状态 ====================
    let isVirtualEnabled = options.isVirtual !== false;
    let originalTableData: any[] = [];

    // ==================== 异步数据初始化 ====================
    if (options.onInit && (!originData || originData.length === 0)) {
      try {
        const result = options.onInit((data: any[]) => {
          if (data && data.length > 0) {
            originData = data;
            if (!cleanupManager.isCleanedUp()) {
              refresh();
            }
          }
        });

        if (result && typeof result.then === 'function') {
          result.then((data) => {
            if (data && data.length > 0) {
              originData = data;
              if (!cleanupManager.isCleanedUp()) {
                refresh();
              }
            }
          }).catch(err => {
            error('数据初始化失败:', err);
          });
        }
      } catch (err) {
        error('onInit 执行失败:', err);
      }
    }

    if (!Array.isArray(originData)) {
      error('originData 必须是数组');
      return;
    }

    // ==================== 获取 Store ====================
    const states = tableInstance.store?.states;
    const tableData = states?.data;
    if (!tableData) {
      error('无法获取表格数据 store');
      return;
    }

    // ==================== 获取配置 ====================
    const rowKey = tableInstance.rowKey || tableInstance.$props?.rowKey || tableInstance.$attrs?.rowKey || 'id';
    const getRowKey = typeof rowKey === 'function' ? rowKey : (row: any) => row[rowKey];
    const treeProps = tableInstance.treeProps || tableInstance.$props?.treeProps || tableInstance.$attrs?.treeProps || {};

    const config = {
      rowHeight: options.rowHeight || 40,
      bufferSize: options.bufferSize || 5,
      visibleCount: options.count || 20,
      currentStart: 0,
      currentEnd: 0,
      scrollTop: 0,
    };

    // ==================== DOM 引用 ====================
    const scrollContainer = el.querySelector('.el-scrollbar__wrap');
    if (!scrollContainer) {
      error('无法找到滚动容器');
      return;
    }

    const tableEl = el.querySelector('.el-table__body-wrapper')?.querySelector('table');

    // ==================== 状态管理 ====================
    const selectedKeys = new Map<string | number, any>();
    const store = tableInstance.store;
    const selection = store?.states?.selection;

    let isExpanded = false;
    let isExpandedRow: { [key: string]: any } = {};
    const childOpen: { [key: string]: boolean } = {};

    // ==================== 滚动相关 ====================
    let rafId: number | null = null;
    let scrollHandler: ((event: Event) => void) | null = null;
    let resizeObserver: ResizeObserver | null = null;

    // ==================== 拦截器相关 ====================
    let originalEmit: Function | null = null;
    let targetInstance: any = null;
    let retryCount = 0;
    const maxRetries = 30;

    // ==================== 核心函数 ====================

    const getSelectable = () => {
      const selectionColumn = tableInstance?.columns?.find(
        (col: { type: string }) => col.type === 'selection',
      );
      return selectionColumn?.selectable || (() => true);
    };

    const updateSelection = (data: any[] = getVisibleData()) => {
      if (!selection || cleanupManager.isCleanedUp()) return;
      const selects = data!.filter((row: any) => selectedKeys.has(getRowKey(row)));
      if (selects.length === 0 && selectedKeys.size > 0) {
        const found = originData?.find((row: any) => selectedKeys.has(getRowKey(row)));
        if (found) selects.push(found);
      }
      selection.value = selects;
    };

    const selectAll = () => {
      if (cleanupManager.isCleanedUp()) return [];
      const selectable = getSelectable();
      const nowSelectData: any[] = [];
      originData.forEach((row: any) => {
        if (selectable(row)) {
          selectedKeys.set(getRowKey(row), row);
          nowSelectData.push(row);
        }
      });
      updateSelection();
      return nowSelectData;
    };

    const clearAll = () => {
      if (cleanupManager.isCleanedUp()) return [];
      selectedKeys.clear();
      updateSelection();
      return [];
    };

    const logInfo = (...args: (string | any[])[]) => {
      if (isDebug) console.log('[VirtualScroll]', ...args);
    };

    const interceptorLog = (event: any, ...args: any[]) => {
      logInfo(`${event} 🔒 拦截器:`, args);
    };

    // ==================== 树形数据处理 ====================
    const hasChildren = (row: any) => {
      return (
        (!!row[treeProps[childrenKey]] && row[treeProps[childrenKey]].length > 0) ||
        row[treeProps[hasChildrenKey]] == true
      );
    };

    const flattenTreeToChildrenMap = (data: any[], parentId = undefined, level = 0) => {
      const map: { [key: string]: any } = {};
      const stack = [
        ...data.map((node) => ({
          node,
          parentId: node[parentIdKey] || parentId,
          level: node[levelKey] || level,
        })),
      ];

      while (stack.length) {
        const { node, parentId: nodeParentId, level: nodeLevel } = stack.pop()!;
        const children = node[treeProps[childrenKey]];

        node[levelKey] = nodeLevel;
        node[parentIdKey] = nodeParentId;

        if (children && children.length > 0) {
          map[node[rowKey]] = children;

          for (let i = children.length - 1; i >= 0; i--) {
            stack.push({
              node: children[i],
              parentId: node[rowKey],
              level: nodeLevel + 1,
            });
          }

          delete node[treeProps[childrenKey]];
          node[treeProps[hasChildrenKey]] = true;
        }
      }

      return map;
    };

    const createTreeChild = (data: any[]) => {
      if (cleanupManager.isCleanedUp()) return;
      Object.assign(originDataChild, flattenTreeToChildrenMap(data));
    };

    // ==================== 计算和渲染函数 ====================
    const calculateRange = (scrollTop: number): Range => ({
      startIndex: Math.max(Math.floor(scrollTop / config.rowHeight) - config.bufferSize, 0),
      endIndex: Math.min(
        Math.floor(scrollTop / config.rowHeight) + config.visibleCount + config.bufferSize,
        originData.length,
      ),
    });

    const getVisibleData = (oriData = originData) => {
      if (cleanupManager.isCleanedUp()) return [];

      let data = [...oriData.slice(config.currentStart, config.currentEnd)];
      const allNodeMap = new Map<string | number, any>(
        oriData.map((item: any) => [item[rowKey], item]),
      );

      const parentsToExpand = new Set<string | number>();

      for (const item of data) {
        let parentId = item[parentIdKey];
        while (parentId && allNodeMap.has(parentId)) {
          parentsToExpand.add(parentId);
          parentId = allNodeMap.get(parentId)?.[parentIdKey];
        }
      }

      const sortedParents = [...parentsToExpand].sort((a, b) => {
        const levelA = allNodeMap.get(a)?.[levelKey] ?? 0;
        const levelB = allNodeMap.get(b)?.[levelKey] ?? 0;
        return levelA - levelB;
      });

      for (const parentId of sortedParents) {
        if (!data.some((item) => item[rowKey] === parentId)) {
          const parentNode = allNodeMap.get(parentId);
          if (parentNode) {
            const firstChildIndex = data.findIndex((item) => item[parentIdKey] === parentId);
            if (firstChildIndex !== -1) {
              data.splice(firstChildIndex, 0, parentNode);
            } else {
              data.push(parentNode);
            }
          }
        }
      }

      const dataNodeMap = new Map(data.map((item) => [item[rowKey], item]));

      for (const parentId of sortedParents) {
        const parentNode = dataNodeMap.get(parentId);
        if (!parentNode) continue;

        if (store.states.treeData.value[parentId]) {
          store.states.treeData.value[parentId].expanded = true;
        } else {
          store.states.treeData.value[parentId] = {
            children: [],
            lazy: true,
            level: parentNode[levelKey] || 0,
            expanded: true,
            loaded: false,
            loading: false,
            display: true,
          };
        }

        const children = data.filter((item) => item[parentIdKey] === parentId);
        tableInstance.updateKeyChildren(parentId, children);
        tableInstance.toggleRowExpansion(parentNode, true);
        data = data.filter((item) => item[parentIdKey] !== parentId);
      }

      createTreeChild(data);
      return data;
    };

    const updateView = (oriData = originData) => {
      if (cleanupManager.isCleanedUp()) return;

      const savedScrollTop = scrollContainer.scrollTop;
      const visibleData = getVisibleData(oriData);
      tableData.value.splice(0, tableData.value.length, ...visibleData);
      updateSelection(visibleData);

      if (tableEl) {
        tableEl.style.paddingTop = `${config.currentStart * config.rowHeight}px`;
        tableEl.style.paddingBottom = `${(originData.length - config.currentEnd) * config.rowHeight}px`;
      }

      options.onScroll?.({
        scrollTop: config.scrollTop,
        startIndex: config.currentStart,
        endIndex: config.currentEnd,
        totalCount: originData.length,
      });
    };

    // ==================== 渲染模式 ====================
    const renderDirect = (data: any[]) => {
      if (cleanupManager.isCleanedUp()) return;

      if (tableEl) {
        tableEl.style.paddingTop = '0px';
        tableEl.style.paddingBottom = '0px';
      }

      tableData.value = data;
      logInfo('直接渲染模式，数据量:', String(data.length));
    };

    const renderVirtual = (data: any[]) => {
      if (cleanupManager.isCleanedUp()) return;

      originData = data;

      config.currentStart = 0;
      config.currentEnd = Math.min(config.visibleCount + config.bufferSize, originData.length);
      config.scrollTop = 0;

      if (tableEl) {
        tableEl.style.paddingTop = `${config.currentStart * config.rowHeight}px`;
        tableEl.style.paddingBottom = `${(originData.length - config.currentEnd) * config.rowHeight}px`;
      }

      updateView();

      if (scrollContainer) {
        scrollContainer.scrollTop = 0;
      }

      logInfo('虚拟化渲染模式，数据量:', String(data.length));
    };

    // ==================== 切换虚拟化模式 ====================
    const switchVirtualMode = (enableVirtual: boolean, data?: any[]) => {
      if (cleanupManager.isCleanedUp()) return;

      const targetData = data || originData;

      if (!targetData || !Array.isArray(targetData)) {
        error('switchVirtualMode: 数据无效');
        return;
      }

      if (isVirtualEnabled === enableVirtual) {
        if (enableVirtual) {
          renderVirtual(targetData);
        } else {
          renderDirect(targetData);
        }
        return;
      }

      isVirtualEnabled = enableVirtual;
      logInfo(`🔄 切换虚拟化模式: ${enableVirtual ? '虚拟化' : '直接渲染'}`);

      if (enableVirtual) {
        if (!isVirtualEnabled && originalTableData.length > 0) {
          originData = [...originalTableData];
        } else {
          originData = targetData;
        }

        selectedKeys.clear();

        config.currentStart = 0;
        config.currentEnd = Math.min(config.visibleCount + config.bufferSize, originData.length);
        config.scrollTop = 0;

        if (!scrollHandler) {
          scrollHandler = (event: Event) => {
            const target = event.target as HTMLElement;
            if (target && !cleanupManager.isCleanedUp()) {
              handleScroll(target.scrollTop);
            }
          };
          scrollContainer.addEventListener('scroll', scrollHandler);

          cleanupManager.add(() => {
            if (scrollContainer && scrollHandler) {
              scrollContainer.removeEventListener('scroll', scrollHandler);
              scrollHandler = null;
              logInfo('✅ 滚动事件已移除');
            }
          });
        }

        if (!resizeObserver && typeof ResizeObserver !== 'undefined') {
          resizeObserver = new ResizeObserver(() => {
            if (!cleanupManager.isCleanedUp()) {
              refresh();
            }
          });
          resizeObserver.observe(scrollContainer);

          cleanupManager.add(() => {
            if (resizeObserver) {
              resizeObserver.disconnect();
              resizeObserver = null;
              logInfo('✅ ResizeObserver 已清理');
            }
          });
        }

        renderVirtual(originData);
      } else {
        originalTableData = [...targetData];

        if (scrollHandler) {
          scrollContainer.removeEventListener('scroll', scrollHandler);
          scrollHandler = null;
        }

        if (resizeObserver) {
          resizeObserver.disconnect();
          resizeObserver = null;
        }

        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }

        renderDirect(targetData);
      }
    };

    // ==================== 滚动处理 ====================
    const handleScroll = (scrollTop: number) => {
      if (cleanupManager.isCleanedUp()) return;
      if (!isVirtualEnabled) return;
      if (rafId) return;

      rafId = requestAnimationFrame(() => {
        config.scrollTop = scrollTop;
        const { startIndex, endIndex } = calculateRange(config.scrollTop);

        if (config.currentStart !== startIndex || config.currentEnd !== endIndex) {
          config.currentStart = startIndex;
          config.currentEnd = endIndex;
          logInfo('handleScroll 触发视图更新');
          updateView();
        }
        rafId = null;
      });
    };

    // ==================== 公共方法 ====================
    const refresh = () => {
      if (cleanupManager.isCleanedUp()) return;

      if (!isVirtualEnabled) {
        renderDirect(originData);
        return;
      }

      config.currentStart = 0;
      config.currentEnd = Math.min(config.visibleCount + config.bufferSize, originData.length);
      scrollContainer.scrollTop = 0;
      logInfo('refresh 触发视图更新');
      updateView();
    };

    const scrollToRow = (rowIndex: number) => {
      if (cleanupManager.isCleanedUp()) return;
      if (!isVirtualEnabled) {
        logInfo('非虚拟化模式，不支持 scrollToRow');
        return;
      }
      if (rowIndex < 0 || rowIndex >= originData.length) return;

      const targetScrollTop = rowIndex * config.rowHeight;
      scrollContainer.scrollTop = targetScrollTop;
      const { startIndex, endIndex } = calculateRange(targetScrollTop);
      if (config.currentStart !== startIndex || config.currentEnd !== endIndex) {
        config.currentStart = startIndex;
        config.currentEnd = endIndex;
        logInfo('scrollToRow 触发视图更新');
        updateView();
      }
    };

    const scrollToBottom = () => {
      if (cleanupManager.isCleanedUp()) return;
      if (!isVirtualEnabled) {
        logInfo('非虚拟化模式，不支持 scrollToBottom');
        return;
      }
      const maxScrollTop = originData.length * config.rowHeight - scrollContainer.clientHeight;
      scrollContainer.scrollTop = Math.max(0, maxScrollTop);
    };

    const scrollToTop = () => {
      if (cleanupManager.isCleanedUp()) return;
      if (!isVirtualEnabled) {
        logInfo('非虚拟化模式，不支持 scrollToTop');
        return;
      }
      scrollContainer.scrollTop = 0;
    };

    const toggleVirtualMode = (enableVirtual: boolean) => {
      if (cleanupManager.isCleanedUp()) return;

      if (isVirtualEnabled === enableVirtual) {
        logInfo('模式已经是:', enableVirtual ? '虚拟化' : '直接渲染');
        return;
      }

      const currentData = tableData.value || originData;
      switchVirtualMode(enableVirtual, currentData);
    };

    const getVirtualMode = () => isVirtualEnabled;

    const updateData = (
      newData: any[],
      isVirtual: boolean = options.isVirtual !== false,
      updateOptions?: UpdateDataOptions
    ) => {
      if (cleanupManager.isCleanedUp()) {
        logInfo('组件已清理，跳过 updateData');
        return;
      }

      if (!newData || !Array.isArray(newData)) {
        error('updateData: 数据必须是数组');
        return;
      }
      logInfo('📊 updateData 调用:', {
        //@ts-ignore
        '数据量': newData.length,
        '虚拟化': isVirtual,
        '选项': updateOptions
      });

      originData = newData;

      if (updateOptions?.resetSelection !== false) {
        selectedKeys.clear();
      } else {
        const newDataKeys = new Set(newData.map((item: any) => getRowKey(item)));
        for (const [key] of selectedKeys) {
          if (!newDataKeys.has(key)) {
            selectedKeys.delete(key);
          }
        }
      }

      switchVirtualMode(isVirtual, newData);

      if (updateOptions?.resetScroll !== false && scrollContainer) {
        scrollContainer.scrollTop = 0;
      }

      if (updateOptions?.callback) {
        updateOptions.callback();
      }

      logInfo('✅ updateData 完成');
    };

    // ==================== 事件拦截器 ====================
    const interceptorsMap: interceptorsMapType = {
      'sort-change': (value: { prop: any; order: any }) => {
        interceptorLog('sort-change', value);
        if (cleanupManager.isCleanedUp() || !isVirtualEnabled) return;

        const { prop, order } = value;
        if (originalDataSortBackup.length === 0) {
          originalDataSortBackup = [...originData];
        }
        switch (order) {
          case 'ascending':
            logInfo('sort-change ascending 触发视图更新');
            updateView(
              originData
                .filter((item: any) => item[levelKey] === 0 || typeof item[levelKey] === 'undefined')
                .sort((a: any, b: any) => a[prop] - b[prop]),
            );
            break;
          case 'descending':
            logInfo('sort-change descending 触发视图更新');
            updateView(
              originData
                .filter((item: any) => item[levelKey] === 0 || typeof item[levelKey] === 'undefined')
                .sort((a: any, b: any) => b[prop] - a[prop]),
            );
            break;
          default:
            logInfo('sort-change default 触发视图更新');
            originData = [...originalDataSortBackup];
            originalDataSortBackup.length = 0;
            updateView(originData);
            break;
        }
      },
      select: (value: any[], row: any) => {
        interceptorLog('select', value, '行数据:', row);
        if (cleanupManager.isCleanedUp()) return;

        const isSelect = value.includes(row);
        if (isSelect) selectedKeys.set(getRowKey(row), row);
        else selectedKeys.delete(getRowKey(row));
        return [originData.filter((row: any) => selectedKeys.has(getRowKey(row))), row];
      },
      'select-all': (value: any[]) => {
        interceptorLog('select-all', value);
        if (cleanupManager.isCleanedUp()) return;

        const valueLength = value.length;
        let data;
        if (valueLength === 0) {
          data = [clearAll()];
        } else {
          data = [selectAll()];
        }
        tableInstance.$emit?.('selection-change');
        return data;
      },
      'selection-change': (value: any[]) => {
        interceptorLog('selection-change', value);
        if (cleanupManager.isCleanedUp()) return;

        const selectedRows = originData.filter((row: any) => selectedKeys.has(getRowKey(row)));
        return [selectedRows || []];
      },
      scroll: (value: { scrollLeft: number; scrollTop: number }) => {
        handleScroll(value.scrollTop);
      },
      'filter-change': (value: any) => {
        interceptorLog('filter-change', value);
        if (cleanupManager.isCleanedUp() || !isVirtualEnabled) return;

        const filterCondition: any[][] = Object.values(value);
        const isNowFilter = !!filterCondition.find(
          (filterConditionItem: any[]) => filterConditionItem.length > 0,
        );
        if (!isFilter && isNowFilter) originalDataBackup = [...originData];
        else originData = [...originalDataBackup];
        isFilter = isNowFilter;
        states.columns.value.map(
          (columnConfig: {
            filterMethod: (value: any, row: any, column: any) => boolean;
            filteredValue: any[];
            columnKey: string;
          }) => {
            const filterNowData = columnConfig.filteredValue;
            if (filterNowData.length > 0) {
              const filterMethod = columnConfig.filterMethod;
              if (!filterMethod) {
                return;
              }
              originData = originData.filter((dataItem: any) => {
                return !!filterNowData.find((filterNowDataItem: any) =>
                  filterMethod(filterNowDataItem, dataItem, columnConfig),
                );
              });
            }
          },
        );

        refresh();
      },
      'expand-change': (row: any, expanded: boolean) => {
        interceptorLog('expand-change', row, expanded);
        if (cleanupManager.isCleanedUp() || !isVirtualEnabled) return;

        if (typeof expanded === 'boolean') {
          const index = originData.findIndex((item: any) => item[rowKey] === row[rowKey]);
          if (!expanded) {
            const sortedParents = [];
            let id = row[rowKey];
            let childSize = originData.filter((item: any) => item[parentIdKey] == id).length;
            while (childSize > 0) {
              originData.splice(index + 1, childSize);
              sortedParents.push(id);
              const child = originData.filter((item: any) => item[parentIdKey] == id);
              childSize = child.length;
              id = child[0]?.[parentIdKey];
            }
            sortedParents.sort().forEach((item) => {
              tableInstance.updateKeyChildren(item, []);
              store.states.treeData.value[item].loaded = false;
            });
          } else {
            if (!originData.find((item: any) => item[parentIdKey] === row[rowKey])) {
              originData.splice(
                index + 1,
                0,
                ...originDataChild[row[rowKey]].map((item: any) => {
                  item[levelKey] = (row[levelKey] || 0) + 1;
                  item[parentIdKey] = row[rowKey];
                  return item;
                }),
              );
            }
          }
          isExpanded = expanded;
          isExpandedRow = row;
          childOpen[row[rowKey]] = expanded;
          updateView();
        }
      },
      'virtual-mode-change': (enableVirtual: boolean) => {
        interceptorLog('virtual-mode-change', enableVirtual);
        toggleVirtualMode(enableVirtual);
      },
      ...(options.interceptorsMap || {}),
    };

    // ==================== 安装拦截器 ====================
    const installInterceptor = () => {
      if (cleanupManager.isCleanedUp()) return;

      const childProxy = tableInstance || tableInstance.$refs?.childRef || tableInstance.refs?.childRef;

      if (childProxy) {
        let childInstance = null;

        if (childProxy.$) {
          childInstance = childProxy.$;
        } else if (childProxy.__vnode) {
          childInstance = childProxy.__vnode.component;
        } else if (childProxy._) {
          childInstance = childProxy._;
        } else if (childProxy.proxy) {
          childInstance = childProxy.proxy;
        }

        targetInstance = childInstance?.emit ? childInstance : childProxy;

        if (
          targetInstance &&
          typeof targetInstance.emit === 'function' &&
          !targetInstance.__interceptorInstalled
        ) {
          originalEmit = targetInstance.emit;

          targetInstance.emit = function (event: string, ...args: any[] | any) {
            const interceptor = interceptorsMap[event];
            if (interceptor) {
              const result = interceptor(...args);
              if (result === false) {
                logInfo(`⛔ 事件被阻止: ${event}`);
                return;
              }
              const types = ['[object Array]', '[object Object]'];
              if (types.includes(Object.prototype.toString.call(result))) {
                if (Array.isArray(result)) {
                  args = result;
                  logInfo(`🔄 参数数组被替换: ${event}`, args);
                } else if (args.length === 1) {
                  args = [result];
                  logInfo(`🔄 单参数被替换: ${event}`, args);
                } else {
                  //@ts-ignore
                  logInfo(`⚠️ 多参数事件 ${event} 的拦截器返回了非数组，已忽略`, result);
                }
              }
            }
            return originalEmit!.call(this, event, ...args);
          };

          targetInstance.__interceptorInstalled = true;
          targetInstance.__originalEmit = originalEmit;

          cleanupManager.add(() => {
            if (targetInstance && originalEmit) {
              targetInstance.emit = originalEmit;
              targetInstance.__interceptorInstalled = false;
              targetInstance.__originalEmit = null;
              logInfo('✅ 拦截器已清理');
            }
          });

          logInfo('✅ 事件拦截器安装成功', Object.keys(interceptorsMap));
          return;
        }
      }

      retryCount++;
      if (retryCount < maxRetries) {
        setTimeout(installInterceptor, 100);
      } else {
        error('❌ 未能找到子组件实例');
      }
    };

    // ==================== 初始化树形数据加载 ====================
    const originLoad = tableInstance.load;
    if (originLoad && typeof originLoad === 'function') {
      const originalLoadFn = originLoad;

      originalTableInstance.props.load = (row: any, treeNode: any, resolve: any) => {
        if (cleanupManager.isCleanedUp()) {
          resolve([]);
          return;
        }

        const id = row[rowKey];
        const child = originDataChild[id];
        if (child && child.length > 0) {
          resolve(child);
        } else {
          originalLoadFn(row, treeNode, (res: any[]) => {
            if (cleanupManager.isCleanedUp()) {
              resolve([]);
              return;
            }
            originDataChild[id] = res;
            resolve(res);
          });
        }
      };

      cleanupManager.add(() => {
        if (originalTableInstance && originalTableInstance.props && originalLoadFn) {
          originalTableInstance.props.load = originalLoadFn;
          logInfo('✅ load 方法已恢复');
        }
      });
    }

    // ==================== 初始化渲染 ====================
    if (isVirtualEnabled) {
      config.currentEnd = Math.min(config.visibleCount + config.bufferSize, originData.length);
      logInfo('初始化虚拟化渲染');
      updateView();
    } else {
      logInfo('初始化直接渲染');
      renderDirect(originData);
    }

    // ==================== 添加滚动事件监听 ====================
    if (isVirtualEnabled) {
      scrollHandler = (event: Event) => {
        const target = event.target as HTMLElement;
        if (target && !cleanupManager.isCleanedUp()) {
          handleScroll(target.scrollTop);
        }
      };
      scrollContainer.addEventListener('scroll', scrollHandler);

      cleanupManager.add(() => {
        if (scrollContainer && scrollHandler) {
          scrollContainer.removeEventListener('scroll', scrollHandler);
          scrollHandler = null;
          logInfo('✅ 滚动事件已移除');
        }
      });

      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(() => {
          if (!cleanupManager.isCleanedUp()) {
            refresh();
          }
        });
        resizeObserver.observe(scrollContainer);

        cleanupManager.add(() => {
          if (resizeObserver) {
            resizeObserver.disconnect();
            resizeObserver = null;
            logInfo('✅ ResizeObserver 已清理');
          }
        });
      }
    }

    // ==================== 安装拦截器 ====================
    installInterceptor();

    // ==================== 清理动画帧 ====================
    cleanupManager.add(() => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
        logInfo('✅ 动画帧已取消');
      }
    });

    // ==================== 清理数据引用 ====================
    cleanupManager.add(() => {
      selectedKeys.clear();
      originData = [];
      originalDataBackup = [];
      originalDataSortBackup = [];
      originalTableData = [];
      Object.keys(originDataChild).forEach(key => {
        delete originDataChild[key];
      });
      Object.keys(childOpen).forEach(key => {
        delete childOpen[key];
      });
      isExpanded = false;
      isExpandedRow = {};
      logInfo('✅ 数据引用已清理');
    });

    // ==================== 清理表格引用 ====================
    cleanupManager.add(() => {
      if (tableInstance) {
        delete tableInstance._virtualScrollUpdateData;
        delete tableInstance._virtualScrollRefresh;
        delete tableInstance._virtualScrollToRow;
        delete tableInstance._virtualScrollSelectAll;
        delete tableInstance._virtualScrollClearAll;
        delete tableInstance._virtualScrollToBottom;
        delete tableInstance._virtualScrollToTop;
        delete tableInstance._virtualScrollToggleMode;
        delete tableInstance._virtualScrollGetMode;
        delete tableInstance._cleanup;
      }
      logInfo('✅ 表格引用已清理');
    });

    // ==================== 暴露方法 ====================
    const cleanup = () => {
      cleanupManager.cleanup();
      //@ts-ignore
      el._cleanup = undefined;
      //@ts-ignore
      el._cleanupManager = undefined;
      logInfo('✅ 所有资源已清理');
    };

    el._virtualScrollUpdateData = updateData;
    el._virtualScrollRefresh = refresh;
    el._virtualScrollToRow = scrollToRow;
    el._virtualScrollSelectAll = selectAll;
    el._virtualScrollClearAll = clearAll;
    el._virtualScrollToBottom = scrollToBottom;
    el._virtualScrollToTop = scrollToTop;
    el._virtualScrollToggleMode = toggleVirtualMode;
    el._virtualScrollGetMode = getVirtualMode;
    el._cleanup = cleanup;

    tableInstance._virtualScrollUpdateData = updateData;
    tableInstance._virtualScrollRefresh = refresh;
    tableInstance._virtualScrollToRow = scrollToRow;
    tableInstance._virtualScrollSelectAll = selectAll;
    tableInstance._virtualScrollClearAll = clearAll;
    tableInstance._virtualScrollToBottom = scrollToBottom;
    tableInstance._virtualScrollToTop = scrollToTop;
    tableInstance._virtualScrollToggleMode = toggleVirtualMode;
    tableInstance._virtualScrollGetMode = getVirtualMode;
    tableInstance._cleanup = cleanup;

    logInfo('✅ 虚拟滚动指令初始化完成，当前模式:', isVirtualEnabled ? '虚拟化' : '直接渲染');
  },

  // ==================== 卸载清理 ====================
  unmounted(el: { _cleanup: () => void; _cleanupManager?: CleanupManager }) {
    if (el._cleanupManager) {
      el._cleanupManager.cleanup();
    }
    if (el._cleanup) {
      el._cleanup();
    }
  },
};

export default virtualScrollDirective;
