import {button} from "../../js/sizeType";

export interface inputType {
  inputType?: 'text' | 'textarea' | 'password' | 'number';

  maxlength?: string | number;//	同原生 maxlength 属性
  minlength?: string | number;//	原生属性，最小输入长度

  showWordLimit?: boolean;//	是否显示统计字数, 只在 type 为 'text' 或 'textarea' 的时候生效	 false

  placeholder?: string;//	输入框占位文本


  showPassword?: boolean;//	是否显示切换密码图标

  disabled?: boolean;//是否禁用

  size?: button;//	输入框尺寸，只在 type 不为 'textarea' 时有效

  prefixIcon?: string;//	自定义前缀图标

  suffixIcon?: string;//自定义后缀图标

  rows?: number;//	输入框行数，仅 type 为 'textarea' 时有效

  autosize?: boolean | object;//	textarea 高度是否自适应，仅 type 为 'textarea' 时生效。 可以接受一个对象，比如: { minRows: 2, maxRows: 6 }

  autocomplete?: string;//	原生 autocomplete 属性	off

  name?: string;//等价于原生 input name 属性

  readonly?: boolean;//	原生 readonly 属性，是否只读	false


  max?: any;//原生 max 属性，设置最大值	—	—
  min?: any;//	原生属性，设置最小值	—	—
  step?: any;//原生属性，设置输入字段的合法数字间隔	—	—
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';//	控制是否能被用户缩放

  autofocus?: boolean;//	原生属性，自动获取焦点	false

  form?: string;//	原生属性	string	—

  validateEvent?: boolean;//	输入时是否触发表单的校验

  inputStyle?: string | object;

  blur?: (event: FocusEvent) => void;//	当选择器的输入框失去焦点时触发

  focus?: (event: FocusEvent) => void;//当选择器的输入框获得焦点时触发

  change?: (value: string | number) => void;//仅当 modelValue 改变时，当输入框失去焦点或用户按Enter时触发

  input?: (value: string | number) => void;//在 Input 值改变时触发

  clear?: () => void;//在点击由 clearable 属性生成的清空按钮时触发

}
