<template>
  <el-config-provider :locale="language">
    <el-card shadow="hover">
      <template #header>
        <slot name="header">
          <el-row :gutter="10">
            <el-col :span="1.5" v-if="hasAdd">
              <el-button type="primary" plain :icon="Plus" @click="handleAdd()"
                >{{ typeof hasAdd !== 'boolean' ? hasAdd : '新增' }}
              </el-button>
            </el-col>
            <el-col :span="1.5" v-if="slots['tableOperation']">
              <slot name="tableOperation"> </slot>
            </el-col>
            <right-toolbar
              v-model:showSearch="showSearch"
              v-model:columns="canHiddenColumns"
              @queryTable="handleQuery(true)"
            ></right-toolbar>
          </el-row>
        </slot>
      </template>
      <el-table
        :height="height"
        :max-height="maxHeight"
        v-loading="loading"
        :data="dataList"
        @selection-change="handleSelectionChange"
        ref="tableRef"
        :highlight-current-row="highlightCurrentRow"
        :current-row-key="currentRowKey"
        :row-class-name="rowClassName"
        :row-style="rowStyle"
        :cell-class-name="cellClassName"
        :cell-style="cellStyle"
        :header-row-class-name="headerRowClassName"
        :header-row-style="headerRowStyle"
        :header-cell-class-name="headerCellClassName"
        :header-cell-style="headerCellStyle"
        :row-key="rowKey"
        :empty-text="emptyText"
      >
        <el-table-column v-if="hasSelection" type="selection" :selectable="typeof hasSelection==='boolean'?()=>true:hasSelection" width="55" />
        <el-table-column
          fixed="left"
          v-if="hasIndex"
          :min-width="60"
          prop="index"
          :label="typeof hasIndex === 'boolean' ? '序号' : hasIndex"
        >
          <template #default="scope">
            {{ queryParams.pageSize * (queryParams.pageNum - 1) + scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column
          v-for="item in tableColumnFinal.filter(
            (item) => !item.hidden || (item.hidden && item.visible)
          )"
          :key="item.prop"
          :prop="item.prop"
          :label="item.label"
          :fixed="item.fixed ?? false"
          :min-width="item.width ?? 100"
          :align="item.align ?? 'center'"
          :show-overflow-tooltip="item.showOverflow ?? true"
        >
          <template #default="scope">
            <slot
              :name="item.prop"
              :prop="item.prop"
              :data="scope.row[item.prop]"
              :row="scope.row"
              :index="scope.$index"
            >
              <span
                :class="`span span_${item.prop} span_${item.prop}_${
                  scope.row[item.prop]
                } span_other_${item.classFun && item.classFun(scope.row, item.prop)}`"
                >{{ item.fun && item.fun(scope.row, item.prop, scope.$index) }}</span
              >
            </slot>
          </template>
        </el-table-column>

        <el-table-column
          fixed="right"
          :label="typeof hasOperation === 'boolean' ? '操作' : hasOperation"
          width="120"
          v-if="hasOperation"
        >

          <template #default="scope">
            <slot name="detail" :data="scope.row">
              <el-tooltip
                content="详情"
                placement="top"
                v-if="item.hasDetail(scope.row) && hasDetail"
              >
                <el-button link type="primary" :icon="Search" @click="handleDetail(scope.row)">
                  {{ typeof hasDetail === 'boolean' ? '' : hasDetail }}
                </el-button>
              </el-tooltip>
            </slot>

            <!-- <slot name="update" :data="scope.row">
              <el-tooltip
                content="修改"
                placement="top"
                v-if="item.hasUpdate(scope.row) && hasUpdate"
              >
                <el-button link type="primary" :icon="Edit" @click="handleUpdate(scope.row)">
                  {{ typeof hasUpdate === 'boolean' ? '' : hasUpdate }}
                </el-button>
              </el-tooltip>
            </slot>

            <slot name="remove" :data="scope.row">
              <el-tooltip
                content="删除"
                placement="top"
                v-if="item.hasRemove(scope.row) && hasRemove"
              >
                <el-button link type="primary" :icon="Delete" @click="handleRemove(scope.row)">
                  {{ typeof hasRemove === 'boolean' ? '' : hasRemove }}
                </el-button>
              </el-tooltip>
            </slot> -->

            <slot :name="`operation`" :data="scope.row"> </slot>
          </template>
        </el-table-column>
        <template #empty v-if="slots['empty']">
          <slot name='empty'></slot>
        </template>
      </el-table>
      <pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="handleQuery"
      />
    </el-card>
  </el-config-provider>
</template>

<script setup lang="ts" name="MyTable">
import { computed, ref, watch, useSlots, onMounted,type PropType, type CSSProperties } from 'vue'
import pagination from '../components/Pagination/index.vue'
import RightToolbar from '../components/RightToolbar/index.vue'
import { Plus, Search, Delete, Edit } from '@element-plus/icons-vue'
import type { TableInstance } from 'element-plus'
interface query extends queryParamType {
  pageSize: number
  pageNum: number
}

interface queryParamType {
  [key: string]: string | number | undefined | boolean
}

interface dataItemType {
  [key: string]: string | number | undefined | boolean
}
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { HighlightSpanKind } from 'typescript'
const slots = useSlots()
interface tableColumnItem {
  prop: string
  label: string
  isTable?: boolean
  isForm?: boolean
  showOverflow?: boolean
  width?: number
  unit?:string;//单位
  hidden?: boolean
  visible?: boolean
  align?: 'center' | 'left' | 'right'
  fixed?: false | true | 'left' | 'right'
  selectable?:boolean
  fun?: (row: dataItemType, prop: string, index?: number) => string
  classFun?: (row: dataItemType, prop: string) => string
  hasDetail?: (row: dataItemType) => boolean
  hasUpload?: (row: dataItemType) => boolean
  hasRemove?: (row: dataItemType) => boolean
}
const props = defineProps({
  language: {
    type: Object,
    default: () => {
      return zhCn
    },
  },
  hasIndex: {
    type: [Boolean, String],
    default: true,
  },

  hasSelection: {
    type: [Boolean,Function] as PropType<boolean|((row: any, index: number) => boolean)>,
    default: false,
  },

  hasOperation: {
    type: [Boolean, String],
    default: true,
  },

  maxHeight: {
    type: [Number, String],
    default: undefined,
  },
  height: {
    type: [Number, String],
    default: undefined,
  },
  hasAdd: {
    type: [Boolean, String],
    default: false,
  },
  hasDetail: {
    type: [Boolean, String],
    default: true,
  },
  hasUpdate: {
    type: [Boolean, String],
    default: true,
  },
  hasRemove: {
    type: [Boolean, String],
    default: true,
  },
  tableColumn: {
    type: Array<tableColumnItem>,
    required: true,
  },
  queryParam: {
    type: Object as () => queryParamType,
    required: true,
  },
  removeMessage: {
    type: String,
    default: '您确定删除该数据吗? 警告:该操作不可逆,请慎重操作',
  },
  dataList: {
    type: Array<dataItemType>,
    required: true,
    default: () => {
      return []
    },
  },
  total: {
    type: Number,
    default: 0,
  },

  highlightCurrentRow: {//是否要高亮当前行
    type: Boolean,
    default: false,
  },
  currentRowKey: {//当前行的 key，只写属性
    type: [String,Number],
    default: "",
  },
  rowClassName: {//行的 className 的回调方法，也可以使用字符串为所有行设置一个固定的 className。
    type: [String,Function] as PropType<string|((data: { row: any, rowIndex: number }) => string)>,
    default: "",
  },
  rowStyle: {//行的 style 的回调方法，也可以使用一个固定的 Object 为所有行设置一样的 Style。
    type: [Object,Function] as PropType<CSSProperties|((data: { row: any, rowIndex: number }) => CSSProperties)>,
    default: ()=>{
      return{}
    },
  },
  cellClassName: {//单元格的 className 的回调方法，也可以使用字符串为所有单元格设置一个固定的 className。
    type: [String,Function] as PropType<string|((data: { row: any, column: any, rowIndex: number, columnIndex: number }) => string)>,
    default: "",
  },
  cellStyle: {//单元格的 style 的回调方法，也可以使用一个固定的 Object 为所有单元格设置一样的 Style。
    type: [Object,Function] as PropType<CSSProperties|((data: { row: any, column: any, rowIndex: number, columnIndex: number }) => CSSProperties)>,
    default: ()=>{
      return{}
    },
  },
  headerRowClassName: {//表头行的 className 的回调方法，也可以使用字符串为所有表头行设置一个固定的 className。
    type: [String,Function] as PropType<string|((data: { row: any, rowIndex: number }) => string)>,
    default: "",
  },
  headerRowStyle: {//表头行的 style 的回调方法，也可以使用一个固定的 Object 为所有表头行设置一样的 Style。
    type: [Object,Function] as PropType<CSSProperties|((data: { row: any, rowIndex: number }) => CSSProperties)>,
    default: ()=>{
      return{}
    },
  },
  headerCellClassName: {//表头单元格的 className 的回调方法，也可以使用字符串为所有表头单元格设置一个固定的 className。
    type: [String,Function] as PropType<string|((data: { row: any, column: any, rowIndex: number, columnIndex: number }) => string)>,
    default: "",
  },
  headerCellStyle: {//表头单元格的 style 的回调方法，也可以使用一个固定的 Object 为所有表头单元格设置一样的 Style。
    type: [Object,Function] as PropType<CSSProperties|((data: { row: any, column: any, rowIndex: number, columnIndex: number }) => CSSProperties)>,
    default: ()=>{
      return{}
    },
  },
  rowKey: {//行数据的 Key，用来优化 Table 的渲染； 在使用reserve-selection功能与显示树形数据时，该属性是必填的。 类型为 String 时，支持多层访问：user.info.id，但不支持 user.info[0].id，此种情况请使用 Function。
    type: [String,Function] as PropType<string|((row: any) => string)>,
    default: "",
  },
  emptyText: {//空数据时显示的文本内容， 也可以通过 #empty 设置
    type: [String] ,
    default: "没有数据",
  },
})
const tableRef=ref<TableInstance>()
const selectable = (row: tableColumnItem) => row.selectable
const multipleSelection = ref<tableColumnItem[]>([])
const toggleSelection = (rows?: tableColumnItem[], ignoreSelectable?: boolean) => {
  if (rows) {
    rows.forEach((row) => {
      tableRef.value?.toggleRowSelection(row, undefined, ignoreSelectable)
    })
  } else {
    tableRef.value?.clearSelection()
  }
}
const handleSelectionChange = (val: tableColumnItem[]) => {
  multipleSelection.value = val
}
const canHiddenColumns = computed({
  get() {
    let data = tableColumn.value
      .filter((item) => item.isTable || typeof item.isTable === 'undefined')
      .map((item, index) => {
        return {
          key: item.prop,
          label: item.label,
          visible: item.visible ?? true,
          hidden: item.hidden,
          index: index,
        }
      })
      .filter((item) => item.hidden)
    return data
  },
  set(data) {
    data.forEach((item) => {
      tableColumn.value[item.index].visible = item.visible
    })
  },
})
const tableColumn = ref<typeof props.tableColumn>([])
const tableColumnFinal = computed({
  get() {
    if (tableColumn.value.length === 0) {
      tableColumn.value = props.tableColumn
        .filter((item) => item.isTable || typeof item.isTable === 'undefined')
        .map((item) => {
          item.visible = item.visible ?? true
          item.selectable = item.selectable ?? true
          item.fun =
            item.fun ?? ((row: dataItemType, prop: string, index?: number) => String(row[prop])+(item.unit??''))

          item.hasDetail = item.hasDetail ?? ((row: dataItemType) => true)
          console.log(item,'item.hasDetail')
          item.hasUpload = item.hasUpload ?? ((row: dataItemType) => true)
          item.hasRemove = item.hasRemove ?? ((row: dataItemType) => true)
          return item
        })
    }
    return tableColumn.value
  },
  set(data) {
    tableColumn.value = [...data]
  },
})

// const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(true)

const queryParams = ref<query>({ pageSize: 10, pageNum: 1, ...props.queryParam })
watch(
  () => props.queryParam,
  () => {
    queryParams.value = { ...queryParams.value, ...props.queryParam }
  },
  {
    deep: true,
    immediate: true,
  }
)
const emits = defineEmits(['query', 'add', 'update', 'detail', 'remove', 'showSearch'])

watch(
  () => showSearch.value,
  () => {
    emits('showSearch', showSearch.value)
  },
  {
    immediate: true,
  }
)
watch(
  () => props.dataList,
  () => {
    loading.value = false
  },
  {
    deep: true,
    immediate: true,
  }
)

const handleQuery = (isFirst: boolean = false) => {
  loading.value = true
  if (typeof isFirst === 'boolean' && isFirst) {
    queryParams.value.pageNum = 1
  }
  emits('query', queryParams.value)
}
const handleAdd = () => {
  emits('add')
}
const handleUpdate = (row: dataItemType) => {
  emits('update', row)
}
const handleRemove = (row: dataItemType) => {
  // proxy?.$modal.confirm(props.removeMessage).then((res) => {
  //   emits('remove', row);
  // });
}
const handleDetail = (row: dataItemType) => {
  emits('detail', row)
}
defineExpose({
  multipleSelection:multipleSelection.value,
  toggleSelection
})
</script>
