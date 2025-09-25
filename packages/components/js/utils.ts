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
export const getDomComputed = (
  dom: CSSStyleDeclaration | string,
  key:
    'width'
    | 'height'
) => {
  let size: { height: number, width: number } = {
    height: 0,
    width: 0
  }
  if (typeof dom === 'string') {
    dom = getComputedStyle(dom)
  }
  // let { marginLeft, marginRight, paddingLeft, paddingRight, width, borderLeftWidth, borderRightWidth }={}
  if (dom['boxSizing'] === 'content-box') {
    let { marginLeft, marginRight, paddingLeft, paddingRight, width, borderLeftWidth, borderRightWidth } = dom;
    let { marginTop, marginBottom, paddingTop, paddingBottom, height, borderTopWidth, borderBottomWidth } = dom;
    size.width = [marginLeft, marginRight, paddingLeft, paddingRight, width, borderLeftWidth, borderRightWidth].map(item => parseFloat(item ?? 0)).reduce((a, b) => a + b)
    size.height = [marginTop, marginBottom, paddingTop, paddingBottom, height, borderTopWidth, borderBottomWidth].map(item => parseFloat(item ?? 0)).reduce((a, b) => a + b)
  } else if (dom['boxSizing'] === 'border-box') {
    let { marginLeft, marginRight, width, } = dom;
    let { marginTop, marginBottom, height, } = dom;
    size.width = [marginLeft, marginRight, width,].map(item => parseFloat(item ?? 0)).reduce((a, b) => a + b)
    size.height = [marginTop, marginBottom, height,].map(item => parseFloat(item ?? 0)).reduce((a, b) => a + b)
  }
  return size[key];//parseFloat(dom[key] ?? 0)
}
