import { ref, computed, onMounted, nextTick } from 'vue'

export default function create(propsSearchValue:any={},searchValue:any) {
  const dynamicComputedMap = ref<{ [name: string]: any }>({})
  // console.log(searchValue.value,'searchValue')
  //动态创建计算属性
  const dynamicComputedFun = (prop: string, type: 'variable' | 'string' | 'array' | '' = '',
                              aliases: string = '') => {
    if (type === 'variable') {
      if (aliases.length > 0 && aliases.split(',').length > 0) {
        dynamicArraysComputedFun(prop, aliases)
        return
      }
      type = 'array'
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
          return getkey.map(item => searchValue.value[item])
        },
        set(data) {
          getkey.map((item, index) => searchValue.value[item] = data&&data[index])
        }
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
          let type=typeof searchValue.value[prop]
          return  String(searchValue.value[prop]).length > 0 ? String(searchValue.value[prop]).split(separate).map(item=>{
            let data;
            switch (type){
              case 'number':
                data=Number(item);
                break
              case 'boolean':
                data=Boolean(item);
                break

              default:data=item
            }
            return item;
          }) : []
        },
        set(data) {
          searchValue.value[prop] = Array.isArray(data)?data.join(separate):''
        }
      })
      // console.log(dynamicComputedMap.value[prop],'dynamicComputedMapArrayToString');
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
        }
      })
      // console.log(dynamicComputedMap.value[prop],'dynamicComputedMapString');
    })
  }
  return { dynamicComputedMap, dynamicComputedFun,searchValue:searchValue.value }
}
