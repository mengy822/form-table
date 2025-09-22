<template>
<el-config-provider :locale="language">
    <el-card shadow="hover" class="table-plus-operation">
      <template #header>
        <slot name="header">
          <el-row :gutter="10">
            <el-col :span="1.5" v-if="hasAdd || proxyProps[`onAdd`]">
              <el-button type="primary" plain :icon="Plus" @click="handleAdd()"
                >{{ typeof hasAdd !== 'boolean' ? hasAdd : '新增' }}
              </el-button>
            </el-col>
            <el-col :span="1.5" v-if="slots['tableOperation']">
              <slot name="tableOperation"> </slot>
            </el-col>
            <right-toolbar
              :search="proxyProps['onUpdate:showSearch']"
              v-model:showSearch="showSearch"
              v-model:columns="canHiddenColumns"
              @queryTable="handleQuery(true)"
            ></right-toolbar>
          </el-row>
        </slot>
      </template>
      <el-table
        class="table-plus-main"
        :height="height || heightInner || maxHeight"
        :max-height="maxHeight || maxHeightInner || height"
        v-loading="loading"
        :data="dataListComputed"
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
        <el-table-column
          v-if="hasSelection"
          type="selection"
          fixed="left"
          :selectable="typeof hasSelection === 'boolean' ? () => true : hasSelection"
          width="55"
        />
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
        <MyTableColumn :tableColumnFinal="tableColumnFinal"></MyTableColumn>

        <el-table-column fixed="right" width="200" v-if="hasOperation">
          <template #header>
            <slot name="operationHeader">
              {{ typeof hasOperation === 'boolean' ? '操作' : hasOperation }}
            </slot>
          </template>
          <template #default="scope">
            <slot name="detail" :data="scope.row">
              <el-tooltip
                :content="`${
                  (typeof hasDetail === 'boolean'
                    ? undefined
                    : typeof hasDetail === 'function'
                    ? hasOperationName
                      ? hasDetail(scope.row)
                      : undefined
                    : hasDetail) ?? '详情'
                }`"
                placement="top"
                v-if="
                  typeof hasDetail === 'function'
                    ? hasDetail(scope.row)
                    : hasDetail || proxyProps[`onDetail`]
                "
              >
                <el-button
                  link
                  type="primary"
                  :loading="operationLoading"
                  :icon="Search"
                  @click="handleDetail(scope.row)"
                >
                  {{
                    typeof hasDetail === 'boolean'
                      ? undefined
                      : typeof hasDetail === 'function'
                      ? hasOperationName
                        ? hasDetail(scope.row)
                        : undefined
                      : hasDetail
                  }}
                </el-button>
              </el-tooltip>
            </slot>

            <slot name="update" :data="scope.row">
              <el-tooltip
                :content="`${
                  (typeof hasUpdate === 'boolean'
                    ? undefined
                    : typeof hasUpdate === 'function'
                    ? hasOperationName
                      ? hasUpdate(scope.row)
                      : undefined
                    : hasUpdate) ?? '修改'
                }`"
                placement="top"
                v-if="
                  typeof hasUpdate === 'function'
                    ? hasUpdate(scope.row)
                    : hasUpdate || proxyProps[`onUpdate`]
                "
              >
                <el-button
                  link
                  type="primary"
                  :loading="operationLoading"
                  :icon="Edit"
                  @click="handleUpdate(scope.row)"
                >
                  {{
                    typeof hasUpdate === 'boolean'
                      ? undefined
                      : typeof hasUpdate === 'function'
                      ? hasOperationName
                        ? hasUpdate(scope.row)
                        : undefined
                      : hasUpdate
                  }}
                </el-button>
              </el-tooltip>
            </slot>

            <slot name="remove" :data="scope.row">
              <el-tooltip
                :content="`${
                  (typeof hasRemove === 'boolean'
                    ? undefined
                    : typeof hasRemove === 'function'
                    ? hasOperationName
                      ? hasRemove(scope.row)
                      : undefined
                    : hasRemove) ?? '删除'
                }`"
                placement="top"
                v-if="
                  typeof hasRemove === 'function'
                    ? hasRemove(scope.row)
                    : hasRemove || proxyProps[`onRemove`]
                "
              >
                <el-button
                  link
                  type="primary"
                  :loading="operationLoading"
                  :icon="Delete"
                  @click="handleRemove(scope.row)"
                >
                  {{
                    typeof handleRemove === 'boolean'
                      ? undefined
                      : typeof handleRemove === 'function'
                      ? hasOperationName
                        ? handleRemove(scope.row)
                        : undefined
                      : handleRemove
                  }}
                </el-button>
              </el-tooltip>
            </slot>

            <slot :name="`operation`" :data="scope.row"> </slot>
          </template>
        </el-table-column>
        <template #empty v-if="slots['empty']">
          <slot name="empty"></slot>
        </template>
      </el-table>
      <pagination
        class="table-plus-pagination"
        v-show="totalComputed > 0"
        :total="totalComputed"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="handleQuery"
      />
    </el-card>
  </el-config-provider>
</template>

<script lang="ts">
export default {
  name: 'MyTable',
}
</script>
<script  lang="ts" setup>
import { propsConfig } from './props'
import { ref,getCurrentInstance ,useSlots, onMounted,computed,watch } from 'vue'
// import { Plus, Search, Delete, Edit } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
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
const slots=useSlots()
const props = defineProps(propsConfig)
//获取父组件传递的事件
const proxyProps = ref({
  onAdd:false,
  onUpdate:false,
  onDetail:false,
  onRemove:false,
  'onUpdate:showSearch':false,
})
onMounted(() => {
  const internal = getCurrentInstance()
  const onEmit=(internal?.vnode.props || {}) as Record<string, any>
  for(const emit in onEmit){
    proxyProps.value[emit]=typeof onEmit[emit]=== 'function'
  }
})

const loading = ref<boolean>(true)
const showSearchInner = ref(true)
const showSearch = computed({
  get() {
    return showSearchInner.value
  },
  set(value) {
    showSearchInner.value = value
    if (proxyProps.value[`onUpdate:showSearch`]) emits('update:showSearch', showSearchInner.value)
  },
})
//搜索条件
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
const emits = defineEmits(['query', 'add', 'update', 'detail', 'remove', 'update:showSearch'])

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
const totalInner = ref<Number>(0)
const dataListInner = ref([])
const totalComputed = computed({
  get: () => {
    return props.total || totalInner.value
  },
  set: (val: number) => {
    totalInner.value = val
  },
})
const dataListComputed = computed({
  get: () => {
    return props.dataList || dataListInner.value
  },
  set: (val) => {
    dataListInner.value = val
  },
})
const startQuery = () => {
  loading.value = true
}
const handleQuery = (isFirst: boolean = false) => {
  loading.value = true
  if (typeof isFirst === 'boolean' && isFirst) {
    queryParams.value.pageNum = 1
  }

  if (!props.dataListFun) {
    emits('query', queryParams.value)
  } else {
    props.dataListFun(queryParams.value, (datas, total) => {
      dataListComputed.value = datas
      totalComputed.value = total
      loading.value = false
    })
  }
}
const handleAdd = () => {
  emits('add')
}
const handleUpdate = (row: dataItemType) => {
  emits('update', row)
}
const operationLoading = ref(false)
const handleRemove = (row: dataItemType) => {
  // proxy?.$modal.confirm(props.removeMessage).then((res) => {
  operationLoading.value = true
  ElMessageBox.confirm(props.removeMessage, 'warning', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    title: props.removeMessageTitle,
    type: 'warning',
  })
    .then(() => {
      emits('remove', row, (flag = true) => {
        if (flag) {
          ElMessage({
            message: props.message,
            grouping: true,
            duration: props.duration,
            type: 'success',
            showClose: props.duration! > 0,
            onClose: () => {
              operationLoading.value = false
              // cancelFun()
            },
          })
        } else {
          operationLoading.value = false
        }
      })
    })
    .catch(() => {
      operationLoading.value = false
    })

  // });
}
const handleDetail = (row: dataItemType) => {
  emits('detail', row)
}
defineExpose({
  startQuery,
  query: handleQuery,
  slots,
})
</script>

<style scoped>
</style>

