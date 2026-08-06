// utils/funDom.ts
import { markRaw, type VNode } from 'vue'

export const useFunDom = (attrs: any) => {
  const funDomCache = new Map<string, any>()

  const getFunDomComponent = (item: any, data: any) => {
    if (!item.funDom) return null

    const cacheKey = `${item.prop}_${Object.keys(data).join('_')}`

    if (funDomCache.has(cacheKey)) {
      return funDomCache.get(cacheKey)
    }

    const component = markRaw({
      render() {
        return item.funDom(data, item.prop, attrs)
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
