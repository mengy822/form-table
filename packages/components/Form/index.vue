<template>
  <div v-show="showSearch" class="mb-[20px]">
    <el-card shadow="hover" class="form-plus-main-card">

        <div
          class="searchList form form-plus-main"
          ref="formPlusMain"
          :class="{ hide: !showSearch, show: showSearch }"
        >
          <div
            class="search_form_menu"
            :gutter="gutter"
            v-for="(rowItem, rowIndex) in searchFinal"
            :class="{
              hide: !(fold && rowIndex == 0) || !fold,
              show: (fold && rowIndex == 0) || !fold,
            }"
            :key="JSON.stringify(rowItem)"
          >
            <el-form
              ref="formRef"
              v-show="showSearch"
              :inline="true"
              :model="dynamicComputedMap"
              :label-width="labelWidth"
              @submit.native.prevent="searchFun('search')"
            >
              <slot
                v-for="(item, index) in rowItem"
                :key="JSON.stringify(item)"
                :name="`my-form-item-${item.prop}`"
                :prop="item.prop"
                :data="searchValue"
              >
                <el-form-item
                  :ref="(el: any) => dynamicCreateRef(el, item.prop)"
                  :label="item.label"
                  :prop="item.prop"
                  :class="`my-form-item my-form-item-${item.prop} my-form-item-${rowIndex} my-form-item-${rowIndex}-${index}`"
                  :rules="
                    (rules[item.prop] || []).map((item1) => {
                      item1.required =
                        typeof item.dynamicRequired === 'undefined' || (item.dynamicRequired && item.dynamicRequired(dynamicComputedMap));
                      return item1;
                    })
                  "
                  v-if="
                    typeof item.showFun === 'undefined' ||
                    (item.showFun && item.showFun(dynamicComputedMap))
                  "
                >
                  <template #label v-if="slots[`label_${item.prop}`] || item.labelFunDom">
                    <component
                      v-if="item.funDom"
                      :is="getFunDomComponent(item, dynamicComputedMap, 'labelFunDom')"
                    />
                    <slot
                      v-else
                      :name="`label_${item.prop}`"
                      :prop="item.prop"
                      :data="dynamicComputedMap"
                    ></slot>
                  </template>
                  <template #error v-if="slots[`error_${item.prop}`] || item.errorFunDom">
                    <component
                      v-if="item.funDom"
                      :is="getFunDomComponent(item, dynamicComputedMap, 'errorFunDom')"
                    />
                    <slot
                      v-else
                      :name="`error_${item.prop}`"
                      :prop="item.prop"
                      :data="dynamicComputedMap"
                    ></slot>
                  </template>

                  <template #default>
                    <component
                      v-if="item.funDom"
                      :is="getFunDomComponent(item, dynamicComputedMap)"
                    />
                    <slot v-else :name="item.prop" :prop="item.prop" :data="dynamicComputedMap">
                      <Input
                        :data="item"
                        v-if="item.type === 'input'"
                        v-model="dynamicComputedMap[item.prop]"
                      >
                        <template v-for="(_, name) in slots" #[getName(name,item.prop)]="scopeData">
                          <slot :name="name" v-bind="scopeData"></slot>
                        </template>
                      </Input>
                      <MyDate
                        :data="item"
                        v-if="item.type === 'date'"
                        v-model="dynamicComputedMap[item.prop]"
                      >
                        <template v-for="(_, name) in slots" #[getName(name,item.prop)]="scopeData">
                          <slot :name="name" v-bind="scopeData"></slot>
                        </template>
                      </MyDate>

                      <Select
                        :data="item"
                        v-if="item.type === 'select'"
                        v-model="dynamicComputedMap[item.prop]"
                      >
                        <template v-for="(_, name) in slots" #[getName(name,item.prop)]="scopeData">
                          <slot :name="name" v-bind="scopeData"></slot>
                        </template>
                      </Select>
                      <Switch
                        :data="item"
                        v-if="item.type === 'switch'"
                        v-model="dynamicComputedMap[item.prop]"
                      >
                        <template v-for="(_, name) in slots" #[getName(name,item.prop)]="scopeData">
                          <slot :name="name" v-bind="scopeData"></slot>
                        </template>
                      </Switch>
                      <CheckBox
                        :data="item"
                        v-if="item.type === 'checkbox'"
                        v-model="dynamicComputedMap[item.prop]"
                      >
                        <template v-for="(_, name) in slots" #[getName(name,item.prop)]="scopeData">
                          <slot :name="name" v-bind="scopeData"></slot>
                        </template>
                      </CheckBox>
                      <Radio
                        :data="item"
                        v-if="item.type === 'radio'"
                        v-model="dynamicComputedMap[item.prop]"
                      >
                        <template v-for="(_, name) in slots" #[getName(name,item.prop)]="scopeData">
                          <slot :name="name" v-bind="scopeData"></slot>
                        </template>
                      </Radio>
                    </slot>
                  </template>
                </el-form-item>
              </slot>

              <el-form-item v-if="rowIndex === 0" class="buttons">
                <div style="display: flex" :gutter="gutter" ref="buttons">
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
    </el-card>
  </div>
