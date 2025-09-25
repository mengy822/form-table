import { ref, watchEffect, onUnmounted, onMounted } from 'vue';

/**
 * 防抖和节流的 Hook 函数
 * @param {Function} callback - 要执行的回调函数
 * @param {number} delay - 防抖或节流的延迟时间（毫秒）
 * @param {string} type - 'debounce' 或 'throttle'，表示防抖或节流
 * @returns {Function} - 触发防抖或节流操作的函数
 */
export function useDebounceThrottle(callback:Function, delay:number = 500, type:'debounce'|'throttle' = 'debounce'):Function {
  // 标志是否正在等待延迟执行
  let timer: number | undefined;
  // 标志节流的上次执行时间
  let lastExecuted: number;

  // 触发防抖或节流的函数
  function trigger() {
    // 根据类型进行不同的处理
    if (type === 'debounce') {
      // 防抖：清除之前的定时器
      clearTimeout(timer);
      timer = setTimeout(() => {
        callback();
      }, delay);
    } else if (type === 'throttle') {
      // 节流：如果距离上次执行超过延迟时间，则执行回调
      const now = Date.now();
      if (!lastExecuted || now - lastExecuted >= delay) {
        callback();
        lastExecuted = now;
      }
    }
  }

  // 组件卸载时清除定时器
  onUnmounted(() => {
    clearTimeout(timer);
  });

  // 返回触发函数
  return trigger;
}

// 定义获取鼠标位置的 hook
export function useMousePosition() {
  // 使用 ref 创建响应式变量来存储鼠标的 x 和 y 坐标
  const x = ref(0);
  const y = ref(0);

  // 鼠标移动事件处理函数
  const handleMouseMove = (event: { pageX: number; pageY: number; }) => {
    x.value = event.pageX;
    y.value = event.pageY;
  };

  // 在组件挂载时添加鼠标移动事件监听
  onMounted(() => {
    window.addEventListener('mousemove', handleMouseMove);
  });

  // 在组件卸载前移除鼠标移动事件监听
  onUnmounted(() => {
    window.removeEventListener('mousemove', handleMouseMove);
  });

  // 返回包含 x 和 y 坐标的对象
  return { x, y };
}


export function useWindowResize() {
  // 使用 ref 创建响应式的 width 和 height 变量，用于存储窗口的宽度和高度
  const width = ref(0);
  const height = ref(0);

  // 定义一个处理窗口大小变化的函数
  function onResize() {
    width.value = window.innerWidth;
    height.value = window.innerHeight;
  }

  // 在组件挂载时，为 window 对象添加 resize 事件监听器
  onMounted(() => {
    window.addEventListener("resize", onResize);
    onResize(); // 立即获取一次窗口大小并更新 width 和 height 的值
  });

  // 在组件卸载时，移除 window 对象的 resize 事件监听器
  onUnmounted(() => {
    window.removeEventListener("resize", onResize);
  });

  // 返回包含 width 和 height 的对象，以便在组件中使用
  return { width, height };
}



/**
 * 缓存/预加载的 hook
 * @param {Function} loadFunction - 用于加载数据的函数
 * @param {Object} options - 配置选项
 * @param {number} options.cacheTime - 缓存的有效时间（毫秒），默认 5 分钟
 * @returns {Object} - 包含加载状态、数据和加载函数的对象
 */
export function useCachePreload(loadFunction: () => any, { cacheTime = 5 * 60 * 1000 } = {}) {
  // 加载状态
  const loading = ref(false);
  // 数据
  const data = ref(null);
  // 上次加载的时间
  const lastLoadTime = ref(0);

  /**
   * 加载数据的函数
   */
  const loadData = async () => {
    loading.value = true;
    try {
      // 如果缓存未过期，直接使用缓存数据
      if (Date.now() - lastLoadTime.value < cacheTime && data.value) {
        return;
      }
      const newData = await loadFunction();
      data.value = newData;
      lastLoadTime.value = Date.now();
    } catch (error) {
      console.error('加载数据出错:', error);
    } finally {
      loading.value = false;
    }
  };

  // 组件挂载时加载数据
  onMounted(loadData);

  // 返回相关数据和函数供组件使用
  return {
    loading,
    data,
    loadData
  };
}



/**
 * 用于封装媒体查询的钩子函数
 * @param {string} query - 媒体查询语句
 * @returns {boolean} - 媒体查询的匹配结果
 */
export const useMatchMedia = (query: string) => {
  // 创建媒体查询对象
  const mediaQuery = window.matchMedia(query);
  // 使用 ref 创建一个响应式变量来存储匹配结果
  const match = ref(mediaQuery.matches);

  // 定义一个在媒体查询状态改变时触发的回调函数
  const onChange = (e: { matches: boolean; }) => {
    match.value = e.matches;
  };

  // 使用 watchEffect 钩子在组件挂载时添加媒体查询事件监听器，并在组件卸载时移除
  onMounted(() => {
    mediaQuery.addEventListener('change', onChange);
  });

  onUnmounted(() => {
    mediaQuery.removeEventListener('change', onChange);
  });

  return match.value;
};


/**
 * 滚动相关操作和状态的 hook
 * @returns {Object} 包含滚动相关操作和状态的对象
 */
