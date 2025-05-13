<script setup lang="tsx">
import { MyTabel, MyForm, MyEdit, MyDetail } from './views/package/index'
import {table,editColumn,request,search} from './app'
import type {inputInnerType , selectInnerType , dateInnerType} from './app'

import { ref, onMounted, computed } from 'vue'
const tableRef=ref(null)
const data = ref([])
const searchList = ref<(inputInnerType | selectInnerType | dateInnerType)[]>(search)

const detail = (e: unknown) => {
  console.log(e, '详情')
  detailRef.value.init(e)
}
const update = (e: any = {}) => {
  console.log(e, '修改')
  editRef.value.init({ ...e })
}
const remove = (e: unknown, cb) => {
  console.log(e, '删除')
  setTimeout(() => {
    cb()
  }, 1000)
}
const dataForm = ref({
  inputNumber: '123',
  input: '456',
  select: '1,2,3',
  start: '2022-04-01',
  end: '2024-12-30',
  dates:'2024-12-30,2024-12-31',
  date:'2024-12-30',
})


const detailRef = ref()
const editRef = ref()


const submitFun = (e: (typeof editColumn)[number]['prop'], callback: Function) => {
  console.log(e, '保存')
  setTimeout(() => {
    callback()
  }, 2 * 1000)
}

const showSearch = ref(true)
const total = ref(0)
const query = (e: any) => {
  dataForm.value = { ...e }
  console.log(e, '查询')
  tableRef.value.query(true)
}
const tableQuery=(e:any,cb:((datas:any[],total:number)=>void))=>{
  // dataForm.value = { ...e }
  console.log(e, '表格查询')
  request('/test', e).then((res: any) => {
    // total.value = res.total
    // data.value = res.data
    cb(res.data,res.total)
  })
}
</script>

<template>
  <div v-if="true" class="app1">
    <MyForm
      :show-search="showSearch"
      :default-search="true"
      :search-value="dataForm"
      :search="searchList"
      @search="query"
    ></MyForm>
    <!-- <MyTabelV2 ref="tableRef" :columns="table"> </MyTabelV2> -->
    <MyTabel
      ref="tableRef"
      :query-param="dataForm"
      :table-column="table"
      :data-list-fun="tableQuery"
      max-height="65vh"
      :has-detail="(data) => data['number'] % 2 === 0"
      @detail="detail"
      @update="update"
      @remove="remove"
      @add="update"
      @query="query"
    >
      <template #switch="{ row, prop, fun }">
        <el-switch
          :model-value="fun(row, prop)"
          :active-value="'开启'"
          :inactive-value="'关闭'"
        ></el-switch>
      </template>
    </MyTabel>
    <MyEdit ref="editRef" :column="editColumn" @submit="submitFun"></MyEdit>
    <MyDetail des-column="3" ref="detailRef" :column="table"></MyDetail>
  </div>
</template>

<style scoped lang="scss">
.app1 {
  height: calc(100vh - 8px * 2);
}
</style>
