export const isMobile = () => {
  const flag = navigator.userAgent.match(
    /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
  );
  return (flag && flag.length > 0) ?? false;
};
export const getName = (name: string | number, other: string = '') => {
  name = String(name);
  return (name.indexOf('_') > -1 ? (name.split('_')[0] ?? name) : name).replace(other, '');
};
export const deepClone = (target:any[]) => {
  // WeakMap作为记录对象Hash表（用于防止循环引用）
  const map = new WeakMap();

  // 判断是否为object类型的辅助函数，减少重复代码
  function isObject(target:any) {
    return (typeof target === 'object' && target) || typeof target === 'function';
  }

  function clone(data:any) {
    // 基础类型直接返回值
    if (!isObject(data)) {
      return data;
    }

    // 日期或者正则对象则直接构造一个新的对象返回
    if ([Date, RegExp].includes(data.constructor)) {
      return new data.constructor(data);
    }

    // 处理函数对象
    if (typeof data === 'function') {
      return data
      // return new Function('return ' + data.toString())();
    }

    // 处理数组
    if (Array.isArray(data)) {
      const result:any[] = [];
      map.set(data, result);
      data.forEach((val, index) => {
        if (isObject(val)) {
          result[index] = clone(val);
        } else {
          result[index] = val;
        }
      });
      return result;
    }

    // 如果该对象已存在，则直接返回该对象
    const exist = map.get(data);
    if (exist) {
      return exist;
    }

    // 处理Map对象
    if (data instanceof Map) {
      const result = new Map();
      map.set(data, result);
      data.forEach((val, key) => {
        // 注意：map中的值为object的话也得深拷贝
        if (isObject(val)) {
          result.set(key, clone(val));
        } else {
          result.set(key, val);
        }
      });
      return result;
    }

    // 处理Set对象
    if (data instanceof Set) {
      const result = new Set();
      map.set(data, result);
      data.forEach((val) => {
        // 注意：set中的值为object的话也得深拷贝
        if (isObject(val)) {
          result.add(clone(val));
        } else {
          result.add(val);
        }
      });
      return result;
    }

    // 收集键名（考虑了以Symbol作为key以及不可枚举的属性）
    const keys = Reflect.ownKeys(data);
    // 利用 Object 的 getOwnPropertyDescriptors 方法可以获得对象的所有属性以及对应的属性描述
    const allDesc = Object.getOwnPropertyDescriptors(data);
    // 结合 Object 的 create 方法创建一个新对象，并继承传入原对象的原型链， 这里得到的result是对data的浅拷贝
    const result = Object.create(Object.getPrototypeOf(data), allDesc);

    // 新对象加入到map中，进行记录
    map.set(data, result);

    // Object.create()是浅拷贝，所以要判断并递归执行深拷贝
    keys.forEach((key) => {
      const val = data[key];
      if (isObject(val)) {
        // 属性值为 对象类型 或 函数对象 的话也需要进行深拷贝
        result[key] = clone(val);
      } else {
        result[key] = val;
      }
    });
    return result;
  }

  return clone(target);
};

/**
 * 获取dom计算样式
 * @param dom dom对象
 */
export const getComputedStyle = (dom: Element | string): CSSStyleDeclaration => {
  if (typeof dom === 'string') {
    const lsDom = document.querySelector(dom);
    if (lsDom) dom = lsDom;
    else {
      throw new Error('dom不存在');
    }
  }
  return window.getComputedStyle(dom);
};
/**
 * 获取dom计算样式的具体值,并转为数值
 * @param dom CSSStyleDeclaration
 * @param key 可以获取的值
 */
