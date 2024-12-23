<template>
  <el-config-provider :locale="language">
    <el-card shadow="hover">
      <template #header>
        <slot name="header">
          <el-row :gutter="10">
            <el-col :span="1.5" v-if="hasAdd">
              <el-button type="primary" plain :icon="Plus" @click="handleAdd()" v-if="hasAdd"
                >新增
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
        ref="tableRef"
      >
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
            <slot :name="item.prop" :row="scope.row" :index="scope.$index">
              <span
                :class="`span span_${item.prop} span_${item.prop}_${
                  scope.row[item.prop]
                } span_other_${item.classFun && item.classFun(scope.row, item.prop)}`"
                >{{ item.fun && item.fun(scope.row, item.prop, scope.$index)
                }}</span
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
              <el-tooltip content="详情" placement="top" v-if="hasDetail">
                <el-button link type="primary" :icon="Search" @click="handleDetail(scope.row)" />
              </el-tooltip>
            </slot>

            <slot name="detail" :data="scope.row">
              <el-tooltip content="修改" placement="top" v-if="hasUpdate">
                <el-button link type="primary" :icon="Edit" @click="handleUpdate(scope.row)" />
              </el-tooltip>
            </slot>

            <slot name="detail" :data="scope.row">
              <el-tooltip content="删除" placement="top" v-if="hasRemove">
                <el-button link type="primary" :icon="Delete" @click="handleRemove(scope.row)" />
              </el-tooltip>
            </slot>

            <slot :name="`operation`" :data="scope.row"> </slot>
          </template>
        </el-table-column>
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
import { computed, ref, watch, useSlots, onMounted } from 'vue'
import pagination from '../components/Pagination/index.vue'
import RightToolbar from '../components/RightToolbar/index.vue'
import { Plus, Search, Delete, Edit } from '@element-plus/icons-vue'
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
const slots = useSlots()

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
    type: [Boolean],
    default: false,
  },
  hasDetail: {
    type: [Boolean],
    default: true,
  },
  hasUpdate: {
    type: [Boolean],
    default: true,
  },
  hasRemove: {
    type: [Boolean],
    default: true,
  },
  tableColumn: {
    type: Array<{
      prop: string
      label: string
      isTable?: boolean
      isForm?: boolean
      showOverflow?: boolean
      width?: number
      hidden?: boolean
      visible?: boolean
      align?: 'center' | 'left' | 'right'
      fixed?: false | true | 'left' | 'right'
      fun?: (row: dataItemType, prop: string, index?: number) => string
      classFun?: (row: dataItemType, prop: string) => string
    }>,
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
})

const canHiddenColumns = computed({
  get() {
    let data = tableColumn.value
    .filter(item=>(item.isTable || typeof item.isTable === 'undefined'))
      .map((item,index) => {
        return {
          key: item.prop,
          label: item.label,
          visible: item.visible ?? true,
          hidden:item.hidden,
          index:index
        }
      }).filter((item) => item.hidden)
    return data
  },
  set(data) {
    data.forEach(item=>{
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
          item.fun =
            item.fun || ((row: dataItemType, prop: string, index?: number) => String(row[prop]))
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
</script>
