// utils/funDom.ts
import { markRaw, type VNode } from 'vue'

export const useFunDom = (attrs: any) => {
  const funDomCache = new Map<string, any>()

  const getFunDomComponent = (
    item: any,
    data: any,
    domKey:
      | 'funDom'
      | 'errorFunDom'
      | 'labelFunDom'
      | 'itemFunDom'
      | 'errorDataFunDom'
      | 'rightFunDom'
      | 'leftFunDom' = 'funDom',
  ) => {
    if (!item[domKey]) return null

    const cacheKey = `${item.prop}_${domKey}_${Object.keys(data).join('_')}`

    if (funDomCache.has(cacheKey)) {
      return funDomCache.get(cacheKey)
    }

    const component = markRaw({
      render() {
        return item[domKey](data, item.prop, { attrs, config: item })
      },
    })

    funDomCache.set(cacheKey, component)
    return component
  }

  const clearFunDomCache = () => {
    funDomCache.clear()
  }

  return {
    getFunDomComponent,
    clearFunDomCache,
  }
}
