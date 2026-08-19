import { dataItemType, ObjectType } from '../js/types'
import { tableColumnItem } from '../Table/types'

interface Item {
  desColumn?: string | number | null
  [key: string]: any
}

interface CssValueOptions {
  /** 根字体大小（用于 rem/em 转换），默认 16 */
  rootFontSize?: number
  /** 视口高度（用于 vh 转换），默认 1080 */
  viewportHeight?: number
  /** 视口宽度（用于 vw 转换），默认 1920 */
  viewportWidth?: number
}

class CssValueParser {
  private options: Required<CssValueOptions>

  constructor(options: CssValueOptions = {}) {
    this.options = {
      rootFontSize: options.rootFontSize ?? 16,
      viewportHeight: options.viewportHeight ?? 1080,
      viewportWidth: options.viewportWidth ?? 1920,
    }
  }

  /**
   * 解析 CSS 值为数字（用于比较）
   */
  parseToNumber(value: string | number | null | undefined): number | null {
    if (value === null || value === undefined) return null

    if (typeof value === 'number') {
      return isNaN(value) ? null : value
    }

    if (typeof value === 'string') {
      const trimmed = value.trim().toLowerCase()

      // 匹配数字和单位
      const match = trimmed.match(/^([+-]?\d*\.?\d+)(px|rem|em|%|vh|vw|vmin|vmax)?$/i)

      if (!match) {
        const num = parseFloat(trimmed)
        return isNaN(num) ? null : num
      }

      const num = parseFloat(match[1])
      const unit = match[2] || 'px'

      return this.convertByUnit(num, unit)
    }

    return null
  }

  /**
   * 根据单位转换数值（用于比较）
   */
  private convertByUnit(value: number, unit: string): number {
    switch (unit) {
      case 'px':
        return value
      case 'rem':
      case 'em':
        return value * this.options.rootFontSize
      case 'vh':
        return (value * this.options.viewportHeight) / 100
      case 'vw':
        return (value * this.options.viewportWidth) / 100
      case 'vmin':
        const vmin = Math.min(this.options.viewportWidth, this.options.viewportHeight)
        return (value * vmin) / 100
      case 'vmax':
        const vmax = Math.max(this.options.viewportWidth, this.options.viewportHeight)
        return (value * vmax) / 100
      case '%':
        return value
      default:
        return value
    }
  }
}

/**
 * 获取最大值（返回原始 CSS 值）
 * @param items 数据列表
 * @param defaultValue 默认值（当没有有效值时返回）
 * @param parserOptions 解析选项
 * @returns 最大值对应的原始 CSS 值
 */
export function getMaxDesColumn(
  items: Item[] | null | undefined,
  defaultValue: string | number = 0,
  parserOptions?: CssValueOptions,
): string | number {
  if (!items || items.length === 0) {
    return defaultValue
  }

  const parser = new CssValueParser(parserOptions)

  let maxNumber: number | null = null
  let maxRawValue: string | number | null = null

  for (const item of items) {
    const rawValue = item.desColumn
    if (rawValue === null || rawValue === undefined) continue

    const numericValue = parser.parseToNumber(rawValue)

    if (numericValue !== null) {
      if (maxNumber === null || numericValue > maxNumber) {
        maxNumber = numericValue
        maxRawValue = rawValue
      }
    }
  }

  return maxRawValue !== null ? maxRawValue : defaultValue
}

export function formatNumber(num: number, precision: number) {
  // 如果是整数
  if (Number.isInteger(precision)) {
    return num.toFixed(precision)
  }

  const parts = precision.toString().split('.')
  let integerPart = parseInt(parts[0])
  const decimalPart = parts[1] || ''

  // 🔥 关键修改：将小数部分按字符串长度和值重新解析
  // '2' → 2
  // '20' → 20
  // '02' → 20（前导0占1位，值是2 → 2 * 10^1 = 20）
  let digits
  if (decimalPart.length > 0) {
    // 去掉前导0后的值
    const nonZeroMatch = decimalPart.match(/[1-9]\d*$/)
    if (nonZeroMatch) {
      const value = parseInt(nonZeroMatch[0])
      const zeroCount = decimalPart.length - nonZeroMatch[0].length
      // 如果有前导0，值乘以10的zeroCount次方
      digits = value * Math.pow(10, zeroCount)
    } else {
      // 全是0的情况（如 0.00），默认保留2位
      digits = 2
    }
  } else {
    digits = 2
  }

  if (integerPart === 0) {
    integerPart = 1
  }

  let result

  // 正数：乘以；负数：除以
  if (integerPart > 0) {
    result = num * integerPart // 正数 → 乘法
  } else {
    result = num / Math.abs(integerPart) // 负数 → 除法
  }

  return result.toFixed(Math.min(digits, 100))
}
export const formatDisplayContent = (data: {
  value: string | number | boolean | ObjectType | undefined
  decimalPlaces: undefined | number
  defaultBlock: string
  unit?:
    | string
    | ((
        row: dataItemType,
        prop: string,
        other?: {
          index?: number
          tableColumnFinal?: tableColumnItem[]
          [key: string]: any
        },
      ) => string)
  rowData: any
  other?: any
  prop: any
}) => {
  let content = String(
    typeof data.value === 'number' && typeof data.decimalPlaces === 'number'
      ? formatNumber(data.value, data.decimalPlaces)
      : (data.value ?? data.defaultBlock),
  )

  const unit =
    typeof data.unit === 'string'
      ? data.unit
      : ((data.unit && data.unit(data.rowData, (data.prop || '').trim(), data.other ?? {})) ?? '')

  if (content !== data.defaultBlock && unit) {
    content = content + unit
  }
  return content
}
