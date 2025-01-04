export interface switchType {
  loading?: boolean;//是否显示加载中	boolean false
  width?: string | number;//	switch 的宽度
  inlinePrompt?: boolean;//	无论图标或文本是否显示在点内，只会呈现文本的第一个字符	boolean false
  activeIcon?: string;//	switch 状态为 on 时所显示图标，设置此项会忽略 active-text
  inactiveIcon?: string;//switch 状态为 off 时所显示图标，设置此项会忽略 inactive-text
  activeActionIcon?: string;// 2.3.9	on状态下显示的图标组件
  inactiveActionIcon?: string;// 2.3.9	off状态下显示的图标组件
  activeText?: string;//	switch 打开时的文字描述
  inactiveText?: string;//	switch 的状态为 off 时的文字描述
  activeValue?: boolean | string | number;//	switch 状态为 on 时的值	 true
  inactiveValue?: boolean | string | number;//	switch的状态为 off 时的值	false
  name?: string;//switch 对应的 name 属性
  validateEvent?: boolean;//	是否触发表单验证	true
  beforeChange?: boolean | (() => Promise<boolean>);//	switch 状态改变前的钩子， 返回 false 或者返回 Promise 且被 reject 则停止切换
  id?: string;//	input 的 id
  tabindex?: string | number;//	input 的 tabindex
  change?: (val: boolean | string | number) => void
}
