<script setup lang="ts">
import { MyTabel, MyForm, MyEdit, MyDetail } from './views/package/index'

import type {
  checkboxInnerType,
  dateInnerType,
  inputInnerType,
  radioInnerType,
  selectInnerType,
  switchInnerType,
} from './views/package/index'
import { ref, onMounted, computed } from 'vue'

const data = ref([])
const searchList = ref<(inputInnerType | selectInnerType | dateInnerType)[]>([])
onMounted(() => {
  searchList.value.push({
    isRequired: true,
    prop: 'inputNumber',
    label: 'number',
    max: 10,
    type: 'input',
    inputType: 'number',
    span: 5,
  } as inputInnerType)
  searchList.value.push({ isRequired: true, prop: 'input', label: 'input', type: 'input', span: 5 })
  searchList.value.push({
    prop: 'select',
    label: 'select',
    type: 'select',
    options: 10,
    multiple: true,
    span: 5,
  } as selectInnerType)

  searchList.value.push({
    prop: 'daterange',
    label: 'daterange',
    type: 'date',
    dateType: 'daterange',
    valueFormat: 'YYYY-MM-DD',
    format: 'YYYY-MM-DD',
    span: 8,
    aliases: 'start,end',
  } as dateInnerType)
 for(let i=0;i<1;i++){
  searchList.value.push({
    isRequired: true,
    prop: 'inputNumber'+i,
    label: 'number'+i,
    max: 10,
    type: 'input',
    inputType: 'number',
    span: 5,
  } as inputInnerType)
  searchList.value.push({ isRequired: true, prop: 'input'+i, label: 'input'+i, type: 'input', span: 5 })
  searchList.value.push({
    prop: 'select'+i,
    label: 'select'+i,
    type: 'select',
    options: 10,
    multiple: true,
    span: 5,
  } as selectInnerType)

  searchList.value.push({
    prop: 'daterange'+i,
    label: 'daterange'+i,
    type: 'date',
    dateType: 'daterange',
    valueFormat: 'YYYY-MM-DD',
    format: 'YYYY-MM-DD',
    span: 8,
    aliases: 'start'+i+',end'+i,
  } as dateInnerType)
 }
})
const detail = (e: unknown) => {
  console.log(e, '详情')
  detailRef.value.init(e)
}
const update = (e: any = {}) => {
  console.log(e, '修改')
  editRef.value.init({ ...e })
}
const remove = (e: unknown) => {
  console.log(e, '删除')
}
const dataForm = ref({
  inputNumber: '123',
  input: '456',
  select: '1,2,3',
  start: '2022-04-01',
  end: '2024-12-30',
})
const total = ref(0)
const query = (e: any) => {
  dataForm.value = { ...e }
  // dataForm.value.id2=e.id0
  console.log(e, '查询')
  request('/test', dataForm.value).then((res: any) => {
    console.log(res, 'res')
    total.value = res.total
    data.value = res.data
  })
}
const request = (
  url: string,
  data = {},
  config: { methods?: 'post' | 'get'; header?: any } = {}
) => {
  if (!config.methods) config.methods = 'post'
  if (!config.header) config.header = {}

  return new Promise((resolve, reject) => {
    fetch(`${url}`, {
      method: config.methods,
      body: JSON.stringify(data),
      headers: config.header,
    }).then((response) => {
      if (response.status === 200) {
        response.json().then((res) => {
          resolve(res)
        })
      } else {
        reject(response)
      }
    })
  })
}
const detailRef = ref()
const editRef = ref()

