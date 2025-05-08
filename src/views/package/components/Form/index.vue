<template>
  <el-config-provider :locale="language">
    <div
      class="searchList form form-plus-main"
      ref="formPlusMain"
      :class="{ hide: !showSearch, show: showSearch }"
    >
      <div
        class="search_form_menu"
        :gutter="gutter"
        v-for="(rowItem, rowIndex) in searchFinal"
        :class="{ hide: !(fold && rowIndex == 0) || !fold, show: (fold && rowIndex == 0) || !fold }"
        :key="JSON.stringify(rowItem)"
      >
        <el-form
          ref="formRef"
          v-show="showSearch"
          :inline="true"
          :model="dynamicComputedMap"
          :label-width="labelWidth"
        >
          <slot
            v-for="(item, index) in rowItem"
            :key="JSON.stringify(item)"
            :name="`my-form-item-${item.prop}`"
            :prop="item.prop"
            :data="searchValue"
          >
            <el-form-item
              :ref="(el:any) => dynamicCreateRef(el, item.prop)"
              :label="item.label"
              :prop="item.prop"
              :class="`my-form-item my-form-item-${item.prop} my-form-item-${rowIndex} my-form-item-${rowIndex}-${index}`"
              :rules="
                typeof item.dynamicRequired === 'undefined' ||
                (item.dynamicRequired &&
                  item.dynamicRequired(dynamicComputedMap) &&
                  rules[item.prop])
                  ? rules[item.prop]
                  : []
              "
              v-if="
                typeof item.showFun === 'undefined' ||
                (item.showFun && item.showFun(dynamicComputedMap))
              "
            >
              <template #label v-if="slots[`label_${item.prop}`]">
                <slot :name="`label_${item.prop}`" :prop="item.prop" :data="dynamicComputedMap">
                </slot>
              </template>
              <template #error v-if="slots[`error_${item.prop}`]">
                <slot
                  :name="`error_${item.prop}`"
                  :prop="item.prop"
                  :data="dynamicComputedMap"
                ></slot>
              </template>

              <template #default>
                <slot :name="item.prop" :prop="item.prop" :data="dynamicComputedMap">
                  <Input
                    :data="(item as inputInnerType)"
                    v-if="item.type === 'input'"
                    v-model="dynamicComputedMap[item.prop]"
                  ></Input>
                  <MyDate
                    :data="(item as dateInnerType)"
                    v-if="item.type === 'date'"
                    v-model="dynamicComputedMap[item.prop]"
                  ></MyDate>

                  <Select
                    :data="(item as selectInnerType)"
                    v-if="item.type === 'select'"
                    v-model="dynamicComputedMap[item.prop]"
                  ></Select>
                  <Switch
                    :data="(item as switchInnerType)"
                    v-if="item.type === 'switch'"
                    v-model="dynamicComputedMap[item.prop]"
                  ></Switch>
                  <CheckBox
                    :data="(item as checkboxInnerType)"
                    v-if="item.type === 'checkbox'"
                    v-model="dynamicComputedMap[item.prop]"
                  ></CheckBox>
                  <Radio
                    :data="(item as radioInnerType)"
                    v-if="item.type === 'radio'"
                    v-model="dynamicComputedMap[item.prop]"
                  ></Radio>
                </slot>
              </template>
            </el-form-item>
          </slot>

          <el-form-item v-if="rowIndex === 0" class="buttons">
            <div style="margin-bottom: 4px; display: flex" :gutter="gutter" ref="buttons">
              <div
                v-for="item in searchButtonFinal"
                :key="JSON.stringify(item)"
                style="display: flex"
                class="my-form-buttons"
              >
                <el-button
                  v-if="item.type === 'button'"
                  :size="item.size ?? 'small'"
                  :type="item.inputType ?? 'primary'"
                  :icon="item.icon"
                  @click="searchFun(item?.fun)"
                  >{{ item.label }}
                </el-button>
                <el-button
                  v-if="item.type === 'search'"
                  :size="item.size ?? 'small'"
                  :type="item.inputType ?? 'primary'"
                  :icon="item.icon ?? Search"
                  @click="searchFun(item?.fun)"
                  >{{ item.label }}
                </el-button>
                <el-button
                  v-if="item.type === 'search-refresh'"
                  :size="item.size ?? 'default'"
                  :type="item.inputType ?? 'primary'"
                  :icon="item.icon ?? Search"
                  @click="searchFun(item?.fun ?? 'search')"
                  >{{ (item as searchRefresh).searchLabel }}
                </el-button>
                <el-button
                  v-if="item.type === 'search-refresh'"
                  :size="item.size ?? 'default'"
                  :type="item.inputType ?? ''"
                  :icon="item.icon ?? RefreshLeft"
                  @click="searchFun('refresh')"
                  >{{ (item as searchRefresh).refreshLabel }}
                </el-button>
                <el-button
                  v-if="item.type === 'refresh'"
                  :size="item.size ?? 'small'"
                  :type="item.inputType ?? ''"
                  :icon="item.icon ?? 'RefreshLeft'"
                  @click="searchFun('refresh')"
                  >{{ item.label }}
                </el-button>
              </div>
              <el-button class="fold" v-if="showFold" text @click="openList">
                {{ fold ? '展开' : '收起' }}
                <el-icon v-if="fold">
                  <ArrowDown />
                </el-icon>
                <el-icon v-if="!fold">
                  <ArrowUp />
                </el-icon>
              </el-button>
            </div>
          </el-form-item>
          <!-- </div> -->
        </el-form>
      </div>
    </div>
  </el-config-provider>
