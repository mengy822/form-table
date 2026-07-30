import { ref, computed, onMounted, nextTick } from 'vue'

export default function create(propsSearchValue: any = {}, searchValue: any) {
  const dynamicComputedMap = ref<{ [name: string]: any }>({})
  // console.log(searchValue.value,'searchValue')
  //动态创建计算属性
  const dynamicComputedFun = (
    prop: string,
    type: 'variable' | 'string' | 'array' | 'file' | '' = '',
    aliases: string = '',
  ) => {
    if (type === 'variable') {
      if (aliases.length > 0 && aliases.split(',').length > 0) {
        dynamicArraysComputedFun(prop, aliases)
        return
      }
      type = 'array'
    }
    if (type === 'file') {
      if (aliases.length > 0 && aliases.split(',').length > 0) {
        dynamicFilesComputedFun(prop, aliases)
        return
      }
    }
    if (type === 'string') {
      dynamicArraysToStringComputedFun(prop, aliases)
      return
    }
    if (type === 'array' || type === '') {
      dynamicStringComputedFun(prop, type)
    }
  }
  //数组转多字段
  const dynamicArraysComputedFun = (prop: string, aliases: string) => {
    nextTick(() => {
      let arr = aliases.split(',')
      let getkey = []
      for (let arrItem of arr) {
        searchValue.value[arrItem] = propsSearchValue[arrItem] ?? undefined
        getkey.push(arrItem)
      }
      dynamicComputedMap.value[prop] = computed({
        get() {
          return getkey.map((item) => searchValue.value[item])
        },
        set(data) {
          getkey.map((item, index) => (searchValue.value[item] = data && data[index]))
        },
      })
      // console.log(dynamicComputedMap.value[prop],'dynamicComputedMapArray');
    })
  }
  // 数组转字符串
  const dynamicArraysToStringComputedFun = (prop: string, separate: string = ',') => {
    nextTick(() => {
      searchValue.value[prop] = propsSearchValue[prop] ?? ''
      dynamicComputedMap.value[prop] = computed({
        get() {
          let type = typeof searchValue.value[prop]
          return String(searchValue.value[prop]).length > 0
            ? String(searchValue.value[prop])
                .split(separate)
                .map((item) => {
                  let data
                  switch (type) {
                    case 'number':
                      data = Number(item)
                      break
                    case 'boolean':
                      data = Boolean(item)
                      break

                    default:
                      data = item
                  }
                  return item
                })
            : []
        },
        set(data) {
          searchValue.value[prop] = Array.isArray(data) ? data.join(separate) : ''
        },
      })
      // console.log(dynamicComputedMap.value[prop],'dynamicComputedMapArrayToString');
    })
  }
  //文件转对象
  const dynamicFilesComputedFun = (prop: string, aliases: string) => {
    nextTick(() => {
      const arr = aliases.split(',')
      const getkey: string[] = []
      for (const arrItem of arr) {
        searchValue.value[arrItem] = propsSearchValue[arrItem] ?? undefined
        getkey.push(arrItem)
      }
      const keys = ['name', 'url', 'raw']
      dynamicComputedMap.value[prop] = computed({
        get() {
          return getkey.reduce((acc:{[key:string]:any}, name, index) => {
            const value = searchValue.value[name]

            // 处理空数组或空字符串
            const result =
              (Array.isArray(value) && value.length === 0) || value === '' || value == null
                ? ''
                : index === 1
                  ? String(value)
                  : value

            acc[keys[index]] = result
            return acc
          }, {})
        },
        set(data) {
          getkey.map((item, index) => (searchValue.value[item] = data && data[keys[index]]))
        },
      })
      // console.log(dynamicComputedMap.value[prop],'dynamicComputedMapArray');
    })
  }
  const dynamicStringComputedFun = (prop: string, type: '' | 'array' = '') => {
    nextTick(() => {
      searchValue.value[prop] = propsSearchValue[prop] ?? (type == 'array' ? [] : undefined)
      dynamicComputedMap.value[prop] = computed({
        get() {
          return searchValue.value[prop]
        },
        set(data) {
          searchValue.value[prop] = data
        },
      })
      // console.log(dynamicComputedMap.value[prop],'dynamicComputedMapString');
    })
  }
  return { dynamicComputedMap, dynamicComputedFun, searchValue: searchValue.value }
}
