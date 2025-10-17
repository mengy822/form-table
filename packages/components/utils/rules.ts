import type { FormRules } from 'element-plus';
import type { checkboxInnerType, dateInnerType, inputInnerType, radioInnerType, selectInnerType, switchInnerType } from '../components/form/types';

type trigger = 'blur' | 'change';
type ruleType =
  | 'string' //: Must be of type string. This is the default type.
  | 'number' //: Must be of type number.
  | 'boolean' //: Must be of type boolean.
  | 'method' //: Must be of type function.
  | 'regexp' //: Must be an instance of RegExp or a string that does not generate an exception when creating a new RegExp.
  | 'integer' //: Must be of type number and an integer.
  | 'float' //: Must be of type number and a floating point number.
  | 'array' //: Must be an array as determined by Array.isArray.
  | 'object' //: Must be of type object and not Array.isArray.
  | 'enum' //: Value must exist in the enum.
  | 'date' //: Value must be valid as determined by Date
  | 'url' //: Must be of type url.
  | 'hex' //: Must be of type hex.
  | 'email' //: Must be of type email.
  | 'any'; //: Can be any type.
type requiredType = { trigger?: trigger; type?: ruleType } & (
  | { max?: number; min?: number }
  | {
    required: boolean;
    message: string;
  }
  | { pattern: string | RegExp; message: string }
  | { type: 'number' }
  | {
    validator: ((rule: any, value: any, callback: any) => void) | undefined;
  }
);

// 1. 先定义接口类型
interface RulesType {
  notEmpty: requiredType[];
  strRequired: requiredType[];
  strNoSpace: requiredType[];
  selects: requiredType[];
  phone: requiredType[];
  idNo: requiredType[];
  str: requiredType[];
  number: requiredType[];
  numberZero: requiredType[];
  numberAuto: requiredType[];
  decimal: requiredType[];
  ruleIp: requiredType[];
  ruleExtCellEmun: requiredType[];
  password: requiredType[];
}

let rules: RulesType = {
  // 1. 必填
  // 必填(自动生成字符串)
  notEmpty: [],
  // 字符串
  strRequired: [],
  strNoSpace: [],

  selects: [
    // 下拉框 多选
  ],
  phone: [
    // 输入框 手机号
  ],
  idNo: [
    // 输入框 身份证
  ],

  // 2. 非必填
  // 字符串
  str: [],
  // 数字--正整数
  number: [],
  numberZero: [],
  numberAuto: [],
  // 数字--小数两位
  decimal: [],
  ruleIp: [
    // 校验设备IP
  ],
  ruleExtCellEmun: [
    // 校验拓展枚举
  ],
  // 密码设置
  password: []
};
export type ruleKeys = keyof RulesType;
type MaybeNumber = number | undefined;

/**
 * 验证数字是否在指定范围内
 * @param value - 要验证的字符串
 * @param min - 最小值 (undefined表示不限制)
 * @param max - 最大值 (undefined表示不限制)
 * @param decimalPlaces - 允许的小数位数
 * @returns true表示验证通过，false表示失败
 */
function validateNumber(value: string, min: number | undefined, max: number | undefined, decimalPlaces: number = 0): boolean {
  // 1. 格式验证
  const regex = generateNumberRangeRegex(min, max, decimalPlaces);
  if (!regex.test(value)) {
    return false;
  }

  // 2. 范围验证
  const numberValue = parseFloat(value);

  // 处理边界情况 (例如 min 和 max 都为 0 的情况)
  const hasMin = min !== undefined;
  const hasMax = max !== undefined;
  if ((hasMin && hasMax && min === 0 && max === 0) || (!hasMin && !hasMax)) {
    return true; // 格式正确即可
  }

  // 执行范围比较
  let isValid = true;
  if (hasMin) {
    isValid &&= numberValue >= min!;
  }
  if (hasMax) {
    isValid &&= numberValue <= max!;
  }
  if (decimalPlaces === 0) {
    isValid &&= value.split('.').length === 1;
  } else {
    const xiaoshu = value.split('.')[1];
    isValid &&= xiaoshu && xiaoshu.length <= decimalPlaces;
  }
  return isValid;
}

