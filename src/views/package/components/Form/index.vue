<template>
  <el-config-provider :locale="language">
    <div class="searchList form form-plus-main" :class="{ hide: !showSearch, show: showSearch }">
      <div
        style="margin-bottom: 4px"
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
            v-for="(item,index) in rowItem"
            :key="JSON.stringify(item)"
            :name="item.prop"
            :prop="item.prop"
            :data="searchValue"
          >
            <el-form-item
              :ref="(el:any) => dynamicCreateRef(el, item.prop)"
              :label="item.label"
              :prop="item.prop"
              :class="`my-form-item my-form-item-${rowIndex} my-form-item-${rowIndex}-${index}`"
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
                  <Date
                    :data="(item as dateInnerType)"
                    v-if="item.type === 'date'"
                    v-model="dynamicComputedMap[item.prop]"
                  ></Date>

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

          <el-form-item v-if="rowIndex === 0">
            <div style="margin-bottom: 4px; display: flex" :gutter="gutter">
              <div
                v-for="item in searchButtonFinal"
                :key="JSON.stringify(item)"
                style="display: flex"
                :span="item.span"
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
import { ref, watch, computed, nextTick } from 'vue'
import { RefreshLeft, ArrowUp, ArrowDown, Search } from '@element-plus/icons-vue'
import type {
  button,
  queryInnerType,
  refresh,
  search,
  searchRefresh,
} from '../js/types'
import Input from '../components/input/index.vue'
import Select from '../components/select/index.vue'
import CheckBox from '../components/checkbox/index.vue'
import Radio from '../components/radio/index.vue'
import Date from '../components/date/index.vue'
import Switch from '../components/switch/index.vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import type {
  checkboxInnerType,
  dateInnerType,
  inputInnerType,
  radioInnerType,
  selectInnerType, switchInnerType
} from '../components/form/types'
import MyComputedData from '../utils/hooks/MyComputedData'
import { createRules } from '../utils/rules'

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
const slots = defineSlots()
const searchValue = ref<queryInnerType>({ pageNum: 1, pageSize: 10 })
const formRef = ref()
const fold = ref<boolean>(true) //true 显示第一行/false 显示所有
const rowMax = ref<number>(24)

type searchTypes = typeof props.search

const searchFinal = ref<searchTypes[]>([])
const rules = ref()
const dynamicRefMap = ref<{ [name: string]: any }>({})
//动态创建表单ref
const dynamicCreateRef = (el: any, prop: string) => {
  nextTick(() => {
    dynamicRefMap.value[prop + 'Ref'] = el
  })
}
const { dynamicComputedFun, dynamicComputedMap } = MyComputedData(props.searchValue, searchValue)
const emits = defineEmits(['search', 'refresh'])
const searchFun = (fun: (typeof searchButtonFinal.value)[number]['fun']) => {
  nextTick(() => {
    if (fun === 'refresh') {
      initSearchValue(props.search)
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
      // let needCheck: searchItemType[] = []
      // if (!fold.value) {
      //   //全部
      //   searchFinal.value.forEach((item1) => {
      //     needCheck.push(...item1.filter((item) => item.isRequired))
      //   })
      // } else {
      //   //首行
      //   needCheck = searchFinal.value[0].filter((item) => item.isRequired)
      // }

      // if (needCheck.length > 0) {
      //   let NotEmpty: searchItemType[] = needCheck.filter((item) => {
      //     let value = dynamicComputedMap.value[item.prop]
      //     return (
      //       (typeof value === 'number' || typeof value === 'boolean' ? String(value) : value ?? '')
      //         .length === 0
      //     )
      //   })
      //   if (NotEmpty.length > 0) {
      //     // 提示错误
      //     NotEmpty.forEach((item) => {
      //       nextTick(() => {
      //         document.querySelector('._class' + item.prop)?.classList?.add('error')
      //       })
      //     })
      //     return
      //   }
      // }
      let needCheck: any[] = formRef.value.map((item: { validate: () => void }) => {
        return item.validate()
      })
      if (fold.value) {
        needCheck = [needCheck[0]].filter((item) => item)
      }
      Promise.all(needCheck).then((res) => {
        console.log(res)
        emits(fun, searchValue.value)
      })

      return
    }
    emits(fun, searchValue.value)
  })
}
const initSearchValue = (search: typeof props.search) => {
  rules.value = createRules(search)
  search.forEach((item) => {
    let f = false
    switch (item.type) {
      case 'date':
        if (((item as dateInnerType).dateType || '').indexOf('range') === -1) {
          f = true
        } else {
          dynamicComputedFun(item.prop, 'variable', (item as dateInnerType).aliases)
          // let aliasesArr = ((item as date).aliases || '').split(',')
          // if ((item as date).aliases && aliasesArr.length > 0) {
          //   dynamicArraysComputedFun(item.prop, (item as date).aliases)
          // } else dynamicStringComputedFun(item.prop, 'array')
        }
        break
      case 'select':
        if (!(item as selectInnerType).multiple) {
          f = true
        } else {
          // let aliasesArr = ((item as date).aliases || '').split(',')
          // if ((item as date).aliases && aliasesArr.length > 0) {
          // dynamicArraysToStringComputedFun(item.prop, ',')
          dynamicComputedFun(item.prop, 'string', ',')
          // } else dynamicStringComputedFun(item.prop, 'array')
        }
        break
      default:
        f = true
    }
    if (f) {
      dynamicComputedFun(item.prop, '')
    }
    // searchValue.value[item.prop] =
    //   item.type !== 'date' ? props.searchValue[item.prop] ?? '' : props.searchValue[item.prop] ?? []
  })
  searchValue.value['pageSize'] = 10
  searchValue.value['pageNum'] = 1
}
const searchComputed = computed(() => {
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
      item.span = item.span ?? 5
      item.clearable = item.clearable ?? props.clearable
      return item
    })
})
watch(
  () => searchComputed.value,
  () => {
    let search = searchComputed.value
    if (search.length === 0) return []
    initSearchValue(search)
    let sum: number = 0
    let searchArr: searchTypes[] = []
    let oneRow: searchTypes = []
    for (let i = 0; i < search.length; i++) {
      const searchItem = search[i]
      let span = searchItem.span ?? 0
      if (sum + span <= rowMax.value) {
        oneRow.push(searchItem)
        sum += span
      } else {
        i--
        searchArr.push(oneRow)
        oneRow = []
        sum = 0
      }
    }
    if (oneRow.length != 0) {
      searchArr.push(oneRow)
    }
    searchFinal.value = searchArr
    if (props.defaultSearch) {
      searchFun('search')
    }
  },
  {
    deep: true,
    immediate: true,
  }
)

const showFold = computed(() => {
  return searchFinal.value.length > 1
})
const searchButtonFinal = ref<(button | refresh | search | searchRefresh)[]>([])
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

const openList = () => {
  fold.value = !fold.value
}

defineExpose([fold])
</script>

<style scoped lang="scss">
.form {
  padding: 10px;
  //display: flex;
  //justify-content: space-between;
  // transition: all 0.5s;
}

.fold.el-button.is-text:not(.is-disabled):hover {
  background-color: transparent;
}

.hide {
  height: 0;
  opacity: 0;
  transition: all 0.1s;
}
.show {
  opacity: 1;
  height: 100%;
  transition: all 0.5s;
}

// dcdfe6
</style>
