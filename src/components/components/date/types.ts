import {button} from "../../js/sizeType";

export interface dateType {

  startPlaceholder?: string;
  rangeSeparator?: string;
  endPlaceholder?: string;
  aliases?: string;
  readonly?: boolean;
  editable?: boolean;
  valueFormat?: string;
  format?: string;
  dateType?: EpPropMergeType<(new (...args: any[]) =>'year' | 'years'|'yearrange' | 'month' | 'date' | 'dates' | 'datetime' | 'week' | 'datetimerange' | 'daterange' | 'monthrange';
  change?: (val: any) => void;//用户确认选定的值时触发

  blur?: (e: FocusEvent) => void;//在组件 Input 失去焦点时触发

  focus?: (e: FocusEvent) => void;//在组件 Input 获得焦点时触发

  clear?: () => void;//2.7.7	可清空的模式下用户点击清空按钮时触发

  calendarChange?: (val: [Date, null | Date]) => void;//在日历所选日期更改时触发

  panelChange?: (date: Date | [Date, Date], mode: 'month' | 'year', view?: string) => void;//	当日期面板改变时触发。

  visibleChange?: (visibility: boolean) => void;//	当 DatePicker 的下拉列表出现/消失时触发
}