function generateValidationMessage(min: MaybeNumber, max: MaybeNumber, decimalPlaces: number = 0): string {
  // 参数校验
  if (decimalPlaces < 0 || !Number.isInteger(decimalPlaces)) {
    throw new Error('decimalPlaces 必须是非负整数');
  }

  const hasMin = min !== undefined;
  const hasMax = max !== undefined;

  // 情况1: 不限制范围（两者都为0或都未提供）
  if ((hasMin && hasMax && min === 0 && max === 0) || (!hasMin && !hasMax)) {
    if (decimalPlaces === 0) {
      return '请输入有效的整数';
    }
    return `请输入有效的数字，最多保留 ${decimalPlaces} 位小数`;
  }

  // 情况2: 只限制最小值
  if (hasMin && !hasMax) {
    return generateMinOnlyMessage(min, decimalPlaces);
  }

  // 情况3: 只限制最大值
  if (!hasMin && hasMax) {
    return generateMaxOnlyMessage(max, decimalPlaces);
  }

  // 情况4: 正常范围限制
  if (min === undefined || max === undefined || min > max) {
    throw new Error('无效的 min/max 值');
  }
  return generateRangeMessage(min, max, decimalPlaces);
}

function generateMinOnlyMessage(min: number, decimalPlaces: number): string {
  const decimalPart = decimalPlaces > 0 ? `，最多保留 ${decimalPlaces} 位小数` : '';

  if (min < 0) {
    return `请输入大于或等于 ${min} 的数字${decimalPart}`;
  }

  if (min === 0) {
    return `请输入非负数字${decimalPart}`;
  }

  return `请输入大于或等于 ${min} 的数字${decimalPart}`;
}

function generateMaxOnlyMessage(max: number, decimalPlaces: number): string {
  const decimalPart = decimalPlaces > 0 ? `，最多保留 ${decimalPlaces} 位小数` : '';

  if (max < 0) {
    return `请输入小于或等于 ${max} 的数字${decimalPart}`;
  }

  if (max === 0) {
    return `请输入非正数字${decimalPart}`;
  }

  return `请输入小于或等于 ${max} 的数字${decimalPart}`;
}

function generateRangeMessage(min: number, max: number, decimalPlaces: number): string {
  const decimalPart = decimalPlaces > 0 ? `，最多保留 ${decimalPlaces} 位小数` : '';

  if (min === max) {
    return `请输入等于 ${min} 的数字${decimalPart}`;
  }

  return `请输入大于或等于 ${min} 且小于或等于 ${max} 的数字${decimalPart}`;
}

function generateNumberRangeRegex(min, max, decimalPlaces = 0) {
  // 处理参数缺失情况
  const hasMin = min !== undefined;
  const hasMax = max !== undefined;
  // 参数校验
  if (hasMin && hasMax && typeof min !== 'number' && typeof max !== 'number' && min > max) {
    throw new Error('无效的 min/max 值');
  }
  if (!Number.isInteger(decimalPlaces) || decimalPlaces < 0) {
    throw new Error('decimalPlaces 必须是非负整数');
  }

  // 情况1: 不限制范围（两者都为0或都未提供）
  if ((hasMin && hasMax && min === 0 && max === 0) || (!hasMin && !hasMax)) {
    if (decimalPlaces === 0) {
      return /^-?\d+$/;
    }
    return new RegExp(`^-?\\d+(\\.\\d{1,${decimalPlaces}})?$`);
  }

  // 情况2: 只限制最小值
  if (hasMin && !hasMax) {
    return generateMinOnlyRegex(min, decimalPlaces);
  }

  // 情况3: 只限制最大值
  if (!hasMin && hasMax) {
    return generateMaxOnlyRegex(max, decimalPlaces);
  }

  // 情况4: 正常范围限制
  return generateRangeRegex(min, max, decimalPlaces);
}

