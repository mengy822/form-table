export const isMobile = () => {
  const flag = navigator.userAgent.match(
    /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
  );
  return (flag && flag.length > 0) ?? false;
};
export const getName = (name: string | number) => {
  name = String(name)
  return name.indexOf('_') > -1 ? name.split('_')[0] ?? name : name
}
export function deepClone(target: any) {
  // WeakMap作为记录对象Hash表（用于防止循环引用）
  const map = new WeakMap()

  // 判断是否为object类型的辅助函数，减少重复代码
  function isObject(target: any) {
    return (typeof target === 'object' && target) || typeof target === 'function'
  }

  function clone(data: any) {

    // 基础类型直接返回值
    if (!isObject(data)) {
      return data
    }

    // 日期或者正则对象则直接构造一个新的对象返回
    if ([Date, RegExp].includes(data.constructor)) {
      return new data.constructor(data)
    }

    // 处理函数对象
    if (typeof data === 'function') {
      return new Function('return ' + data.toString())()
    }

    // 处理数组
    if (Array.isArray(data)) {
      const result: any[] = [];
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
    const exist = map.get(data)
    if (exist) {
      return exist
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
    let lsDom = document.querySelector(dom)
    if (lsDom)
      dom = lsDom
    else {
      throw new Error("dom不存在");

    }
  }
  return window.getComputedStyle(dom)
}
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
    // console.log(borderTopWidth);
    size.width = [marginLeft, marginRight, width, borderLeftWidth, borderRightWidth].map((item) => parseFloat(item ?? 0)).reduce((a, b) => a + b);
    size.height = [marginTop, marginBottom, height, borderTopWidth, borderBottomWidth].map((item) => parseFloat(item ?? 0)).reduce((a, b) => a + b);
  }
  return size[key]; //parseFloat(dom[key] ?? 0)
};
const intersectionHash = (arr1: any[]=[], arr2: any[]=[]) => {
  const hash:{[key:string]:boolean} = {};
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
  const dom: HTMLElement|null = document.querySelector(className);
  if (!dom) {
    console.error(`元素 ${className} 未找到`);
    return { height: 0, dom: [] };
  }

  // 获取容器总高度
  const totalHeight = (dom as HTMLElement).offsetHeight;

  // 获取所有子元素
  const children: HTMLCollection = dom.children;
  let usedHeight = 0;
  const doms = [];
  excludeClassName.push('.el-overlay');
  // 计算所有子元素的总高度
  for (let i = 0; i < children.length; i++) {
    const child = children[i];

    // 跳过排除的元素
    if (
      intersectionHash(
        child?.classList,
        excludeClassName.map((item) => item.replace('.', ''))
      ).length > 0
    ) {
      continue;
    }
    doms.push(child);
    // 获取计算样式
    const style = getComputedStyle(child);

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
  }

  // 计算剩余高度
  const remainingHeight = totalHeight - usedHeight;

  // 返回结果（确保不会返回负数）
  return { height: Math.max(0, remainingHeight), dom: doms };
};