</template>

<script setup lang="ts" name="MyForm">
import { ref, watch, computed, nextTick, onMounted, onUnmounted, provide } from 'vue'
import { RefreshLeft, ArrowUp, ArrowDown, Search } from '@element-plus/icons-vue'
import type { button, queryInnerType, refresh, search, searchRefresh } from '../js/types'
import Input from '../components/input/index.vue'
import Select from '../components/select/index.vue'
import CheckBox from '../components/checkbox/index.vue'
import Radio from '../components/radio/index.vue'
import MyDate from '../components/date/index.vue'
import Switch from '../components/switch/index.vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import type {
  checkboxInnerType,
  dateInnerType,
  inputInnerType,
  radioInnerType,
  selectInnerType,
  switchInnerType,
} from '../components/form/types'
import MyComputedData from '../utils/hooks/MyComputedData'
import {useDebounceThrottle} from '../utils/hooks/index'
import { createRules } from '../utils/rules'
import { getDomComputed,getComputedStyle } from '../js/utils'
//父传子参数
const props = defineProps({
  language: {
    type: Object,
    default: () => {
      return zhCn
    },
  },
  showSearch: {
    type: Boolean,
    default: true,
  },
  defaultSearch: {
    type: Boolean,
    default: true,
  },

  labelWidth: {
    type: String,
    default: 'auto',
  },
  gutter: {
    type: Number,
    default: 20,
  },
  showSearchLabel: {
    type: Boolean,
    default: () => {
      return true
    },
  },
  search: {
    type: Array<inputInnerType | dateInnerType | selectInnerType>,
    required: true,
  },
  searchButton: {
    type: Array<button | refresh | search | searchRefresh>,
    default: () => {
      return []
    },
  },
  clearable: {
    type: Boolean,
    default: false,
  },
  searchValue: {
    type: Object,
    default: () => {
      return {}
    },
  },
  isRefreshSearch: {
    type: Boolean,
    default: false,
  },
})
//父组件写的插槽
const slots = defineSlots()
//组件内部搜索条件
const searchValue = ref<queryInnerType>({ pageNum: 1, pageSize: 10 })
//搜索条件框ref对象 ps:数组
const formRef = ref()
//搜索条件框多行折叠
const fold = ref<boolean>(true) //true 显示第一行/false 显示所有
//最终渲染到页面上的搜索框
const searchFinal = ref<searchTypes[]>([])
//搜索条件的校验规则
const rules = ref()
//每个搜索条件的ref对象 {key:$el}
const dynamicRefMap = ref<{ [name: string]: any }>({})
//组件ref对象
const formPlusMain = ref(null)
//按钮组ref对象
const buttons = ref(null)
type searchTypes = typeof props.search


