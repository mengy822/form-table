import  type {button} from "../../js/sizeType";

export interface radioGroupType {
  textColor?: string;//	当按钮为活跃状态时的字体颜色	#ffffff
  fill?: string;//	当按钮为活跃状态时的边框和背景颜色	#409eff
  validateEvent?: boolean;//	是否触发表单验证	true
  options: Array<{ label: string, value: string | number ,
    disabled?: boolean;//	是否禁用
  }>|number;
  config?: radioButtonType | radioType
  change?: (value: string | number | boolean) => void;//当绑定值变化时触发的事件
}

export interface radioButtonType {
  value?: string | number;//单选框的值
  label?: string;//	单选框的 label
  disabled?:boolean;//禁用
  name?: string;//	原生 name 属性
}

export interface radioType {
  change?: (value: string | number | boolean) => void;//当绑定值变化时触发的事件
  value?: string | number;//单选框的值
  label?: string;//	单选框的 label
  disabled?:boolean;//禁用
  border?: boolean;//	是否显示边框
  size?: button;//	Checkbox 的尺寸
  name?: string;//	原生 name 属性
}