export const getDomComputed = (dom: CSSStyleDeclaration | string, key: 'width' | 'height') => {
  const size: { height: number; width: number } = {
    height: 0,
    width: 0
  };
  if (typeof dom === 'string') {
    dom = getComputedStyle(dom);
  }
  // let { marginLeft, marginRight, paddingLeft, paddingRight, width, borderLeftWidth, borderRightWidth }={}
  if (dom['boxSizing'] === 'content-box') {
    const { marginLeft, marginRight, paddingLeft, paddingRight, width, borderLeftWidth, borderRightWidth } = dom;
    const { marginTop, marginBottom, paddingTop, paddingBottom, height, borderTopWidth, borderBottomWidth } = dom;
    size.width = [marginLeft, marginRight, paddingLeft, paddingRight, width, borderLeftWidth, borderRightWidth]
      .map((item) => parseFloat(item ?? 0))
      .reduce((a, b) => a + b);
    size.height = [marginTop, marginBottom, paddingTop, paddingBottom, height, borderTopWidth, borderBottomWidth]
      .map((item) => parseFloat(item ?? 0))
      .reduce((a, b) => a + b);
  } else if (dom['boxSizing'] === 'border-box') {
    const { marginLeft, marginRight, width, borderLeftWidth, borderRightWidth } = dom;
    const { marginTop, marginBottom, height, borderTopWidth, borderBottomWidth } = dom;
    // console.log(marginTop, marginBottom, height, borderTopWidth, borderBottomWidth);
    // if (height === '56px') debugger;
    size.width = [marginLeft, marginRight, width, borderLeftWidth, borderRightWidth].map((item) => parseFloat(item ?? 0)).reduce((a, b) => a + b);
    size.height = [marginTop, marginBottom, height, borderTopWidth, borderBottomWidth].map((item) => parseFloat(item ?? 0)).reduce((a, b) => a + b);
  }
  return size[key]; //parseFloat(dom[key] ?? 0)
};
// 方法4: 使用哈希表（性能最优）
const intersectionHash = (arr1, arr2) => {
  const hash = {};
  const result = [];

  // 将第一个数组的元素存入哈希表
  for (let i = 0; i < arr1.length; i++) {
    hash[arr1[i]] = true;
  }

  // 检查第二个数组的元素是否在哈希表中
  for (let i = 0; i < arr2.length; i++) {
    if (hash[arr2[i]]) {
      result.push(arr2[i]);
      hash[arr2[i]] = false; // 避免重复
    }
  }

  return result;
};
export const getHeight = (className: string): number => {
  const baseClassHeightDom = document.querySelector(className)
  let baseClassHeight = 0
  if (baseClassHeightDom) {
    const baseClassStyle = getComputedStyle(baseClassHeightDom)
    // console.log(getDomComputed(baseClassStyle, 'height') ,className)
    baseClassHeight = getDomComputed(baseClassStyle, 'height')
  }
  return isNaN(baseClassHeight) ? 0 : baseClassHeight
}
/**
 * 获取容器剩余高度（优化版）
 * @param {string} className - 容器选择器
 * @param {string} excludeClassName - 要排除的子元素选择器
 * @returns {number} 剩余高度
 */
export const getRemainingHeight = (
  className: string,
  excludeClassName: string[] = []
): {
  height: number;
  dom: HTMLElement[];
} => {
  // 获取容器元素
  const dom: HTMLElement = document.querySelector(className);
  if (!dom) {
    console.error(`元素 ${className} 未找到`);
    return { height: 0, dom: [] };
  }

  // 获取容器总高度
  const totalHeight = (dom as HTMLElement).offsetHeight;

  // 获取所有子元素
  const children = dom.children;
  let usedHeight = 0;
  const doms = [];
  excludeClassName.push('.el-overlay');
  // 计算所有子元素的总高度
  for (let i = 0; i < children.length; i++) {
    const child = children[i];

    // 跳过排除的元素
    if (
      intersectionHash(
        child.classList,
        excludeClassName.map((item) => item.replace('.', ''))
      ).length > 0
    ) {
      continue;
    }
    // 获取计算样式
    const style = getComputedStyle(child);
    if (style['position']) {
      continue;
    }
    doms.push(child);

    // 获取box-sizing属性
    const boxSizing = style.boxSizing;

    // 获取边距
    const marginTop = parseFloat(style.marginTop) || 0;
    const marginBottom = parseFloat(style.marginBottom) || 0;

    let childHeight = 0;

    if (boxSizing === 'content-box') {
      // content-box: height = content高度 + padding + border
      const paddingTop = parseFloat(style.paddingTop) || 0;
      const paddingBottom = parseFloat(style.paddingBottom) || 0;
      const borderTopWidth = parseFloat(style.borderTopWidth) || 0;
      const borderBottomWidth = parseFloat(style.borderBottomWidth) || 0;

      childHeight = child.offsetHeight + marginTop + marginBottom;
    } else {
      // border-box: height = 总高度（包含padding和border）
      const borderTopWidth = parseFloat(style.borderTopWidth) || 0;
      const borderBottomWidth = parseFloat(style.borderBottomWidth) || 0;

      childHeight = child.offsetHeight + marginTop + marginBottom;
    }
    usedHeight += childHeight;
    // console.log(usedHeight, 'usedHeight');
  }

  // 计算剩余高度
  const remainingHeight = totalHeight - usedHeight;

  // 返回结果（确保不会返回负数）
  return { height: Math.max(0, remainingHeight), dom: doms };
};
/**
 * 解析时间函数，兼容多种输入格式和输出格式
 * 支持两种格式：YYYY-MM-DD HH:mm:ss 和 {y}-{m}-{d} {h}:{i}:{s}
 * @param time 时间参数，支持 Date、时间戳、字符串等
 * @param pattern 输出格式，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的时间字符串或 null
 */
