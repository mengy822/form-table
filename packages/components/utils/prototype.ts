// src/utils/prototype.ts
import { parseTime } from '../../components/js/utils'

export function extendPrototypes() {
  String.prototype.formatDate = function (fmt: string) {
    const date = new Date(this as string)
    return date.format(fmt)
  }

  Date.prototype.format = function (fmt: string) {
    return parseTime(this, fmt)
  }
}
