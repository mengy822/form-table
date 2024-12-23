export interface selectType {
  multiple?: boolean;//	是否多选	boolean false
  valueKey?: string;//	作为 value 唯一标识的键名，绑定值为对象类型时必填	string value
  collapseTags?: boolean;//	多选时是否将选中值按文字的形式展示	boolean false

  collapseTagsTooltip?: boolean;//	当鼠标悬停于折叠标签的文本时，是否显示所有选中的标签。 要使用此属性，collapse-tags属性必须设定为 true	 boolean false

  multipleLimit?: number;//multiple 属性设置为 true 时，代表多选场景下用户最多可以选择的项目数， 为 0 则不限制	number 0

  name?: string;//	Select 输入框的原生 name 属性

  effect?: 'dark' | 'light' | string;//	tooltip 主题，内置了 dark / light 两种	light


  autocomplete?: string;//	Select 输入框的原生 autocomplete 属性	off

  filterable?: boolean;//	Select 组件是否可筛选	boolean false

  allowCreate?: boolean;//	是否允许用户创建新条目， 只有当 filterable 设置为 true 时才会生效。	boolean false

  filterMethod?: () => void;//	自定义筛选方法

  remote?: boolean;//	其中的选项是否从服务器远程加载	 boolean false

  remoteMethod?: () => void;//	自定义远程搜索方法

  remoteShowSuffix?: boolean;//		远程搜索方法显示后缀图标	boolean false

  loading?: boolean;//		是否正在从远程获取数据	boolean false

  loadingText?: string;//	从服务器加载数据时显示的文本，默认为“Loading”

  noMatchText?: string;//	搜索条件无匹配时显示的文字，也可以使用 empty 插槽设置，默认是 “No matching data'”

  noDataText?: string;//	无选项时显示的文字，也可以使用 empty 插槽设置自定义内容，默认是 “No data”

  popperClass?: string;//	选择器下拉菜单的自定义类名

  reserveKeyword?: boolean;//当 multiple 和 filterable被设置为 true 时，是否在选中一个选项后保留当前的搜索关键词	boolean true

  defaultFirstOption?: boolean;//	是否在输入框按下回车时，选择第一个匹配项。 需配合 filterable 或 remote 使用		boolean false

  teleported?: boolean;//	是否将下拉列表插入至 body 元素		boolean true

  appendTo?: string;//	下拉框挂载到哪个 DOM 元素

  persistent?: boolean;//	当下拉选择器未被激活并且persistent设置为false，选择器会被删除。	boolean true

  automaticDropdown?: boolean;//	对于不可搜索的 Select，是否在输入框获得焦点后自动弹出选项菜单	boolean false

  clearIcon?: string | object;//	自定义清除图标	CircleClose

  fitInputWidth?: boolean;//	下拉框的宽度是否与输入框相同	boolean false

  suffixIcon?: string | object;//	自定义后缀图标组件	ArrowDown

  tagType?: '' | 'success' | 'info' | 'warning' | 'danger';//	标签类型	info

  tagEffect?: '' | 'light' | 'dark' | 'plain';//2.7.7	标签效果	 light

  validateEvent?: boolean;//	是否触发表单验证		boolean true

  placement?: 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end';//	下拉框出现的位置	bottom-start

  fallbackPlacements?: any[];// 2.5.6	dropdown 可用的 positions 请查看popper.js 文档	['bottom-start', 'top-start', 'right', 'left']

  maxCollapseTags?: number;//	需要显示的 Tag 的最大数量 只有当 collapse-tags 设置为 true 时才会生效。	1

  popperOptions?: object;//	popper.js 参数	{}


  emptyValues?: any[]//	组件的空值配置 参考config-provider
  valueOnClear?: string | number | boolean | Function;//	清空选项的值 参考 config-provider

  options: selectOptionsGroupType[] | selectOptionsType[] | number
  focus?: (event: FocusEvent) => void;//当 input 获得焦点时触发
  blur?: (event: FocusEvent) => void;//当 input 失去焦点时触发
  clear?: () => void;//可清空的单选模式下用户点击清空按钮时触发
  removeTag?: (tagValue: any) => void;//多选模式下移除tag时触发
  visibleChange?: (visible: boolean) => void;//下拉框出现/隐藏时触发
  change?: (value: any) => void;//	选中值发生变化时触发
}

export interface selectOptionsGroupType {
  label: string;
  disabled?: boolean;
  options: selectOptionsType[]
}

export interface selectOptionsType {
  value: string | number | boolean | object;//	选项的值

  label: string | number;//	选项的标签，若不设置则默认与value相同

  disabled?: boolean;//	是否禁用该选项

}