</template>

<script setup lang="ts" name="MyForm">
import { getName } from '../js/utils'
import { Search, RefreshLeft } from '@element-plus/icons-vue'
import {
  ref,
  watch,
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  provide,
  onActivated,
  onDeactivated,
  onBeforeUnmount,
  useAttrs,
} from 'vue'
// import { RefreshLeft, ArrowUp, ArrowDown, Search } from '@element-plus/icons-vue'
import type { button, queryInnerType, refresh, search, searchRefresh } from '../js/types'
import Input from '../components/input/index.vue'
import Select from '../components/select/index.vue'
import CheckBox from '../components/checkbox/index.vue'
import Radio from '../components/radio/index.vue'
import MyDate from '../components/date/index.vue'
import Switch from '../components/switch/index.vue'
import type {
  checkboxInnerType,
  dateInnerType,
  inputInnerType,
  radioInnerType,
  selectInnerType,
  switchInnerType,
} from '../components/form/types'
import MyComputedData from '../utils/hooks/MyComputedData'
import { useDebounceThrottle } from '../utils/hooks/index'
import { createRules } from '../utils/rules'
import { getDomComputed, getComputedStyle } from '../js/utils'
import { useFunDom } from '../utils/funDom'
//父传子参数
// 定义 Props 类型接口
interface SearchFormProps {
  /** 不需要折叠搜索 */
  notNeedFlod?: boolean
  /** 不需要触发变更检查的组件类型 */
  notNeedChangeCheck?: string[]

  /** 是否显示搜索区域 */
  showSearch?: boolean

  /** 是否默认执行搜索 */
  defaultSearch?: boolean

  /** 标签宽度 */
  labelWidth?: string

  /** 栅格列间距 */
  gutter?: number

  /** 是否显示搜索标签 */
  showSearchLabel?: boolean

  /** 搜索表单字段配置（必填） */
  search: (inputInnerType | dateInnerType | selectInnerType | checkboxInnerType)[]

  /** 搜索按钮配置 */
  searchButton?: (button | refresh | search | searchRefresh)[]

  /** 是否启用清空功能 */
  clearable?: boolean

  /** 搜索表单值 */
  searchValue?: Record<string, any>

  /** 是否启用刷新搜索功能 */
  isRefreshSearch?: boolean
}

// 使用 withDefaults 定义 Props 并配置默认值
const props = withDefaults(defineProps<SearchFormProps>(), {
  notNeedFlod: false,
  // 不需要变更检查的组件类型
  notNeedChangeCheck: () => ['input', 'inputNumber'],

  // 搜索区域显示控制
  showSearch: true,
  defaultSearch: true,

  // 布局样式
  labelWidth: 'auto',
  gutter: 20,
  showSearchLabel: true,

  // 搜索表单配置（必填项，不设置默认值）
  search: undefined,

  // 搜索按钮配置
  searchButton: () => [],

  // 功能控制
  clearable: true,
  searchValue: () => ({}),
  isRefreshSearch: true,
})