const table = ref([
  { prop: 'text', label: '文本输入框' },
  { prop: 'textarea', label: '文本域输入框' },
  { prop: 'password', label: '密码输入框' },
  { prop: 'number', label: '数字输入框' },
  { prop: 'year', label: '日期-年' },
  { prop: 'years', label: '日期-多年' },
  { prop: 'month', label: '日期-月' },
  { prop: 'date', label: '日期-日' },
  { prop: 'dates', label: '日期-多日', hidden: true, visible: false },
  { prop: 'datetime', label: '日期-天时间', hidden: true, visible: true },
  { prop: 'week', label: '日期-周', hidden: true, visible: false },
  {
    prop: 'datetimerange',
    label: '日期-多时间',
    hidden: true,
    visible: true,
    fun: (row: { [x: string]: string }, prop: any) => row['startDateTime'] + '/' + row['endDateTime'],
  },
  {
    prop: 'daterange',
    label: '日期-多天',
    hidden: true,
    visible: false,
    fun: (row: { [x: string]: string }, prop: any) => row['startDate'] + '/' + row['endDate'],
  },
  {
    prop: 'monthrange',
    label: '日期-多月',
    hidden: true,
    visible: true,
    fun: (row: { [x: string]: string }, prop: any) => row['startMouth'] + '/' + row['endMouth'],
  },
  { prop: 'switch', label: '开关', hidden: true, visible: false },
  { prop: 'checkboxNumber', label: '多选框数字', hidden: true, visible: true },
  { prop: 'radioNumber', label: '单选框数字', hidden: true, visible: false },
  { prop: 'selectNumber', label: '选择器数字', hidden: true, visible: true },
  { prop: 'checkbox', label: '多选框', hidden: true, visible: false },
  { prop: 'radio', label: '单选框', hidden: true, visible: true },
  { prop: 'select', label: '选择器', hidden: true, visible: false },
])
//'year' | 'years' | 'month' | 'date' | 'dates' | 'datetime' | 'week' | 'datetimerange' | 'daterange' | 'monthrange'
//'text' | 'textarea' | 'password' | 'number'
const editColumn = ref([
  {
    prop: 'text',
    label: '文本输入框',
    type: 'input',
    inputType: 'text',
    disabled:(data:any)=>data['number']%2===0,
    isRequired: true,
  } as inputInnerType,
  {
    prop: 'textarea',
    label: '文本域输入框',
    type: 'input',
    readonly:(data:any)=>data['number']%2===0,
    inputType: 'textarea',
  } as inputInnerType,
  {
    prop: 'password',
    label: '密码输入框',
    type: 'input',
    disabled:(data:any)=>data['number']%2!=0,
    inputType: 'password',
  } as inputInnerType,
  {
    prop: 'number',
    label: '数字输入框',
    type: 'input',
    readonly:(data:any)=>data['number']%2!==0,
    inputType: 'number',
  } as inputInnerType,
  {
    prop: 'year',
    label: '日期-年',
    type: 'date',
    dateType: 'year',
    valueFormat: 'YYYY',
  } as dateInnerType,
  {
    prop: 'years',
    label: '日期-多年',
    type: 'date',
    dateType: 'years',
    valueFormat: 'YYYY',
  } as dateInnerType,

  {
    prop: 'month',
    label: '日期-月',
    type: 'date',
    dateType: 'month',
    valueFormat: 'YYYY-MM',
  } as dateInnerType,
  {
    prop: 'date',
    label: '日期-日',
    type: 'date',
    dateType: 'date',
    valueFormat: 'YYYY-MM-DD',
    format: 'YYYY-MM-DD',
  } as dateInnerType,
  {
    prop: 'dates',
    label: '日期-多日',
    type: 'date',
    dateType: 'dates',
    valueFormat: 'YYYY-MM-DD',
    format: 'YYYY-MM-DD',
  } as dateInnerType,
  {
    prop: 'datetime',
    label: '日期-天时间',
    type: 'date',
    dateType: 'datetime',
    valueFormat: 'YYYY-MM-DD hh:mm:ss',
    format: 'YYYY-MM-DD hh:mm:ss',
  } as dateInnerType,
  {
    prop: 'week',
    label: '日期-周',
    type: 'date',
    dateType: 'week',
    valueFormat: 'YYYY-ww',
  } as dateInnerType,
  {
    prop: 'datetimerange',
    label: '日期-多时间',
    type: 'date',
    dateType: 'datetimerange',
    valueFormat: 'YYYY-MM-DD hh:mm:ss',
    format: 'YYYY-MM-DD hh:mm:ss',
    aliases: 'startDateTime,endDateTime',
  } as dateInnerType,
  {
    prop: 'daterange',
    label: '日期-多天',
    type: 'date',
    dateType: 'daterange',
    valueFormat: 'YYYY-MM-DD',
    format: 'YYYY-MM-DD',
    aliases: 'startDate,endDate',
  } as dateInnerType,
  {
    prop: 'monthrange',
    label: '日期-多月',
    type: 'date',
    dateType: 'monthrange',
    valueFormat: 'YYYY-MM',
    aliases: 'startMouth,endMouth',
  } as dateInnerType,
  {
    prop: 'switch',
    label: '开关',
    type: 'switch',
  } as switchInnerType,
  {
    prop: 'checkboxNumber',
    label: '多选框数字',
    type: 'checkbox',
    options: 10,
  } as checkboxInnerType,
  {
    prop: 'radioNumber',
    label: '单选框数字',
    type: 'radio',
    options: 10,
  } as radioInnerType,
  {
    prop: 'selectNumber',
    label: '选择器数字',
    type: 'select',
    options: 10,
  } as selectInnerType,
  {
    prop: 'selectNumberMultiple',
    label: '选择器数字多选',
    type: 'select',
    options: 10,
    multiple: true,
  } as selectInnerType,
  {
    prop: 'checkbox',
    label: '多选框',
    type: 'checkbox',
    options: [
      {
        label: 'a',
        value: 'a',
      },
      {
        label: 'b',
        value: 'b',
        disable: true,
      },
      {
        label: 'c',
        value: 'c',
      },
    ],
  } as checkboxInnerType,
  {
    prop: 'radio',
    label: '单选框',
    type: 'radio',
    options: [
      {
        label: 'a',
        value: 'a',
      },
      {
        label: 'b',
        value: 'b',
        disable: true,
      },
      {
        label: 'c',
        value: 'c',
      },
    ],
  } as radioInnerType,
  {
    prop: 'select',
    label: '选择器',
    type: 'select',
    options: [
      {
        label: 'a',
        value: 'a',
      },
      {
        label: 'b',
        value: 'b',
        disabled: true,
      },
      {
        label: 'c',
        value: 'c',
      },
    ],
  } as selectInnerType,
])
onMounted(() => {
  // console.log(
  //   JSON.stringify(
  //     editColumn.value.map((item, index) => {
  //       let data = {
  //         prop: item.prop,
  //         label: item.label,
  //       }
  //       if (index > 7) {
  //         data.hidden = true
  //         data.visible = index % 2 === 1
  //       }
  //       return data
  //     })
  //   )
  // )
})
const submitFun = (e = {}) => {
  console.log(e, '保存')
}

const showSearch=ref(true)
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
    <MyTabel
      :query-param="dataForm"
      :total="total"
      :table-column="table"
      :data-list="data"
      :max-height="'75vh'"
      :has-detail="(data:any)=>data['number']%2===0"
      :has-remove="true"
      :has-update="true"
      :has-add="true"
      v-model:showSearch="showSearch"
      @detail="detail"
      @update="update"
      @remove="remove"
      @add="update"
      @query="query"
    >
    </MyTabel>
    <MyEdit ref="editRef" :column="editColumn" @submit="submitFun"></MyEdit>
    <MyDetail des-column="3" ref="detailRef" :column="table"></MyDetail>
  </div>
</template>

<style scoped lang="scss">
</style>
