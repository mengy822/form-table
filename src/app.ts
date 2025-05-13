import type {
  checkboxInnerType,
  dateInnerType,
  inputInnerType,
  radioInnerType,
  selectInnerType,
  switchInnerType,
} from './views/package/index'

const editColumn = [
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
  // {
  //   prop: 'week',
  //   label: '日期-周',
  //   type: 'date',
  //   dateType: 'week',
  //   valueFormat: 'YYYY-ww',
  // } as dateInnerType,
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
]

const table = [
  { prop: 'no', label: 'no' ,hidden: true, visible: false },
  { prop: 'text',label: '文本输入框',list:[
    // { prop: 'text', label: '文本输入框1' },
    // { prop: 'text', label: '文本输入框2' }
  ] },
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
  { prop: 'switch', label: '开关', hidden: true, visible: !false ,fun:(row:any,prop:string)=>row[prop]?'开启':'关闭',},
  { prop: 'checkboxNumber', label: '多选框数字', hidden: true, visible: true },
  { prop: 'radioNumber', label: '单选框数字', hidden: true, visible: false },
  { prop: 'selectNumber', label: '选择器数字', hidden: true, visible: true },
  { prop: 'checkbox', label: '多选框', hidden: true, visible: false },
  { prop: 'radio', label: '单选框', hidden: true, visible: true },
  { prop: 'select', label: '选择器', hidden: true, visible: false },
]
const request = (
  url: string,
  data1 = {},
  config: { methods?: 'post' | 'get'; header?: any } = {}
) => {
  if (!config.methods) config.methods = 'post'
  if (!config.header) config.header = {}

  return new Promise((resolve, reject) => {
    let params = { ...data1 }
    //@ts-ignore
    let inputNumber = Number(params?.inputNumber || '0')
    //@ts-ignore
    let pageNum = params?.pageNum || 1
    //@ts-ignore
    let pageSize = params?.pageSize || 10
    let data = []
    let max = inputNumber > pageNum * pageSize ? pageSize : inputNumber - (pageNum - 1) * pageSize
    function randomFrom(min: number, max: number, zero = false): number {
      let num = String(Math.floor(Math.random() * (max - min + 1) + min))
      if (zero) {
        num = (Number(num) < 10 ? '0' : '') + num
      }
      return num
    }
    function padLeftZero(str:string) {
      return ('00' + str).substr(str.length)
    }
    function formatDate(date:Date|string|number, fmt = 'yyyy-MM-dd hh:mm:ss') {
      if (date instanceof Date == false) {
        const date1=date
        date = new Date(date)
        if(date=='Invalid Date'){
          date=new Date(Number(date1))
        }
      }
      if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
      }
      let o:{[key:string]:number} = {
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
    let key:{[key:string]:{type?:number,fun:Function}} = {
      text: { type: 1, fun: () => Math.random().toString(16) },
      textarea: { type: 1, fun: () => Math.random().toString(16) },
      password: { type: 1, fun: () => Math.random().toString(16) },
      number: { type: 2, fun: () => randomFrom(0, 100) },
      no: { fun: (index:number) => pageSize *pageNum+index-pageSize+1},
      year: { type: 3, fun: () => randomFrom(1970, 2025) },
      years: { type: 3, fun: () => `${randomFrom(1970, 2025)},${randomFrom(1970, 2025)}` },
      month: { type: 3, fun: () => `${formatDate(randomFrom(1700000000000, 2000000000000),'yyyy-MM')}` },
      date: {
        type: 3,
        fun: () =>
          `${formatDate(randomFrom(1700000000000, 2000000000000))}`,
      },
      dates: {
        type: 3,
        fun: () =>
          `${formatDate(randomFrom(1700000000000, 2000000000000))},${formatDate(randomFrom(1700000000000, 2000000000000))}`,
      },
      datetime: { type: 3, fun: () => formatDate(randomFrom(1700000000000, 2000000000000)) },
      week: { type: 3, fun: () => `${formatDate(randomFrom(1700000000000, 2000000000000),'yyyy-ww')}` },
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
      checkboxNumber: { type: 3, fun: () => `${randomFrom(0, 9)},${randomFrom(0, 9)}` },
      radioNumber: { type: 3, fun: () => randomFrom(0, 9) },
      selectNumber: { type: 3, fun: () => randomFrom(0, 9) },
      selectNumberMultiple: { type: 3, fun: () => `${randomFrom(0, 4)},${randomFrom(0, 4)}` },
      checkbox: { type: 3, fun: () => 'a,b' },
      radio: { type: 3, fun: () => 'a' },
      select: { type: 3, fun: () => 'a' },
    }
    for (let i = 0; i < max; i++) {
      let item: { [key: string]: Object } = {}
      for (let j of Object.keys(key)) {
        item[j] = key[j].fun(i)
      }
      data.push(item)
    }

    setTimeout(() => {
      return resolve({
        code: 200,
        msg: 'succ',
        total: inputNumber,
        data: data,
      })
    }, 10)
  })
}
const search: (inputInnerType | selectInnerType | dateInnerType)[] = [{
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
  } as dateInnerType,{
  isRequired: true,
  prop: 'inputNumber',
  label: 'number',
  max: 10,
  type: 'input',
  inputType: 'number',
  span: 5,
} as inputInnerType,{ isRequired: true, prop: 'input', label: 'input', type: 'input', span: 5 },
{
  prop: 'select',
  label: 'select',
  type: 'select',
  options: 10,
  multiple: true,
  span: 5,
} as selectInnerType,
{
  prop: 'daterange',
  label: 'daterange',
  type: 'date',
  dateType: 'daterange',
  valueFormat: 'YYYY-MM-DD',
  format: 'YYYY-MM-DD',
  span: 8,
  aliases: 'start,end',
} as dateInnerType,
]

for (let i = 0; i < 1; i++) {
  search.push({
    // isRequired: true,
    prop: 'inputNumber' + i,
    label: 'number' + i,
    max: 10,
    type: 'input',
    inputType: 'number',
    span: 5,
  } as inputInnerType)
  search.push({
    // isRequired: true,
    prop: 'input' + i,
    label: 'input' + i,
    type: 'input',
    span: 5,
  })
  search.push({
    prop: 'select' + i,
    label: 'select' + i,
    type: 'select',
    options: 10,
    multiple: true,
    span: 5,
  } as selectInnerType)

  search.push({
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
export {
  editColumn, table, request,search
};
export type {
  checkboxInnerType,
  dateInnerType,
  inputInnerType,
  radioInnerType,
  selectInnerType,
  switchInnerType
};