//父组件写的插槽
const slots = defineSlots()
//组件内部搜索条件
const searchValue = ref<queryInnerType>({ pageNum: 1 })
//搜索条件框ref对象 ps:数组
const formRef = ref()
//搜索条件框多行折叠
const fold = ref<boolean>(!props.notNeedFlod) //true 显示第一行/false 显示所有
//最终渲染到页面上的搜索框
type searchTypes = typeof props.search
const searchFinal = ref<searchTypes[]>([])
//搜索条件的校验规则
const rules = ref()
//每个搜索条件的ref对象 {key:$el}
const dynamicRefMap = ref<{ [name: string]: any }>({})
//组件ref对象
const formPlusMain = ref(null)
//按钮组ref对象
const buttons = ref(null)

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

// 所有 Emit 事件接口
interface MyFormEmits {
  (eventName: 'search', data: queryInnerType): void

  (eventName: 'refresh', data: queryInnerType): void

  (eventName: string, data: queryInnerType): void
}

//组件抛出的搜索、重置事件
const emits = defineEmits<MyFormEmits>()
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
      let needCheck: any[] = formRef.value.map(
        (item: { validate: any; fields: { prop: string }[] }) => {
          const key = (item.fields || []).map((item) => item.prop).join(',')
          return { key, val: item.validate?.() }
        }
      )
      if (fold.value) {
        needCheck = needCheck.filter(
          (item) => item.key === searchFinal.value[0].map((item) => item.prop).join(',')
        )
      }
      Promise.all(needCheck.map((item) => item.val)).then((res) => {
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
        if (((item as dateInnerType).dateType || '').indexOf('range') !== -1) {
          //时间范围根据aliases转成对应字段
          dynamicComputedFun(item.prop, 'variable', (item as dateInnerType).aliases)
        } else if (((item as dateInnerType).dateType || '').slice(-1) === 's') {
          //时间范围根据aliases转成对应字段
          dynamicComputedFun(item.prop, 'string', ',')
        } else {
          f = true
        }
        break
      case 'checkbox':
        if ((item as checkboxInnerType).valueType === 'string') {
          dynamicComputedFun(item.prop, 'string', ',')
        } else {
          f = true
        }
        break
      case 'select':
        if (
          !(item as selectInnerType).multiple &&
          (item as checkboxInnerType).valueType !== 'string'
        ) {
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

//搜索条件计算属性,用于页面渲染
const searchComputed = computed(() => {
  return props.search
    .filter((item) => item.isForm ?? true)
    .map((item) => {
      if (item.isRequired && item.isDefault) {
        item.clearable = false
      }
      if (!item.type) item.type = 'input'
      item.showMessage = item.showMessage ?? true
      item.inlineMessage = item.inlineMessage ?? ''
      item.labelPosition = item.labelPosition ?? ''
      item.labelWidth = item.labelWidth ?? ''
      item.clearable = item.clearable ?? props.clearable
      return item
    })
})

onMounted(() => {
  window.addEventListener('resize', formItemWidthComputedListenerHandler)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', formItemWidthComputedListenerHandler)
})
onActivated(() => {
  window.addEventListener('resize', formItemWidthComputedListenerHandler)
})
onDeactivated(() => {
  window.removeEventListener('resize', formItemWidthComputedListenerHandler)
})
//用于监听大小改变的回调
const formItemWidthComputedListener = (event?: UIEvent) => {
  // console.log('大小改变')
  formItemWidthComputed(searchComputed.value)
}
const formItemWidthComputedListenerHandler = useDebounceThrottle(
  formItemWidthComputedListener,
  500
) as EventListener
/**
 * 计算表单项宽度
 * @param search 搜索条件
 * @param callback 回调事件,初始时需传入是否默认执行搜索
 */
const formItemWidthComputed = (search: typeof searchComputed.value, callback = () => {}) => {
  const searchArr: searchTypes[] = []
  let oneRow: searchTypes = []
  nextTick(() => {
    const formPlusMainWidth = formPlusMain.value?.clientWidth
    const inputWidths: { [key: string]: number } = {}
    const buttonsWidth = buttons.value?.[0]?.clientWidth ?? 0
    // console.log(1)
    for (const key in dynamicRefMap.value) {
      let computedStyle = getComputedStyle(dynamicRefMap.value[key].$el);
      if (computedStyle.length == 0) computedStyle = getComputedStyle(document.querySelector(`.my-form-item-${key.replace('Ref', '')}`));

      inputWidths[key] = getDomComputed(computedStyle, 'width') + 6 * 2
      if (isNaN(inputWidths[key])) {
        inputWidths[key] =
          document.querySelector(`.my-form-item-${key.replace('Ref', '')}`)?.getBoundingClientRect()
            ?.width || 312
      }
    }
    // console.log(inputWidths);
    let sum: number = formPlusMainWidth - buttonsWidth * 1.5
    // console.log(inputWidths, sum, buttonsWidth);
    const inputWidthKeys = Object.keys(inputWidths)
    for (let i = 0; i < inputWidthKeys.length; i++) {
      const inputWidthKey = inputWidthKeys[i]
      const inputWidth = inputWidths[inputWidthKey]
      // console.log(sum-inputWidth,inputWidth,inputWidthKey)
      if (sum - inputWidth < 0) {
        searchArr.push([...oneRow])
        oneRow = []
        sum = formPlusMainWidth
        i--
      } else {
        oneRow.push(
          search.find((item) => item.prop === inputWidthKey.replace('Ref', '')) as
            | inputInnerType
            | dateInnerType
            | selectInnerType
        )
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
// ============ 新增：结构变化监听（支持部分重建） ============

// 获取配置项的唯一标识
const getItemKey = (item: typeof props.search[0]) => `${item.prop}-${item.type}`

// 获取当前所有配置项的 key 列表
const getStructureKeys = (searchList: typeof props.search) => {
  return searchList
    .filter(item => item.isForm ?? true)
    .map(item => getItemKey(item))
}

// 部分更新：增删单个配置项
const partialUpdate = async (
  search: typeof props.search,
  action: 'add' | 'remove',
  key: string
) => {
  console.log(`🔄 部分更新: ${action}`, key)

  const prop = key.split('-')[0]

  if (action === 'add') {
    // 新增：找到正确的位置插入
    const item = search.find(i => getItemKey(i) === key)
    if (!item) return

    // 获取当前所有配置的 key 顺序
    const allKeys = search.map(i => getItemKey(i))
    const targetIndex = allKeys.indexOf(key)

    // 将新项插入到 searchFinal 对应的位置
    let inserted = false
    let currentIndex = 0

    for (let rowIndex = 0; rowIndex < searchFinal.value.length; rowIndex++) {
      const row = searchFinal.value[rowIndex]
      const rowEndIndex = currentIndex + row.length

      if (targetIndex <= rowEndIndex) {
        const colIndex = targetIndex - currentIndex
        row.splice(colIndex, 0, item)
        inserted = true
        break
      }
      currentIndex = rowEndIndex
    }

    if (!inserted) {
      if (searchFinal.value.length > 0) {
        searchFinal.value[searchFinal.value.length - 1].push(item)
      } else {
        searchFinal.value.push([item])
      }
    }

  } else {
    // 删除：从 searchFinal 中移除
    for (let rowIndex = 0; rowIndex < searchFinal.value.length; rowIndex++) {
      const row = searchFinal.value[rowIndex]
      const itemIndex = row.findIndex(i => getItemKey(i) === key)
      if (itemIndex !== -1) {
        row.splice(itemIndex, 1)
        break
      }
    }

    // 删除空行
    searchFinal.value = searchFinal.value.filter(row => row.length > 0)
    if (searchFinal.value.length === 0) {
      searchFinal.value = [[]]
    }
  }

  // 更新 rules
  rules.value = createRules(search, props.notNeedChangeCheck)

  // 处理值的变化
  if (action === 'add') {
    const item = search.find(i => getItemKey(i) === key)
    if (item) {
      let f = false
      switch (item.type) {
        case 'date':
          if (((item as dateInnerType).dateType || '').indexOf('range') !== -1) {
            dynamicComputedFun(item.prop, 'variable', (item as dateInnerType).aliases)
          } else if (((item as dateInnerType).dateType || '').slice(-1) === 's') {
            dynamicComputedFun(item.prop, 'string', ',')
          } else {
            f = true
          }
          break
        case 'checkbox':
          if ((item as checkboxInnerType).valueType === 'string') {
            dynamicComputedFun(item.prop, 'string', ',')
          } else {
            f = true
          }
          break
        case 'select':
          if (!(item as selectInnerType).multiple && (item as checkboxInnerType).valueType !== 'string') {
            f = true
          } else {
            dynamicComputedFun(item.prop, 'string', ',')
          }
          break
        default:
          f = true
      }
      if (f) {
        dynamicComputedFun(item.prop, '')
      }
    }
  } else {
    // 删除：清理对应的值
    delete dynamicComputedMap.value[prop]
    // 清除对应的 ref
    delete dynamicRefMap.value[prop + 'Ref']
  }

  // 重新计算布局
  await nextTick()
  formItemWidthComputed(search, () => {
    if (props.defaultSearch) {
      searchFun('search')
    }
  })
}

// 完全重建
const fullRebuild = async (search: typeof props.search) => {
  console.log('🔄 完全重建表单')
  if (search.length === 0) {
    searchFinal.value = [search]
    return
  }

  initSearchValue()
  rules.value = createRules(search, props.notNeedChangeCheck)
  searchFinal.value = [search]
  await nextTick()
  formItemWidthComputed(search, () => {
    if (props.defaultSearch) {
      searchFun('search')
    }
  })
}
//处理搜索表单
// ✅ 新增：计算结构标识（只包含 prop 和 type，不包含 options 等动态属性）
const getStructureSign = (searchList: typeof props.search) => {
  return searchList
    .filter((item) => item.isForm ?? true)
    .map((item) => `${item.prop}-${item.type}`)
    // .join('|');
};

// ============ 替换：只监听结构变化（增删），不监听属性修改 ============

watch(
  () => getStructureKeys(props.search).join('|'),
  async (newKeysStr, oldKeysStr) => {
    if (newKeysStr === oldKeysStr && searchFinal.value.length > 0) {
      return
    }

    const newKeys = newKeysStr.split('|').filter(Boolean)
    const oldKeys = oldKeysStr?.split('|').filter(Boolean) || []

    const added = newKeys.filter(k => !oldKeys.includes(k))
    const removed = oldKeys.filter(k => !newKeys.includes(k))

    console.log('📊 结构变化:', { added, removed })

    const search = searchComputed.value

    // 场景1：只新增了一个
    if (removed.length === 0 && added.length === 1) {
      await partialUpdate(search, 'add', added[0])
      return
    }

    // 场景2：只删除了一个
    if (added.length === 0 && removed.length === 1) {
      await partialUpdate(search, 'remove', removed[0])
      return
    }

    // 场景3：其他情况，完全重建
    await fullRebuild(search)
  },
  { immediate: true }
)

//最终渲染的按钮组
const searchButtonFinal = ref<(button | refresh | search | searchRefresh)[]>([])

//处理搜索按钮
watch(
  () => props.searchButton,
  () => {
    const searchButton: (button | refresh | search | searchRefresh)[] = [...props.searchButton]
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
  return searchFinal.value.length > 1 && !props.notNeedFlod
})
//展开收起事件
const openList = () => {
  fold.value = !fold.value
}
const attrs = useAttrs()
const { getFunDomComponent, clearFunDomCache } = useFunDom(attrs)

onBeforeUnmount(() => {
  clearFunDomCache()
})
const updateData = (prop: string, data: any) => {
  dynamicComputedMap.value[prop] = data
}
const getData = (prop: string): void => {
  return dynamicComputedMap.value[prop]
}
//暴露的数据
defineExpose({ fold, dynamicRefMap, formPlusMain, buttons, updateData, getData, searchFun })
</script>

<style scoped lang="scss">
.searchList.hide {
  height: 0;
  opacity: 0;
  transition: all 0.1s;
  padding: 0px;
}

.searchList {
  padding: 10px;

  .hide {
    height: 0;
    opacity: 0;
    transition: all 0.1s;
    display: none;
    padding: 0px;
  }

  .show {
    opacity: 1;
    height: 100%;
    transition: all 0.5s;
    display: unset;
  }

  .search_form_menu {
    margin-top: 4px;

    &:first-child {
      margin-top: 0;
    }

    &:first-child {
      .el-form {
        .el-form-item {
          margin-top: 0;
        }
      }
    }

    .el-form {
      .el-form-item {
        margin-bottom: 0;
        margin-top: 18px;
      }

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
