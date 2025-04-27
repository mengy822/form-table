<script setup lang="tsx">
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
  for (let i = 0; i < 1; i++) {
    searchList.value.push({
      // isRequired: true,
      prop: 'inputNumber' + i,
      label: 'number' + i,
      max: 10,
      type: 'input',
      inputType: 'number',
      span: 5,
    } as inputInnerType)
    searchList.value.push({
      // isRequired: true,
      prop: 'input' + i,
      label: 'input' + i,
      type: 'input',
      span: 5,
    })
    searchList.value.push({
      prop: 'select' + i,
      label: 'select' + i,
      type: 'select',
      options: 10,
      multiple: true,
      span: 5,
    } as selectInnerType)

    searchList.value.push({
      prop: 'daterange' + i,
      label: 'daterange' + i,
      type: 'date',
      dateType: 'daterange',
      valueFormat: 'YYYY-MM-DD',
      format: 'YYYY-MM-DD',
      span: 8,
      aliases: 'start' + i + ',end' + i,
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
  data1 = {},
  config: { methods?: 'post' | 'get'; header?: any } = {}
) => {
  if (!config.methods) config.methods = 'post'
  if (!config.header) config.header = {}

  return new Promise((resolve, reject) => {
    let params = { ...data1 }
    let inputNumber = Number(params?.inputNumber || '0')
    let pageNum = params?.pageNum || 1
    let pageSize = params?.pageSize || 10
    let data = []
    let max = inputNumber > pageNum * pageSize ? pageSize : inputNumber - (pageNum - 1) * pageSize
    function randomFrom(min, max, zero = false): number {
      let num = String(Math.floor(Math.random() * (max - min + 1) + min))
      if (zero) {
        num = (Number(num) < 10 ? '0' : '') + num
      }
      return Number(num)
    }
    function padLeftZero(str) {
      return ('00' + str).substr(str.length)
    }
    function formatDate(date, fmt = 'yyyy-MM-dd hh:mm:ss') {
      if (date instanceof Date == false) date = new Date(date)
      if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
      }
      let o = {
        'M+': date.getMonth() + 1,
        'd+': date.getDate(),
        'h+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds(),
      }
      for (let k in o) {
        if (new RegExp(`(${k})`).test(fmt)) {
          let str = o[k] + ''
          fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? str : padLeftZero(str))
        }
      }
      return fmt
    }
    //1字符串 2数字 3年 4两个年 5月 6天 7两个天 8周 9时间范围 10天范围
    let key = {
      text: { type: 1, fun: () => Math.random().toString(16) },
      textarea: { type: 1, fun: () => Math.random().toString(16) },
      password: { type: 1, fun: () => Math.random().toString(16) },
      number: { type: 2, fun: () => randomFrom(0, 100) },
      year: { type: 3, fun: () => randomFrom(1970, 2025) },
      years: { type: 3, fun: () => `${randomFrom(1970, 2025)},${randomFrom(1970, 2025)}` },
      month: { type: 3, fun: () => `${randomFrom(1970, 2025)}-${randomFrom(1, 12, true)}` },
      date: {
        type: 3,
        fun: () =>
          `${randomFrom(1970, 2025, true)}-${randomFrom(1, 12, true)}-${randomFrom(1, 28, true)}`,
      },
      dates: {
        type: 3,
        fun: () =>
          `${randomFrom(1970, 2025)}-${randomFrom(1, 12, true)}-${randomFrom(
            1,
            28,
            true
          )},${randomFrom(1970, 2025)}-${randomFrom(1, 12, true)}-${randomFrom(1, 28, true)}`,
      },
      datetime: { type: 3, fun: () => formatDate(randomFrom(1700000000000, 2000000000000)) },
      week: { type: 3, fun: () => `${randomFrom(1970, 2025)}-${randomFrom(1, 54, true)}` },
      startDateTime: { type: 3, fun: () => formatDate(randomFrom(1700000000000, 2000000000000)) },
      endDateTime: { type: 3, fun: () => formatDate(randomFrom(1700000000000, 2000000000000)) },
      startDate: {
        type: 3,
        fun: () => formatDate(randomFrom(1700000000000, 2000000000000), 'yyyy-MM-dd'),
      },
      endDate: {
        type: 3,
        fun: () => formatDate(randomFrom(1700000000000, 2000000000000), 'yyyy-MM-dd'),
      },
      startMouth: {
        type: 3,
        fun: () => formatDate(randomFrom(1700000000000, 2000000000000), 'yyyy-MM'),
      },
      endMouth: {
        type: 3,
        fun: () => formatDate(randomFrom(1700000000000, 2000000000000), 'yyyy-MM'),
      },
      switch: { type: 3, fun: () => randomFrom(0, 100) % 2 === 1 },
      checkboxNumber: { type: 3, fun: () => randomFrom(0, 9) },
      radioNumber: { type: 3, fun: () => randomFrom(0, 9) },
      selectNumber: { type: 3, fun: () => randomFrom(0, 9) },
      selectNumberMultiple: { type: 3, fun: () => `${randomFrom(0, 4)},${randomFrom(0, 4)}` },
      checkbox: { type: 3, fun: () => 'a' },
      radio: { type: 3, fun: () => 'a' },
      select: { type: 3, fun: () => 'a' },
    }
    for (let i = 0; i < max; i++) {
      let item = {}
      for (let j of Object.keys(key)) {
        item[j] = key[j].fun()
      }
      data.push(item)
    }

    return resolve({
      code: 200,
      msg: 'succ',
      total: inputNumber,
      data: data,
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
    fun: (row: { [x: string]: string }, prop: any) =>
      row['startDateTime'] + '/' + row['endDateTime'],
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
  { prop: 'switch', label: '开关', hidden: true, visible: !false ,fun:(row,prop)=>row[prop]?'开启':'关闭',},
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
    isRequired: true,
  } as inputInnerType,
  {
    prop: 'textarea',
    label: '文本域输入框',
    type: 'input',
    inputType: 'textarea',
  } as inputInnerType,
  {
    prop: 'password',
    label: '密码输入框',
    type: 'input',
    disabled: (data: any) => data['number'] % 2 == 0,
    inputType: 'password',
  } as inputInnerType,
  {
    prop: 'number',
    label: '数字输入框',
    type: 'input',
    readonly: (data: any) => data['number'] % 2 == 0,
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

const submitFun = (e: (typeof editColumn.value)[number]['prop'], callback: Function) => {
  console.log(e, '保存')
  setTimeout(() => {
    callback()
  }, 2 * 1000)
}

const showSearch = ref(true)
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
      base-class=".app1"
      max-height="65vh"
      :has-detail="(data) => data['number'] % 2 === 0"
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
.app1 {
  height: calc(100vh - 8px * 2);
}
</style>
