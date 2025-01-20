import type { checkboxGroupType } from "../checkbox/types";
import type { dateType } from "../date/types";
import type { inputType } from "../input/types";
import type { radioGroupType } from "../radio/types";
import type { selectType } from "../select/types";
import type { switchType } from "../switch/types";
import type { button } from "../../js/sizeType";
interface columnType {
  prop: string; //model 的键名。 它可以是一个属性的值(如 a.b.0 或 ['a', 'b', '0'])。 在使用了 validate、resetFields 的方法时，该属性是必填的。
  label: string;
  labelPosition?: '' | 'left' | 'right' | 'top'; // 2.7.7	表单域标签的位置， 当设置为 left 或 right 时，则也需要设置 label-width 属性 默认会继承 Form的label-position
  labelWidth?: string | number; //标签宽度，例如 '50px'。 可以使用 auto。
  isForm?: boolean;
  isTable?: boolean;
  error?: string; //表单域验证错误时的提示信息。设置该值会导致表单验证状态变为 error，并显示该错误信息。
  showMessage?: boolean; //是否显示校验错误信息
  inlineMessage?: string | boolean; //	是否在行内显示校验信息
  type: 'input' | 'date' | 'radio' | 'select' | 'switch' | 'checkbox';
  span?: number;
  for?: string; //和原生标签相同能力
  readonly?: boolean;//只读
  validateStatus?: '' | 'error' | 'validating' | 'success'; //formitem 校验的状态
  isDefault?: boolean;//是否有默认选中
  isRequired?: boolean | ((rule: any, value: any, callback: any) => void);//是否必填
  size?: button;//	多选框组尺寸	 enum —
  disabled?: boolean;//	是否禁用	 boolean false
  clearable?: boolean;
  showFun?: (dataForm: any) => boolean;
}
export interface inputInnerType extends columnType, inputType { }
export interface selectInnerType extends columnType, selectType { }
export interface dateInnerType extends columnType, dateType { }
export interface checkboxInnerType extends columnType, checkboxGroupType { }
export interface radioInnerType extends columnType, radioGroupType { }
export interface switchInnerType extends columnType, switchType { }