// 辅助函数：只限制最小值
function generateMinOnlyRegex(min, decimalPlaces) {
  const isInteger = decimalPlaces === 0;
  const minStr = isInteger ? String(Math.round(min)) : min.toFixed(decimalPlaces);

  if (min < 0) {
    // 负数最小值：匹配所有大于等于min的数
    const pattern = isInteger ? `^-?\\d+$` : `^-?\\d+(\\.\\d{1,${decimalPlaces}})?$`;
    return new RegExp(pattern);
  }

  // 非负数最小值
  const parts = [];
  const minInt = Math.floor(min);
  const minDec = min - minInt;

  // 匹配大于minInt的整数
  parts.push(`([${minInt + 1}-9]\\d*|0)`);

  // 匹配等于minInt但小数部分满足条件的数
  if (minDec > 0) {
    const minDecStr = minDec.toFixed(decimalPlaces).slice(2);
    parts.push(`${minInt}\\.([${minDecStr}-9]\\d{0,${decimalPlaces - 1}}|\\d{1,${decimalPlaces}})`);
  } else {
    parts.push(String(minInt));
  }

  return new RegExp(`^(${parts.map((item) => `[${item}]`).join('|')})$`);
}

// 辅助函数：只限制最大值
function generateMaxOnlyRegex(max, decimalPlaces) {
  const isInteger = decimalPlaces === 0;
  const maxStr = isInteger ? String(Math.round(max)) : max.toFixed(decimalPlaces);

  if (max < 0) {
    // 负数最大值：匹配所有负数
    const pattern = isInteger ? `^-\\d+$` : `^-\\d+(\\.\\d{1,${decimalPlaces}})?$`;
    return new RegExp(pattern);
  }

  // 非正数最大值
  const parts = [];
  const maxInt = Math.floor(max);
  const maxDec = max - maxInt;

  // 匹配负数
  parts.push(`-\\d+(\\.\\d{1,${decimalPlaces}})?`);

  // 匹配小于maxInt的非负数
  if (maxInt > 0) {
    parts.push(`[0-${maxInt - 1}]\\d*`);
  }

  // 匹配等于maxInt但小数部分满足条件的数
  if (maxDec > 0) {
    const maxDecStr = maxDec.toFixed(decimalPlaces).slice(2);
    parts.push(`${maxInt}\\.([0-${maxDecStr}]\\d{0,${decimalPlaces - 1}})?`);
  } else {
    parts.push(String(maxInt));
  }

  return new RegExp(`^(${parts.map((item) => `[${item}]`).join('|')})$`);
}

// 辅助函数：完整范围限制
function generateRangeRegex(min, max, decimalPlaces) {
  const factor = decimalPlaces ? Math.pow(10, decimalPlaces) : 1;
  const minScaled = Math.round(min * factor);
  const maxScaled = Math.round(max * factor);

  function rangeToRegex(start, end) {
    const parts = [];
    let current = start;
    while (current <= end) {
      if (current % 10 === 0) {
        let e = current;
        while (e + 1 <= end && (e + 1) % 10 === 0) e++;
        parts.push(current === e ? String(current) : `${current}-${e}`);
        current = e + 1;
      } else {
        const nextTen = Math.floor(current / 10) * 10 + 10;
        const e = Math.min(nextTen - 1, end);
        parts.push(current === e ? String(current) : `${current}-${e}`);
        current = e + 1;
      }
    }
    return parts.map((item) => `[${item}]`).join('|');
  }

  function handleDecimals() {
    const minInt = Math.floor(min);
    const maxInt = Math.floor(max);

    if (minInt === maxInt) {
      const minDec = Math.round((min - minInt) * factor);
      const maxDec = Math.round((max - maxInt) * factor);
      const dec = rangeToRegex(minDec, maxDec);
      return `${minInt}\\.(${dec})`;
    }

    const parts = [];
    const minDec = Math.round((min - minInt) * factor);
    if (minDec > 0) {
      parts.push(`${minInt}\\.(${rangeToRegex(minDec, factor - 1)})`);
    } else {
      parts.push(String(minInt));
    }

    if (maxInt - minInt > 1) {
      const ints = rangeToRegex(minInt + 1, maxInt - 1);
      parts.push(`(${ints})(\\.\\d{1,${decimalPlaces}})?`);
    }

    const maxDec = Math.round((max - maxInt) * factor);
    if (maxDec > 0) {
      parts.push(`${maxInt}\\.(${rangeToRegex(0, maxDec)})`);
    } else {
      parts.push(String(maxInt));
    }

    return parts.join('|');
  }

  let body;
  if (decimalPlaces === 0) {
    body = rangeToRegex(minScaled, maxScaled);
  } else {
    body = handleDecimals();
  }

  if (min < 0 && max >= 0) {
    return new RegExp(
      `^(-(${body.replace(
        new RegExp(`^${Math.abs(minScaled)}-${Math.abs(maxScaled)}`, 'g'),
        rangeToRegex(Math.abs(maxScaled), Math.abs(minScaled))
      )})|(${body}))$`
    );
  }

  return new RegExp(`^${body}$`);
}