export function useScroll() {
  // 滚动位置（垂直方向）
  const scrollTop = ref(0);
  // 是否滚动到底部
  const isBottom = ref(false);
  // 滚动方向，'up' 表示向上，'down' 表示向下，'none' 表示未滚动
  const scrollDirection = ref('none');
  // 记录上一次的滚动位置
  const prevScrollTop = ref(0);

  // 滚动到顶部的函数
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior:'smooth'
    });
  };

  // 监听滚动事件
  const handleScroll = (event: { target: { scrollHeight: any; clientHeight: any; }; }) => {
    scrollTop.value = window.pageYOffset || document.documentElement.scrollTop;

    const scrollHeight = event.target.scrollHeight;
    const clientHeight = event.target.clientHeight;
    if (scrollTop.value + clientHeight >= scrollHeight) {
      isBottom.value = true;
    } else {
      isBottom.value = false;
    }

    // 判断滚动方向
    const currentScrollTop = scrollTop.value;
    if (currentScrollTop > prevScrollTop.value) {
      scrollDirection.value = 'down';
    } else if (currentScrollTop < prevScrollTop.value) {
      scrollDirection.value = 'up';
    } else {
      scrollDirection.value = 'none';
    }

    prevScrollTop.value = currentScrollTop;
  };

  // 组件挂载时添加滚动事件监听
  onMounted(() => {
    window.addEventListener('scroll', handleScroll);
  });

  // 组件卸载时移除滚动事件监听
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
  });

  // 返回滚动相关的数据和操作
  return {
    scrollTop,
    isBottom,
    scrollDirection,
    scrollToTop
  };
}


/**
 * 监听网络状态变化的 hook
 * @returns {Object} 包含网络状态和监听相关方法的对象
 */
export function useNetworkStatus() {
  // 网络状态，初始为未知
  const networkStatus = ref('unknown');

  // 网络状态变化的处理函数
  const handleNetworkChange = () => {
    networkStatus.value = navigator.onLine? 'online' : 'offline';
  };

  // 组件挂载时添加网络状态变化的监听
  onMounted(() => {
    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);
  });

  // 组件卸载时移除监听
  onUnmounted(() => {
    window.removeEventListener('online', handleNetworkChange);
    window.removeEventListener('offline', handleNetworkChange);
  });

  // 返回网络状态和相关方法
  return {
    networkStatus
  };
}


/**
 * 实现复制到剪贴板功能的 hook
 * @param {string} text - 要复制的文本
 * @returns {Object} 包含复制状态和复制操作的对象
 */
export function useCopyToClipboard(text: string) {
  // 复制状态，初始为未复制
  const isCopied = ref(false);

  // 执行复制操作的函数
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      isCopied.value = true;
    } catch (err) {
      console.error('复制到剪贴板失败:', err);
    }
  };

  // 组件挂载时添加事件处理
  onMounted(() => {
    // 一段时间后将复制状态恢复为未复制，以避免一直显示已复制
    setTimeout(() => {
      isCopied.value = false;
    }, 3000);
  });

  // 返回复制状态和复制操作
  return {
    isCopied,
    copyToClipboard
  };
}


/**
 * 让元素具有可拖拽功能的 hook
 * @param {HTMLElement} element - 要设置为可拖拽的元素
 * @returns {Object} 包含拖拽相关状态和方法的对象
 */
export function useDraggable(element: { offsetLeft: number; offsetTop: number; style: { left: string; top: string; }; addEventListener: (arg0: string, arg1: (event: any) => void) => void; removeEventListener: (arg0: string, arg1: (event: any) => void) => void; }) {
  // 初始时，元素的位置
  const initialPosition = { x: 0, y: 0 };

  // 鼠标按下时的位置
  const mouseDownPosition = { x: 0, y: 0 };

  // 元素是否正在被拖拽
  const isDragging = ref(false);

  // 鼠标按下事件处理函数
  const handleMouseDown = (event: { preventDefault: () => void; clientX: number; clientY: number; }) => {
    event.preventDefault();
    isDragging.value = true;
    mouseDownPosition.x = event.clientX;
    mouseDownPosition.y = event.clientY;
    initialPosition.x = element.offsetLeft;
    initialPosition.y = element.offsetTop;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // 鼠标移动事件处理函数
  const handleMouseMove = (event: { clientX: number; clientY: number; }) => {
    if (isDragging.value) {
      const deltaX = event.clientX - mouseDownPosition.x;
      const deltaY = event.clientY - mouseDownPosition.y;
      element.style.left = initialPosition.x + deltaX + 'px';
      element.style.top = initialPosition.y + deltaY + 'px';
    }
  };

  // 鼠标抬起事件处理函数
  const handleMouseUp = () => {
    isDragging.value = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // 组件挂载时为元素添加鼠标按下事件监听
  onMounted(() => {
    element.addEventListener('mousedown', handleMouseDown);
  });

  // 组件卸载时移除事件监听
  onUnmounted(() => {
    element.removeEventListener('mousedown', handleMouseDown);
  });

  // 返回复制状态和复制操作
  return {
    isDragging
  };
}


/**
 * 文件下载的 hook
 * @param {Blob} blob - 要下载的 Blob 数据
 * @param {string} fileName - 下载文件的名称
 */
export function useFileDownload(blob: Blob | MediaSource, fileName: any) {
  // 创建一个隐藏的 <a> 元素
  const link = ref(null);

  // 下载文件的函数
  const downloadFile = () => {
    if (link.value) {
      link.value.href = URL.createObjectURL(blob);
      link.value.download = fileName;
      link.value.click();

      // 释放 URL 对象，避免内存泄漏
      URL.revokeObjectURL(link.value.href);
    }
  };

  // 组件挂载时创建 <a> 元素
  onMounted(() => {
    link.value = document.createElement('a');
    link.value.style.display = 'none';
    document.body.appendChild(link.value);
  });

  // 组件卸载时移除 <a> 元素
  onUnmounted(() => {
    if (link.value) {
      document.body.removeChild(link.value);
    }
  });

  return downloadFile;
}





