export type FormItemType =
  'input'
  | 'autocomplete'
  | 'select'
  | 'treeSelect'
  | 'cascader'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'switch'
  | 'button'
  | 'searchRefresh'
  | 'search'
  | 'refresh';

type base = {
  //类型 按钮|下拉选择|输入框|时间框|重置按钮|搜索|搜索-重置
  type: 'button' | 'select' | 'input' | 'date' | 'refresh' | 'search' | 'search-refresh';
  //属性名
  prop: string;
  clearable?: boolean;
  //显示名
  // label: string;
  //是否是表格
  isTable?: boolean;
  //是否是表单
  isForm?: boolean;
}
export type FormItemValueType = base & {} | base & {}

export interface FormItem {
  type: FormItemType;  // 表单项的类型
  payload: FormItemValueType;        // 表单项的数据（如标签、值、选项）
  next: (current: FormItem, acients: FormItem[]) => FormItem | null;  // 选择下一个表单项的逻辑
  parent: FormItem | null;  // 父级表单项
}

export interface queryInnerType extends queryParamType {
  pageSize: number;
  pageNum: number;
}

export interface queryParamType {
  [key: string]: string | number | undefined | boolean | string[] | number[] | boolean[]; //string | number | undefined | boolean | string[] | number[] | boolean[]
}

export interface input extends searchItemType {
  inputType?: 'text' | 'textarea' | 'password' | 'button' | 'checkbox' | 'file' | 'number' | 'radio';
}

export interface select extends searchItemType {
  options: { value?: string | number | boolean; label: string }[];
  multiple?:boolean;
}

export interface button {
  type: 'button' | 'refresh' | 'search' | 'search-refresh';
  size?: string;
  icon?: string;
  inputType?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text';
  clickFun?: (data: queryInnerType) => {};
  span?: number;
  label?: string;
}

export interface refresh extends button {
  fun: 'refresh';
}

export interface search extends button {
  fun: 'search';
}

export interface searchRefresh extends button {
  searchLabel: string;
  refreshLabel: string;
  fun: 'search';
}

export interface date extends searchItemType {
  startPlaceholder?: string;
  rangeSeparator?: string;
  endPlaceholder?: string;
  readonly?: boolean;
  disabled?: boolean;
  editable?: boolean;
  aliases?:string;
  size?: 'large' | 'default' | 'small';
  valueFormat: string;
  format: string;
  dateType?: 'year' | 'years' | 'month' | 'date' | 'dates' | 'datetime' | 'week' | 'datetimerange' | 'daterange' | 'monthrange';
}

export interface searchItemType {
  //类型 按钮|下拉选择|输入框|时间框
  type: 'select' | 'input' | 'date' ;
  //属性名
  prop: string;
  clearable?: boolean;
  isRequired?:boolean;
  isDefault?:boolean;
  labelWidth?:string;
  //显示名
  // label: string;
  //是否是表格
  isTable?: boolean;
  span?: number;
  //是否是表单
  isForm?: boolean;
}
