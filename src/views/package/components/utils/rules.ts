import type { FormRules } from "element-plus"
import type { inputInnerType, switchInnerType, checkboxInnerType, radioInnerType, selectInnerType, dateInnerType } from "../components/form/types"
type trigger='blur'|'change'
type ruleType='string'|//: Must be of type string. This is the default type.
'number'|//: Must be of type number.
'boolean'|//: Must be of type boolean.
'method'|//: Must be of type function.
'regexp'|//: Must be an instance of RegExp or a string that does not generate an exception when creating a new RegExp.
'integer'|//: Must be of type number and an integer.
'float'|//: Must be of type number and a floating point number.
'array'|//: Must be an array as determined by Array.isArray.
'object'|//: Must be of type object and not Array.isArray.
'enum'|//: Value must exist in the enum.
'date'|//: Value must be valid as determined by Date
'url'|//: Must be of type url.
'hex'|//: Must be of type hex.
'email'|//: Must be of type email.
'any'//: Can be any type.
type requiredType={ trigger: trigger, type?: ruleType } & ({ required: boolean, message: string } | { pattern: string, message: string } | { validator: ((rule: any, value: any, callback: any) => void)|undefined })

// 表单验证
export function formRules(type: string, maxlength: number, min: number, max: number): any {
  let validNumPass = (rule: any, value: string, callback: (arg0: Error | undefined) => void) => {
    if (!parseFloat(value)) {
      callback(new Error('请输入正整数或两位小数'))
    } else if (value.indexOf('.') > -1) {
      let reg = new RegExp('/^(?!0+(?:.0+)?$)(?:[1-9]\d*|0)(?:.\d{1,2})?$/')
      if (!reg.test(parseFloat(value))) {
        callback(new Error('请保留两位小数'))
      } else {
        callback()
      }
    }
  }
  let validIp = (rule: any, value: string, callback: (arg0: Error | undefined) => void) => {
    let arr = []
    if (value) {
      value = value.trim()
      if (value.slice(value.length - 1, value.length) === ',' || value.slice(value.length - 1, value.length) === '，') {
        callback(new Error('输入的IP末尾不应是逗号'))
      } else {
        value = value.replace(/[\uff0c]/g, ',')
        if (value.indexOf(',') > -1) {
          arr = JSON.parse(JSON.stringify(value)).split(',')
        } else if (value.indexOf('，') > -1) {
          // arr = JSON.parse(JSON.stringify(value)).split('，')
          callback(new Error('请用英文逗号隔开'))
        } else {
          arr = [JSON.parse(JSON.stringify(value))]
        }
      }
      if ((new Set(arr)).size !== arr.length) {
        callback(new Error('输入的IP有重复值'))
      }
      let List: boolean[] = []
      // let pattern = /((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}/g
      let pattern = /^(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])$/
      arr.forEach((item: string) => {
        let flag = pattern.test(item)
        List.push(flag)
        if (!flag) {
          callback(new Error('输入的IP格式不正确'))
        }
      })
      if (List.indexOf(false) === -1) {
        callback()
      }
    } else {
      callback()
    }
  }
  let validExtCellEmun = (rule: any, value: string, callback: (arg0: Error | undefined) => void) => {
    let arr = []
    if (value) {
      value = value.trim()
      if (value.slice(value.length - 1, value.length) === ',' || value.slice(value.length - 1, value.length) === '，') {
        callback(new Error('拓展枚举不符合输入规则'))
      } else {
        value = value.replace(/[\uff0c]/g, ',')
        if (value.indexOf(',') > -1) {
          arr = JSON.parse(JSON.stringify(value)).split(',')
        } else {
          arr = [JSON.parse(JSON.stringify(value))]
        }
        if ((new Set(arr)).size !== arr.length) {
          callback(new Error('输入的扩展枚举有重复值'))
        } else {
          callback()
        }
      }
    } else {
      callback()
    }
  }
  let rule:{[key:string]:requiredType[]} = {
    // 1. 必填
    // 必填(自动生成字符串)
    notEmpty: [
      { required: true, message: '不能为空' },
      { pattern: /^(?!(\s+$))/, message: '输入的值不能只有空格', trigger: 'blur' }
    ],
    // 字符串
    strRequired: [
      { required: true, message: '不能为空', trigger: 'blur' },
      { max: maxlength, message: `最多可输入${maxlength}个字符`, trigger: 'blur' },
      { pattern: /^(?!(\s+$))/, message: '输入的值不能只有空格', trigger: 'blur' }
    ],
    strNoSpace: [
      // { required: true, message: '不能为空', trigger: 'blur'},
      { max: maxlength, message: `最多可输入${maxlength}个字符`, trigger: 'blur' },
      { pattern: /^(?!(\s+$))/, message: '输入的值不能只有空格', trigger: 'blur' }
    ],
    // 数字--正整数
    numberRequired: [
      { required: true, message: '不能为空' },
      // { type: 'number', message: `正整数`},
      { pattern: /^[1-9][0-9]*|0\.\d*[1-9]\d*$/, message: '必须大于0', trigger: 'blur' }
    ],
    // 数字--正整数---最大长度10
    numberLengthRequired: [
      { required: true, message: '不能为空', trigger: 'blur' },
      { type: 'number', message: `正整数, 且数字长度不超过${maxlength}`, trigger: 'blur' },
      { pattern: /^[1-9]+[0-9]*$/, message: '正整数, 不包含0', trigger: 'blur' }
    ],
    // 数字--不超过max
    maxLengthRequired: [
      { required: true, message: '不能为空' },
      { type: 'number', message: `正整数, 且数字长度不超过${maxlength}`, trigger: 'blur' },
      { type: 'number', message: `正整数, 且数值大小不超过${max}`, trigger: 'blur', max: max },
      { pattern: /^[1-9]+[0-9]*$/, message: '正整数, 不包含0', trigger: 'blur' }
    ],
    // 数字--整数---包含0F
    numberZeroRequired: [
      { required: true, message: '不能为空' },
      { type: 'number', message: `非负整数, 且数字长度不超过${maxlength}`, trigger: 'blur' },
      { pattern: /^([1-9]\d*|[0]{1,1})$/, message: '请输入非负整数', trigger: 'blur' }
    ],
    numZeroRequired: [ // 数字--正整数---包含0
      { required: true, message: '不能为空' },
      // { type: 'number', message: `非整数或0, 且数字长度不超过${maxlength}`, trigger: 'blur' },
      { pattern: /^([1-9]\d*|[0]{1,1})$/, message: `0或正整数, 且数字长度不超过${maxlength}`, trigger: 'blur' }
    ],
    // 正整数，0-10之间
    numberRequiredMinMax: [
      { required: true, message: '不能为空' },
      { type: 'number', message: `正整数, 且数值在${min}到${max}之间`, min: min, max: max }
    ],
    selects: [ // 下拉框 多选
      { type: 'array', required: true, message: '请选择', trigger: 'blur' }
    ],
    cellPhone: [ // 输入框 手机号
      { required: true, message: '不能为空', trigger: 'blur' },
      { pattern: /^1(3[0-9]|4[5,7]|5[0,1,2,3,5,6,7,8,9]|6[2,5,6,7]|7[0,1,7,8]|8[0-9]|9[1,8,9])\d{8}$/, message: '请输入正确的手机号', trigger: 'blur' }
    ],
    idNo: [ // 输入框 身份证
      { required: true, message: '身份证号码不能为空', trigger: 'blur' },
      { pattern: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/, message: '请输入正确的身份证号', trigger: 'blur' }
    ],
    intRequired: [ // 正整数负整数0
      { required: true, message: '不能为空' },
      // { type: 'number', message: `非整数或0, 且数字长度不超过${maxlength}`, trigger: 'blur' },
      { pattern: /^-?([1-9]\d*|[0]{1,1})$/, message: '请输入整数或0', trigger: 'blur' }
    ],

    // 2. 非必填
    // 字符串
    str: [
      { max: maxlength, message: `最多可输入${maxlength}个字符`, trigger: 'blur' },
      { pattern: /^(?!(\s+$))/, message: '输入的值不能只有空格', trigger: 'blur' }
    ],
    // 数字--正整数
    number: [
      { type: 'number', message: `请输入正整数` },
      { pattern: /^[1-9]+[0-9]*$/, message: '请输入正整数, 不包含0', trigger: 'blur' }
    ],
    numberZero: [
      { pattern: /^([1-9]\d*|[0]{1,1})$/, message: '请输入非负整数', trigger: 'blur' }
    ],
    // 数字--小数两位
    decimal: [
      // { pattern: /^(?!0+(?:.0+)?$)(?:[1-9]\d*|0)(?:.\d{1,2})?$/, message: `非负数, 最多两位小数`}
      { pattern: new RegExp(`/^[1-9]+\d*(\.\d{1,${max}})?$|^(0|0\.\d{1,${max}})?$/`), message: `非负数, 最多${max}位小数` }
    ],
    //   decimals1: [
    //     { validator: validNumPass, trigger: 'blur'}
    //   ],
    ruleIp: [ // 校验设备IP
      { validator: validIp, trigger: 'blur' }
      // { validator: validateIP, trigger: 'blur'}
    ],
    ruleExtCellEmun: [ // 校验拓展枚举
      { validator: validExtCellEmun, trigger: 'blur' }
    ],
    // 数字--不超过max
    maxLengthMax: [
      { type: 'number', message: `正整数, 且数字长度不超过${maxlength}`, trigger: 'blur' },
      { type: 'number', message: `正整数, 且数值大小不超过${max}`, trigger: 'blur', max: max },
      { pattern: /^[1-9]+[0-9]*$/, message: '正整数, 不包含0', trigger: 'blur' }
    ],
    // 正整数，最大长度
    numberLength: [
      // { type: 'number', message: `必须为正整数,且数字长度不超过${maxlength}`, trigger: 'blur'},
      { pattern: /^[1-9]+[0-9]*$/, message: '正整数, 不包含0', trigger: 'blur' }
    ],
    // 正整数，0-10之间
    numberMinMax: [
      { type: 'number', message: `正整数, 且数值在0到10之间`, min: min, max: max }
    ],
    // 密码设置
    password: [
      { required: true, message: '不能为空', trigger: 'blur' },
      { pattern: /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[~!@#$%^&*()_+`\-={}:";'<>,.\/]).{8,16}$/, message: `密码必须为长度8-16位，且为字母、数字和非空格特殊字符的混合组合`, trigger: 'blur' }
    ]
  }
  return rule[type]
}


export function createRules(column: (inputInnerType
  | switchInnerType
  | checkboxInnerType
  | radioInnerType
  | selectInnerType
  | dateInnerType)[],notNeedChangeCheck:String[]=['input']): FormRules {
  let rules:{[key:string]:requiredType[]} = {}
  column.filter(item => item.isRequired).map(item => {
    let required: requiredType
    if (typeof item.isRequired === 'boolean') {
      rules[item.prop] = [
        {
          required: true,
          message: item.label + '不能为空',
          trigger: 'blur',
        },
      ]
      required = {
        required: true,
        message: item.label + '不能为空',
        trigger: 'change',
      }
    } else if (typeof item.isRequired === 'string') {
      rules[item.prop] = [
        {
          required: true,
          message: item.label + '不能为空',
          trigger: 'blur',
          pattern: item.isRequired
        },
      ]
      required = {
        required: true,
        message: item.label + '不能为空',
        trigger: 'blur',
        pattern: item.isRequired
      }
    } else {
      rules[item.prop] = [
        {
          validator: item.isRequired,
          trigger: 'blur',
        },
      ]
      required = {
        validator: item.isRequired,
        trigger: 'change',
      }
    }
    if (notNeedChangeCheck.indexOf(item.type) === -1) {
      if (rules[item.prop] && Array.isArray(rules[item.prop]))
        rules[item.prop]?.push(required)
    }


  })


  return rules
}