/**
 * 动态创建表单ref
 * @param el 表单项组件对象
 * @param prop 表单项prop
 */
const dynamicCreateRef = (el: any, prop: string) => {
  nextTick(() => {
    dynamicRefMap.value[prop + 'Ref'] = el
  })
}
//动态创建搜索条件的计算属性
const { dynamicComputedFun, dynamicComputedMap } = MyComputedData(props.searchValue, searchValue)
//组件抛出的搜索、重置事件
const emits = defineEmits()
//搜索重置方法
const searchFun = (fun: (typeof searchButtonFinal.value)[number]['fun']) => {
  nextTick(() => {
    if (fun === 'refresh') {
      initSearchValue()
      // const errors: NodeListOf<Element> = document.querySelectorAll('.error')
      // for (let i = 0; i < errors.length; i++) {
      //   errors[i]?.classList?.remove('error')
      // }
      formRef.value.map((item: { clearValidate: () => void }) => {
        item.clearValidate()
      })

      if (props.isRefreshSearch) {
        //emits('search', searchValue.value)
        fun = 'search'
      } else return
    }
    if (fun === 'search') {
      let needCheck: any[] = formRef.value.map((item: { validate: () => void }) => {
        return item.validate()
      })
      if (fold.value) {
        needCheck = [needCheck[0]].filter((item) => item)
      }
      Promise.all(needCheck).then((res) => {
        // console.log(res)
        emits(fun, searchValue.value)
      })

      return
    }
    emits(fun, searchValue.value)
  })
}
//初始化搜索条件
const initSearchValue = () => {
  searchComputed.value.forEach((item) => {
    let f = false
    switch (item.type) {
      case 'date':
        if (((item as dateInnerType).dateType || '').indexOf('range') === -1) {
          f = true
        } else {
          //时间范围根据aliases转成对应字段
          dynamicComputedFun(item.prop, 'variable', (item as dateInnerType).aliases)
        }
        break
      case 'select':
        if (!(item as selectInnerType).multiple) {
          f = true
        } else {
          //多选下拉转成逗号字符串
          dynamicComputedFun(item.prop, 'string', ',')
        }
        break
      default:
        f = true
    }
    if (f) {
      //其他情况和原始数据保持一致
      dynamicComputedFun(item.prop, '')
    }
  })
  searchValue.value['pageSize'] = 10
  searchValue.value['pageNum'] = 1
}
//搜索条件标识,判断是不是需要重新渲染
const searchSign = ref<string[]>([])
/**
 * 计算搜索条件标识
 * @param list 搜索条件
 * @param flag true比较false计算
 */
const computedSearchSign = (list = [], flag = false) => {
  if (flag) {
    return (
      new Set([...list.map((item) => `${item.prop}-${item.type}`), ...searchSign.value]).size !==
      searchSign.value.length
    )
  } else {
    searchSign.value = []
    searchSign.value = list.map((item) => `${item.prop}-${item.type}`)
  }
}
//搜索条件计算属性,用于页面渲染
const searchComputed = computed(() => {
  computedSearchSign(props.search)
  return props.search
    .filter((item) => item.isForm ?? true)
    .map((item) => {
      if (item.isRequired && item.isDefault) {
        item.clearable = false
      }
      item.showMessage = item.showMessage ?? true
      item.inlineMessage = item.inlineMessage ?? ''
      item.labelPosition = item.labelPosition ?? ''
      item.labelWidth = item.labelWidth ?? ''
      item.clearable = item.clearable ?? props.clearable
      return item
    })
})


onMounted(() => {
  window.addEventListener('resize',formItemWidthComputedListenerHandler)
})
onUnmounted(() => {
  window.removeEventListener('resize', formItemWidthComputedListenerHandler)
})

