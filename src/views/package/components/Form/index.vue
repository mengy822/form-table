<template>
  <el-config-provider :locale="language">
    <div class="form" v-show="showSearch">
      <div class="searchList">
        <el-row
          style="margin-bottom: 4px"
          class="search_form_menu"
          :gutter="gutter"
          v-for="(rowItem, rowIndex) in searchFinal"
          v-show="(fold && rowIndex == 0) || !fold"
          :key="JSON.stringify(rowItem)"
        >
          <el-col
            style="display: flex; align-items: center"
            v-for="item in rowItem"
            :key="JSON.stringify(item)"
            :span="item.span"
            :class="`col_${item.prop}`"
          >
            <slot :name="`label_${item.prop}`">
              <label
                :class="{ label_class: true, is_required: item.isRequired }"
                :style="{ width: item.labelWidth ?? labelWidth }"
                v-show="item.showLabel ?? showSearchLabel"
                :for="'_id' + item.prop"
                >{{ item.label }}</label
              >
            </slot>
            <slot :name="item.prop" :data="searchValue">
              <Input
                :ref="(e) => dynamicCreateRef(e, item.prop)"
                :data="item"
                v-if="item.type === 'input'"
                v-model="dynamicComputedMap[item.prop]"
              ></Input>
              <Date
                :ref="(e) => dynamicCreateRef(e, item.prop)"
                class="date"
                :data="item"
                v-if="item.type === 'date'"
                v-model="dynamicComputedMap[item.prop]"
              ></Date>
              <Select
                :ref="(e) => dynamicCreateRef(e, item.prop)"
                class="select"
                :data="item"
                v-if="item.type === 'select'"
                v-model="dynamicComputedMap[item.prop]"
              ></Select>
            </slot>
          </el-col>
        </el-row>
      </div>
      <div class="buttonList">
        <div style="margin-bottom: 4px" class="search_form_menu" :gutter="gutter">
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
              @click="clickFun"
              >{{ item.label }}
            </el-button>
            <el-button
              v-if="item.type === 'search'"
              :size="item.size ?? 'small'"
              :type="item.inputType ?? 'primary'"
              :icon="item.icon ?? Search"
              @click="searchFun(item.fun)"
              >{{ item.label }}
            </el-button>
            <el-button
              v-if="item.type === 'search-refresh'"
              :size="item.size ?? 'default'"
              :type="item.inputType ?? 'primary'"
              :icon="item.icon ?? Search"
              @click="searchFun(item.fun ?? 'search')"
              >{{ item.searchLabel }}
            </el-button>
            <el-button
              v-if="item.type === 'search-refresh'"
              :size="item.size ?? 'default'"
              :type="item.inputType ?? ''"
              :icon="item.icon ?? RefreshLeft"
              @click="searchFun('refresh')"
              >{{ item.refreshLabel }}
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
      </div>
    </div>
  </el-config-provider>
</template>

<script setup lang="ts" name="MyForm">
import { ref, watch, computed, nextTick } from 'vue'
import { RefreshLeft, ArrowUp, ArrowDown, Search } from '@element-plus/icons-vue'
import type {
  button,
  date,
  input,
  queryInnerType,
  refresh,
  search,
  searchItemType,
  searchRefresh,
  select,
} from '../js/types'
import type { inputType } from '../components/input/types'
import Input from '../components/input/index.vue'
import Select from '../components/select/index.vue'
import CheckBox from '../components/checkbox/index.vue'
import Radio from '../components/radio/index.vue'
import Date from '../components/date/index.vue'
import { selectType } from '../components/select/types'
import { dateType } from '../components/date/types'

import zhCn from 'element-plus/es/locale/lang/zh-cn'
import type {
  dateInnerType,
  inputInnerType,
  selectInnerType,
} from '../components/form/types'
import MyComputedData from '../utils/hooks/MyComputedData'

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

const searchValue = ref<queryInnerType>({ pageNum: 1, pageSize: 10 })

const fold = ref<boolean>(true) //true 显示第一行/false 显示所有
const rowMax = ref<number>(24)

type searchTypes=typeof props.search

const searchFinal = ref<searchTypes[]>([])

const dynamicRefMap = ref<{ [name: string]: any }>({})
//动态创建表单ref
const dynamicCreateRef = (el: any, prop: string) => {
  nextTick(() => {
    dynamicRefMap.value[prop + 'Ref'] = el
  })
}
const { dynamicComputedFun, dynamicComputedMap } = MyComputedData(props.searchValue, searchValue)
const emits = defineEmits(['search', 'refresh'])
const searchFun = (fun: 'search' | 'refresh') => {
  nextTick(() => {
    if (fun === 'refresh') {
      initSearchValue(props.search)
      const errors: NodeListOf<Element> = document.querySelectorAll('.error')
      for (let i = 0; i < errors.length; i++) {
        errors[i]?.classList?.remove('error')
      }
      if (props.isRefreshSearch) {
        //emits('search', searchValue.value)
        fun = 'search'
      } else return
    }
    if (fun === 'search') {
      let needCheck: searchItemType[] = []
      if (!fold.value) {
        //全部
        searchFinal.value.forEach((item1) => {
          needCheck.push(...item1.filter((item) => item.isRequired))
        })
      } else {
        //首行
        needCheck = searchFinal.value[0].filter((item) => item.isRequired)
      }

      if (needCheck.length > 0) {
        let NotEmpty: searchItemType[] = needCheck.filter((item) => {
          let value = dynamicComputedMap.value[item.prop]
          return (
            (typeof value === 'number' || typeof value === 'boolean' ? String(value) : value ?? '')
              .length === 0
          )
        })
        if (NotEmpty.length > 0) {
          // 提示错误
          NotEmpty.forEach((item) => {
            nextTick(() => {
              document.querySelector('._class' + item.prop)?.classList?.add('error')
            })
          })
          return
        }
      }

      emits(fun, searchValue.value)
      return
    }
    emits(fun, searchValue.value)
  })
}
const initSearchValue = (search: typeof props.search) => {
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
  display: flex;
  justify-content: space-between;

  .searchList {
    width: 83%;
  }

  .buttonList {
    max-width: 17%;
    justify-content: center;
    display: flex;
    align-items: center;

    .search_form_menu {
      //width:90%;
      display: flex;
      // flex-wrap: wrap;
      justify-content: space-between;
    }
  }
}

.label_class {
  display: flex;
  justify-content: flex-end;
  padding-right: 10px;
}

.is_required {
  display: inline-flex;
  justify-content: flex-end;
  align-items: flex-start;
  flex: 0 0 auto;
  height: 32px;
  line-height: 32px;
  padding: 0 12px 0 0;
  box-sizing: border-box;

  &:before {
    content: '*';
    color: #f56c6c;
    margin-right: 4px;
  }
}

.fold:not(.is-disabled):hover {
  background: none;
}

:deep(.error) {
  // border :#f56c6c 1px solid;
  box-shadow: 0 0 0 1px #f56c6c inset !important;

  .el-input__wrapper,
  .el-select__wrapper {
    box-shadow: 0 0 0 1px #f56c6c inset;
  }
}

// dcdfe6
</style>