// 表单验证
export function formRules(
  label: string,
  type: keyof RulesType | string,
  maxlength: number = undefined,
  min: number = undefined,
  max: number = undefined
): requiredType[] {
  const validIp = (rule: any, value: string, callback: (arg0: Error | undefined) => void) => {
    let arr = [];
    if (value) {
      value = value.trim();
      if (value.slice(value.length - 1, value.length) === ',' || value.slice(value.length - 1, value.length) === '，') {
        callback(new Error('输入的IP末尾不应是逗号'));
      } else {
        value = value.replace(/[\uff0c]/g, ',');
        if (value.indexOf(',') > -1) {
          arr = JSON.parse(JSON.stringify(value)).split(',');
        } else if (value.indexOf('，') > -1) {
          // arr = JSON.parse(JSON.stringify(value)).split('，')
          callback(new Error('请用英文逗号隔开'));
        } else {
          arr = [JSON.parse(JSON.stringify(value))];
        }
      }
      if (new Set(arr).size !== arr.length) {
        callback(new Error('输入的IP有重复值'));
      }
      const List: boolean[] = [];
      // let pattern = /((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}/g
      const pattern =
        /^(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])$/;
      arr.forEach((item: string) => {
        const flag = pattern.test(item);
        List.push(flag);
        if (!flag) {
          callback(new Error('输入的IP格式不正确'));
        }
      });
      if (List.indexOf(false) === -1) {
        callback(undefined);
      }
    } else {
      callback(undefined);
    }
  };
  const validNumberAuto = (rule: any, value: string, callback: (arg0: Error | undefined) => void) => {
    if (value) {
      if (isNaN(Number(value))) {
        callback(new Error('请输入数字'));
        return;
      }
      value = value.trim();
      const { max, min, maxlength } = rule;
      const message = generateValidationMessage(min, max, maxlength);
      if (validateNumber(value, min, max, maxlength)) callback();
      else {
        callback(new Error(message));
      }
    } else {
      callback(undefined);
    }
  };
  const validExtCellEmun = (rule: any, value: string, callback: (arg0: Error | undefined) => void) => {
    let arr = [];
    if (value) {
      value = value.trim();
      if (value.slice(value.length - 1, value.length) === ',') {
        callback(new Error('拓展枚举不符合输入规则'));
      } else {
        value = value.replace(/[\uff0c]/g, ',');
        if (value.indexOf(',') > -1) {
          arr = JSON.parse(JSON.stringify(value)).split(',');
        } else {
          arr = [JSON.parse(JSON.stringify(value))];
        }
        if (new Set(arr).size !== arr.length) {
          callback(new Error('输入的扩展枚举有重复值'));
        } else {
          callback(undefined);
        }
      }
    } else {
      callback(undefined);
    }
  };
  rules = {
    // 1. 必填
    // 必填(自动生成字符串)
    notEmpty: [
      { required: true, message: label + '不能为空' },
      { pattern: /^(?!(\s+$))/, message: '输入的值不能只有空格', trigger: 'blur' }
    ],
    // 字符串
    strRequired: [
      { required: true, message: label + '不能为空', trigger: 'blur' },
      { max: maxlength, message: `最多可输入${maxlength}个字符`, trigger: 'blur' },
      { pattern: /^(?!(\s+$))/, message: '输入的值不能只有空格', trigger: 'blur' }
    ],
    strNoSpace: [
      { required: true, message: label + '不能为空', trigger: 'blur' },
      { max: maxlength, message: `最多可输入${maxlength}个字符`, trigger: 'blur' },
      { pattern: /^(?!(\s+$))/, message: '输入的值不能只有空格', trigger: 'blur' }
    ],

    selects: [
      // 下拉框 多选
      { type: 'array', required: true, message: '请选择' + label, trigger: 'blur' }
    ],
    phone: [
      // 输入框 手机号
      { required: true, message: label + '不能为空', trigger: 'blur' },
      {
        pattern: /^1(3[0-9]|4[5,7]|5[0,1,2,3,5,6,7,8,9]|6[2,5,6,7]|7[0,1,7,8]|8[0-9]|9[1,8,9])\d{8}$/,
        message: '请输入正确的' + label,
        trigger: 'blur'
      }
    ],
    idNo: [
      // 输入框 身份证
      { required: true, message: label + '不能为空', trigger: 'blur' },
      {
        pattern: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
        message: '请输入正确的' + label,
        trigger: 'blur'
      }
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
    numberZero: [{ pattern: /^([1-9]\d*|[0]{1,1})$/, message: '请输入非负整数', trigger: 'blur' }],
    numberAuto: [
      // { type: 'number', message: `${generateValidationMessage(min, max, maxlength)}` },
      { validator: validNumberAuto, trigger: 'blur', required: true, min: min, max: max, maxlength: maxlength }
    ],
    // 数字--小数两位
    decimal: [
      {
        pattern: new RegExp(`/^[1-9]+\d*(\.\d{1,${max}})?$|^(0|0\.\d{1,${max}})?$/`),
        message: `非负数, 最多${max}位小数`
      }
    ],
    ruleIp: [
      // 校验设备IP
      { validator: validIp, trigger: 'blur' }
    ],
    ruleExtCellEmun: [
      // 校验拓展枚举
      { validator: validExtCellEmun, trigger: 'blur' }
    ],
    // 密码设置
    password: [
      { required: true, message: label + '不能为空', trigger: 'blur' },
      {
        pattern: new RegExp(`/^(?=.*[a-zA-Z])(?=.*\\d)(?=.*[~!@#$%^&*()_+\`\\-={}:";'<>,.\\/]).{${min},${max}}$/`),
        message: `密码必须为长度${min}-${max}位，且为字母、数字和非空格特殊字符的混合组合`,
        trigger: 'blur'
      }
    ]
  };
  let rule = rules[type];
  if (!rule) {
    rule = [
      { required: true, message: label + '不能为空', trigger: 'blur' },
      { pattern: new RegExp(type), message: `格式错误`, trigger: 'blur' }
    ];
  }
  return rule;
}