//用于监听大小改变的回调
const formItemWidthComputedListener = () => {
  formItemWidthComputed(searchComputed.value)
}
const formItemWidthComputedListenerHandler=useDebounceThrottle(formItemWidthComputedListener,500)
/**
 * 计算表单项宽度
 * @param search 搜索条件
 * @param callback 回调事件,初始时需传入是否默认执行搜索
 */
const formItemWidthComputed = (search: typeof searchComputed.value, callback = () => {}) => {
  let searchArr: searchTypes[] = []
  let oneRow: searchTypes = []
  nextTick(() => {
    let formPlusMainWidth = formPlusMain.value.clientWidth
    let inputWidths = {}
    //  dynamicRefMap.value
    let buttonsWidth = buttons.value[0]?.clientWidth ?? 0
    for (let key in dynamicRefMap.value) {
      let computedStyle = getComputedStyle(dynamicRefMap.value[key].$el)
      inputWidths[key] =
        getDomComputed(computedStyle, 'width')+6*2
    }
    // console.log(inputWidths)
    let sum: number = formPlusMainWidth - buttonsWidth * 1.5
    // console.log(inputWidths,sum,buttonsWidth)
    let inputWidthKeys = Object.keys(inputWidths)
    for (let i = 0; i < inputWidthKeys.length; i++) {
      let inputWidthKey = inputWidthKeys[i]
      let inputWidth = inputWidths[inputWidthKey]
      // console.log(sum-inputWidth,inputWidth,inputWidthKey)
      if (sum - inputWidth < 0) {
        searchArr.push([...oneRow])
        oneRow = []
        sum = formPlusMainWidth
        i--
      } else {
        oneRow.push(search.find((item) => item.prop === inputWidthKey.replace('Ref', '')))
        sum -= inputWidth
      }
    }
    if (oneRow.length > 0) {
      searchArr.push([...oneRow])
    }
    searchFinal.value = searchArr
    callback && callback()
  })
}

//处理搜索表单
watch(
  () => searchComputed.value,
  async () => {
    let search = searchComputed.value
    if (
      search.length === 0 ||
      (!computedSearchSign(search, true) && searchFinal.value.length !== 0)
    )
      return
    initSearchValue()
    rules.value = createRules(search)
    searchFinal.value = [search]
    let searchItemProp = search.map((item) => `${item.prop}Ref`)
    await nextTick()
    formItemWidthComputed(search, () => {
      if (props.defaultSearch) {
        searchFun('search')
      }
    })
  },
  {
    deep: true,
    immediate: true,
  }
)

//最终渲染的按钮组
const searchButtonFinal = ref<(button | refresh | search | searchRefresh)[]>([])

//处理搜索按钮
watch(
  () => props.searchButton,
  () => {
    let searchButton: (button | refresh | search | searchRefresh)[] = [...props.searchButton]
    // let len =
    if (searchButton.length === 0) {
      searchButton.push({
        type: 'search-refresh',
        fun: 'search',
        span: 24,
        searchLabel: '搜索',
        refreshLabel: '重置',
      } as searchRefresh)
    }
    searchButtonFinal.value = [...searchButton]
  },
  {
    deep: true,
    immediate: true,
  }
)
//判断是否有展开按钮
const showFold = computed(() => {
  return searchFinal.value.length > 1
})
//展开收起事件
const openList = () => {
  fold.value = !fold.value
}
//暴露的数据
defineExpose([fold,dynamicRefMap,formPlusMain,buttons])
</script>

<style scoped lang="scss">
.searchList.hide {
    height: 0;
    opacity: 0;
    transition: all 0.1s;
    padding: 0px;
  }
.searchList{
  padding: 10px;
  .hide {
    height: 0;
    opacity: 0;
    transition: all 0.1s;
    padding: 0px;
  }
  .show {
    opacity: 1;
    height: 100%;
    transition: all 0.5s;

  }
  .search_form_menu {
    margin-bottom: 4px;
    &:last-child{
      margin-bottom: 0;
    }
    .el-form {
      .buttons {
        margin-right: 0;

        .fold.el-button.is-text {
          &:not(.is-disabled) {
            &:hover {
              background-color: transparent;
            }
          }
        }
      }
    }
  }
}

// dcdfe6
</style>