export function parseTime(time: any, pattern?: string): string | null {
  // 如果没有传入时间参数或时间为空，返回 null
  if (arguments.length === 0 || time == null || time === '') {
    return null;
  }

  // 设置默认格式为 YYYY-MM-DD HH:mm:ss
  const defaultFormat = 'YYYY-MM-DD HH:mm:ss';
  const format = pattern || defaultFormat;

  let date: Date;

  // 处理不同类型的时间参数
  if (time instanceof Date) {
    // 已经是 Date 对象
    date = time;
  } else if (typeof time === 'number') {
    // 时间戳
    if (time.toString().length === 10) {
      // 秒级时间戳
      date = new Date(time * 1000);
    } else if (time.toString().length === 13) {
      // 毫秒级时间戳
      date = new Date(time);
    } else {
      console.warn('无效的时间戳格式:', time);
      return null;
    }
  } else if (typeof time === 'string') {
    // 字符串类型
    if (/^\d+$/.test(time)) {
      // 纯数字字符串，当作时间戳处理
      const timestamp = parseInt(time, 10);
      return parseTime(timestamp, format);
    } else {
      // 日期字符串
      try {
        // 替换常见格式以兼容 Safari 和 iOS
        let timeString = time
          .replace(/-/g, '/') // 将 - 替换为 /
          .replace('T', ' ') // ISO 格式中的 T 替换为空格
          .replace(/\.\d{3}Z?$/g, '') // 移除毫秒和 Z
          .replace('Z', ''); // 移除时区 Z

        // 如果没有时间部分，添加默认时间
        if (!/:/.test(timeString) && timeString.includes('/')) {
          timeString += ' 00:00:00';
        }

        date = new Date(timeString);

        // 检查日期是否有效
        if (isNaN(date.getTime())) {
          console.warn('无效的日期字符串:', time);
          return null;
        }
      } catch (error) {
        console.warn('日期解析错误:', error);
        return null;
      }
    }
  } else {
    console.warn('不支持的时间格式:', typeof time, time);
    return null;
  }

  // 创建格式化对象
  const formatObj: Record<string, number> = {
    y: date.getFullYear(),
    m: date.getMonth() + 1, // 月份从 0 开始
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay() // 星期几，0 表示星期日
  };

  // 判断使用哪种格式规则
  if (format.includes('{')) {
    // 使用 {y}-{m}-{d} {h}:{i}:{s} 格式
    return format.replace(/{([ymdhisa])+}/g, (result: string, key: string) => {
      let value = formatObj[key];

      // 处理星期几
      if (key === 'a') {
        const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
        return weekDays[value];
      }

      // 补零处理：如果占位符长度大于1且值小于10，前面补0
      // 例如：{yyyy} 需要4位，但这里我们只处理单字符占位符的补零
      if (result.length > 0 && value < 10) {
        return '0' + value;
      }

      return value !== undefined ? value.toString() : '';
    });
  } else {
    // 使用 YYYY-MM-DD HH:mm:ss 格式
    return format.replace(/(YYYY|YY|MM|M|DD|D|HH|H|mm|m|ss|s|a)/g, (match: string): string => {
      switch (match) {
        case 'YYYY':
          return formatObj.y.toString();
        case 'YY':
          return formatObj.y.toString().slice(-2);
        case 'MM':
          return formatObj.m.toString().padStart(2, '0');
        case 'M':
          return formatObj.m.toString();
        case 'DD':
          return formatObj.d.toString().padStart(2, '0');
        case 'D':
          return formatObj.d.toString();
        case 'HH':
          return formatObj.h.toString().padStart(2, '0');
        case 'H':
          return formatObj.h.toString();
        case 'mm':
          return formatObj.i.toString().padStart(2, '0');
        case 'm':
          return formatObj.i.toString();
        case 'ss':
          return formatObj.s.toString().padStart(2, '0');
        case 's':
          return formatObj.s.toString();
        case 'a':
          // 星期几：0=日，1=一，...，6=六
          const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
          return weekDays[formatObj.a];
        default:
          return match;
      }
    });
  }
}