export function createRules(
  column: (inputInnerType | switchInnerType | checkboxInnerType | radioInnerType | selectInnerType | dateInnerType)[],
  notNeedChangeCheck: string[] = ['input']
): FormRules {
  const rules: { [key: string]: requiredType[] } = {};
  column
    .filter((item) => item.isRequired)
    .map((item) => {
      let required: requiredType;
      if (typeof item.isRequired === 'boolean') {
        rules[item.prop] = formRules(item.label, 'notEmpty');
        required = {
          required: true,
          message: item.label + '不能为空',
          trigger: 'change'
        };
      } else if (typeof item.isRequired === 'string') {
        if (item.isRequired === 'numberAuto') {
          rules[item.prop] = formRules(item.label, item.isRequired, item.maxlength, item.min, item.max);
        } else {
          rules[item.prop] = formRules(item.label, item.isRequired);
        }
        required = {
          required: true,
          message: item.label + '不能为空',
          trigger: 'change',
          pattern: item.isRequired
        };
      } else {
        rules[item.prop] = [
          {
            validator: item.isRequired,
            trigger: 'blur'
          }
        ];
        required = {
          validator: item.isRequired,
          trigger: 'change'
        };
      }
      if (notNeedChangeCheck.indexOf(item.type) === -1) {
        if (rules[item.prop] && Array.isArray(rules[item.prop])) rules[item.prop]?.push(required);
      }
      if (item.multiple) {
        rules[item.prop].push({
          required: true,
          message: item.label + '不能为空',
          trigger: 'blur',
          validator: (rule, value, callback) => {
            if (Array.isArray(value) && value.filter((item) => item).length === 0) {
              callback(new Error(item.label + '不能为空'));
              return;
            }
            callback();
          }
        });
      }
      rules[item.prop].push({ required: true, message: item.label + '不能为空', trigger: 'blur' });
    });
  return rules;
}
