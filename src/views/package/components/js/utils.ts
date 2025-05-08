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
