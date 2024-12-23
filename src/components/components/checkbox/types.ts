import {button} from "../../js/sizeType";

export interface checkboxGroupType {


  min?: number;//	可被勾选的 checkbox 的最小数量	 number —
  max?: number;//	可被勾选的 checkbox 的最大数量	 number —
  textColor?: string;//	当按钮为活跃状态时的字体颜色	#ffffff
  fill?: string;//	当按钮为活跃状态时的边框和背景颜色	#409eff
  tag?: string;//	复选框组元素标签	 div
  validateEvent?: boolean;//	是否触发表单验证	true
  options: Array<{ label: string, value: string | number ,
    disabled?: boolean;//	是否禁用
  }>|number;
  config?: checkBoxButtonType | checkBoxType
  change?: (value: (string | number)[]) => void;//当绑定值变化时触发的事件
}

export interface checkBoxButtonType {
  change?: (value: string | number | boolean) => void;//当绑定值变化时触发的事件
  trueValue?: string | number;//选中时的值

  falseValue?: string | number;//	没有选中时的值
  disabled?:boolean;//	是否禁用
  size?: button;//	Checkbox 的尺寸
  name?: string;//	原生 name 属性
  checked?: boolean;//当前是否勾选
}

export interface checkBoxType {

  trueValue?: string | number;//	选中时的值

  falseValue?: string | number;//	没有选中时的值

  border?: boolean;//	是否显示边框
  size?: button;//	Checkbox 的尺寸
  name?: string;//	原生 name 属性
  disabled?:boolean;//	是否禁用
  checked?: boolean;//	当前是否勾选

  indeterminate?: boolean;//	设置不确定状态，仅负责样式控制

  validateEvent?: boolean;//	输入时是否触发表单的校验

  tabindex?: string | number;//输入框的 tabindex

  id?: string;//	input id

  ariaControls?: string;//
}
