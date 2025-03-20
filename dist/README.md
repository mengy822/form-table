
# 介绍

基于[Element-Plus](https://element-plus.org/zh-CN) 的[vue3](https://cn.vuejs.org/)版本的表单组件

# 使用

## 搜索框

1. 属性

|属性名|类型|默认值|说明|
|:-------- |:-----|:-----|:-----|
|language  | Object|zhCn|语言包|
|showSearch  | Boolean|true|显示搜索栏|
|defaultSearch  | Boolean|true|初始化后立即执行搜索|
|labelWidth  | String|auto|标签宽度|
|gutter  | Number|20|搜索框间隔|
|showSearchLabel  | Boolean|true|搜索标签|
|search  | Array|必填|搜索条件|
|searchButton  | Array|[]|搜索按钮|
|clearable  | Boolean|true|清除按钮|
|searchValue  | Object|必填|搜索值|
|isRefreshSearch  | Boolean|false|重置后立即搜索|

`search 可选值 inputInnerType | selectInnerType | dateInnerType`

2. 事件

|事件名|触发时机|参数|说明|
|:-------- |:-----|:-----|:-----|
|search|搜索按钮点击/初始化/重置|根据search属性生成的对象|搜索事件|
|refresh|重置按钮点击|--|重置事件|

3. 插槽

详情见下表

4. 使用
```html
<MyForm
      :default-search="true"
      :search-value="dataForm"
      :search="searchList"
      @search="query"
    ></MyForm>
```

```javascript
//搜索条件配置项
const searchList = ref<(inputInnerType | selectInnerType | dateInnerType)[]>([])
searchList.value.push({
    isRequired: true,
    prop: 'inputNumber',
    label: 'number',
    max: 10,
    type: 'input',
    inputType: 'number',
    span: 5,
  } as inputInnerType)
searchList.value.push({ isRequired: true, prop: 'input', label: 'input', type: 'input', span: 5 })
searchList.value.push({
    prop: 'select',
    label: 'select',
    type: 'select',
    options: 10,
    multiple: true,
    span: 5,
  } as selectInnerType)

searchList.value.push({
    prop: 'daterange',
    label: 'daterange',
    type: 'date',
    dateType: 'daterange',
    valueFormat: 'YYYY-MM-DD',
    format: 'YYYY-MM-DD',
    span: 8,
    aliases: 'start,end',
  } as dateInnerType)
//搜索条件
const dataForm = ref({
  inputNumber: '123',
  input: '456',
  select: '1,2,3',
  start: '2022-04-01',
  end: '2024-12-30',
})
//查询事件
const query = (e: any) => {
  dataForm.value = { ...e }
  request('/test', dataForm.value).then((res: any) => {
    data.value = res.data
  })
}
```

-----------
## 表格

1. 属性

|属性名|类型|默认值|说明|
|:-------- |:-----|:-----|:-----|
|language  | Object|zhCn|语言包|
|hasIndex  | [Boolean, String]|true|显示序号,string时为列名|
|hasOperation  | [Boolean, String]|true|显示操作,string时为列名|
|maxHeight  | [Number, String]|undefined|最大高度|
|height  | [Number, String]|undefined|最大高度|
|hasAdd  | [Boolean, String]|false|显示添加按钮,string时为按钮文本|
|hasDetail  | [Boolean, String]|true|显示详情按钮,string时为按钮文本|
|hasUpdate  | [Boolean, String]|true|显示修改按钮,string时为按钮文本|
|hasRemove  | [Boolean, String]|true|显示删除按钮,string时为按钮文本|
|tableColumn|Array|必填|表格列|
|queryParam|object|必填|搜索条件|
|removeMessage|string|您确定删除该数据吗? 警告:该操作不可逆,请慎重操作|删除提示|
|dataList|Array|必填|数据列表|
|total|number|0|总条数(大于0显示分页按钮)|
|hasSelection|boolean,((row: any, index: number) => boolean)|显示多选按钮,为function时控制多选按钮是否可以选中|--|
|highlightCurrentRow|Boolean|是否要高亮当前行|false|
|currentRowKey|String,Number|当前行的 key，只写属性|--|
|rowClassName|string,((data: { row: any, rowIndex: number }) => string)|行的 className 的回调方法，也可以使用字符串为所有行设置一个固定的 className。|--|
|rowStyle|CSSProperties,((data: { row: any, rowIndex: number }) => CSSProperties)|行的 style 的回调方法，也可以使用一个固定的 Object 为所有行设置一样的 Style|--|
|cellClassName|string,((data: { row: any, rowIndex: number }) => string)|单元格的 className 的回调方法，也可以使用字符串为所有单元格设置一个固定的 className。|--|
|cellStyle|CSSProperties,((data: { row: any, rowIndex: number }) => CSSProperties)|单元格的 style 的回调方法，也可以使用一个固定的 Object 为所有单元格设置一样的 Style|--|
|headerRowClassName|string,((data: { row: any, rowIndex: number }) => string)|表头行的 className 的回调方法，也可以使用字符串为所有表头行设置一个固定的 className。|--|
|headerRowStyle|CSSProperties,((data: { row: any, rowIndex: number }) => CSSProperties)|表头行的 style 的回调方法，也可以使用一个固定的 Object 为所有表头行设置一样的 Style|--|
|headerCellClassName|string,((data: { row: any, rowIndex: number }) => string)|表头单元格的 className 的回调方法，也可以使用字符串为所有表头单元格设置一个固定的 className。|--|
|headerCellStyle|CSSProperties,((data: { row: any, rowIndex: number }) => CSSProperties)|表头单元格的 style 的回调方法，也可以使用一个固定的 Object 为所有表头行设置一样的 Style|--|
 |rowKey|string,((row: any) => string)|行数据的 Key，用来优化 Table 的渲染； 在使用reserve-selection功能与显示树形数据时，该属性是必填的。 类型为 String 时，支持多层访问：user.info.id，但不支持 user.info[0].id，此种情况请使用 Function。|--|
 |emptyText|string|空数据时显示的文本内容， 也可以通过 #empty 设置|没有数据|
 



>tableColumn 字段
>>prop: 列绑定的字段
label: 列显示的文本
isTable: 是否是表格使用(可选)
isForm: 是否是表单使用(可选)
showOverflow: 超长省略(可选)
width: 列宽(可选)
hidden: 是否隐藏(可选)
visible: 隐藏状态是否显示(可选)
align:对齐方式(可选) 'center' | 'left' | 'right' 
fixed:固定列(可选) false | true | 'left' | 'right'
fun: 显示内容方法(可选)
classFun: 定制类(可选)
hasDetail: 显示行详情按钮(可选)
hasUpload: 显示行修改按钮(可选)
hasRemove: 显示行删除按钮(可选)



2. 事件

|事件名|触发时机|参数|说明|
|:-------- |:-----|:-----|:-----|
|query|搜索按钮点击/刷新按钮点击|queryParam|搜索事件|
|add|新增按钮点击|--|新增事件|
|update|修改按钮点击|当前行的所有数据|修改事件|
|detail|详情按钮点击|当前行的所有数据|详情事件|
|remove|删除按钮点击|当前行的所有数据|删除事件|
|showSearch|显示搜索框按钮点击|true/false|显示搜索框事件|
3. 插槽

|插槽名|说明|参数|
|:---|:----|:----|
|tableOperation|表格上方的操作按钮|--|
|header|表格上方|--|
|${prop}|表格列|data:当前数据<br>prop:当前属性名<br>row:当前行数据<br>index:当前行序号|
|operation|表格操作列额外按钮|当前行数据|
|update|表格操作列修改按钮|当前行数据|
|detail|表格操作列详情按钮|当前行数据|
|remove|表格操作列删除按钮|当前行数据|
详情见下表

4.使用

```html
<MyTabel :query-param="dataForm" :total="total" :table-column="table" :data-list="data" :max-height="'75vh'" :has-detail="true" :has-remove="true" :has-update="true" :has-add="true"  @detail="detail" @update="update" @remove="remove" @add="update" @query="query"></MyTabel>
```
```javascript
//查询条件
const dataForm = ref({
  inputNumber: '123',
  input: '456',
  select: '1,2,3',
  start: '2022-04-01',
  end: '2024-12-30',
  pageSize:10,
  pageNum:1
})
//数据条数
const total=ref(10)
//当前页的数据
const data=ref([])
//表格配置项
const table=ref([
  { prop: 'text', label: '文本输入框' },
  { prop: 'textarea', label: '文本域输入框' },
  { prop: 'password', label: '密码输入框' },
  { prop: 'number', label: '数字输入框' },
  { prop: 'year', label: '日期-年' },
  { prop: 'years', label: '日期-多年' },
  { prop: 'month', label: '日期-月' },
  { prop: 'date', label: '日期-日' },
  { prop: 'dates', label: '日期-多日', hidden: true, visible: false },
  { prop: 'datetime', label: '日期-天时间', hidden: true, visible: true },
  { prop: 'week', label: '日期-周', hidden: true, visible: false },
  { prop: 'datetimerange', label: '日期-多时间', hidden: true, visible: true,fun:(row,prop)=>row['startDateTime']+'/'+row['endDateTime'] },
  { prop: 'daterange', label: '日期-多天', hidden: true, visible: false ,fun:(row,prop)=>row['startDate']+'/'+row['endDate']},
  { prop: 'monthrange', label: '日期-多月', hidden: true, visible: true ,fun:(row,prop)=>row['startMouth']+'/'+row['endMouth']},
  { prop: 'switch', label: '开关', hidden: true, visible: false },
  { prop: 'checkboxNumber', label: '多选框数字', hidden: true, visible: true },
  { prop: 'radioNumber', label: '单选框数字', hidden: true, visible: false },
  { prop: 'selectNumber', label: '选择器数字', hidden: true, visible: true },
  { prop: 'checkbox', label: '多选框', hidden: true, visible: false },
  { prop: 'radio', label: '单选框', hidden: true, visible: true },
  { prop: 'select', label: '选择器', hidden: true, visible: false },
])
//详情事件
const detail = (e: unknown) => {
  console.log(e, '详情')
}
//修改事件
const update = (e: any = {}) => {
  console.log(e, '修改')
}
//删除事件
const remove = (e: unknown) => {
  console.log(e, '删除')
}
//搜索事件
const query = (e: any) => {
  dataForm.value = { ...e }
  console.log(e, '查询')
  request('/test', dataForm.value).then((res: any) => {
    total.value = res.total
    data.value = res.data
  })
}
```

-----------
## 详情

1. 属性

|属性名|类型|默认值|说明|
|:-------- |:-----|:-----|:-----|
|language  | Object|zhCn|语言包|
|width|String|50%|弹框宽度|
|title|String|详情|弹框标题|
|desBorder|Boolean|true|是否带有边框|
|desColumn|Number|2|列数|
|desDirection| 'vertical' , 'horizontal'|horizontal|排列的方向|
|desSize|'', 'large' , 'default' , 'small|''|列表的尺寸|
|desTitle|String|''|标题文本，显示在左上方|
|desExtra|String|''|操作区文本，显示在右上方|
|column|Array|必填|表格列|

>column 字段
>>prop: 列绑定的字段
label: 列显示的文本 
span: 列的数量(可选) 
rowspan: 单元格应该跨越的行数(可选)
width: 列的宽度，不同行相同列的宽度按最大值设定（如无 border ，宽度包含标签与内容）(可选) 
minWidth: 列的最小宽度，与 width 的区别是 width 是固定的，min-width 会把剩余宽度按比例分配给设置了 min-width 的列（如无 border，宽度包含标签与内容）(可选)
align:对齐方式(可选) 'center' | 'left' | 'right' 
labelAlign:标签对齐方式(可选) 'left' | 'center' | 'right'; //列的标签对齐方式，若不设置该项，则使用内容的对齐方式（如无 border，请使用 align 参数）
fun: 显示内容方法(可选) 
className: 列的内容自定义类名(可选) 
labelClassName: 标签自定义类名(可选) 


2. 插槽

|插槽名|说明|参数|
|:---|:----|:----|
|label_${prop}|单项的标签|data:所有数据<br>prop:当前属性名|
|${prop}|单项的内容|data:所有数据<br>prop:当前属性名|
|footer|操作按钮|data:所有数据|


3.使用

```html
<MyDetail des-column="3" ref="detailRef" :column="table"></MyDetail>
```
```javascript
//详情配置项
const table=ref([
  { prop: 'text', label: '文本输入框' },
  { prop: 'textarea', label: '文本域输入框' },
  { prop: 'password', label: '密码输入框' },
  { prop: 'number', label: '数字输入框' },
  { prop: 'year', label: '日期-年' },
  { prop: 'years', label: '日期-多年' },
  { prop: 'month', label: '日期-月' },
  { prop: 'date', label: '日期-日' },
  { prop: 'dates', label: '日期-多日', hidden: true, visible: false },
  { prop: 'datetime', label: '日期-天时间', hidden: true, visible: true },
  { prop: 'week', label: '日期-周', hidden: true, visible: false },
  { prop: 'datetimerange', label: '日期-多时间', hidden: true, visible: true,fun:(row,prop)=>row['startDateTime']+'/'+row['endDateTime'] },
  { prop: 'daterange', label: '日期-多天', hidden: true, visible: false ,fun:(row,prop)=>row['startDate']+'/'+row['endDate']},
  { prop: 'monthrange', label: '日期-多月', hidden: true, visible: true ,fun:(row,prop)=>row['startMouth']+'/'+row['endMouth']},
  { prop: 'switch', label: '开关', hidden: true, visible: false },
  { prop: 'checkboxNumber', label: '多选框数字', hidden: true, visible: true },
  { prop: 'radioNumber', label: '单选框数字', hidden: true, visible: false },
  { prop: 'selectNumber', label: '选择器数字', hidden: true, visible: true },
  { prop: 'checkbox', label: '多选框', hidden: true, visible: false },
  { prop: 'radio', label: '单选框', hidden: true, visible: true },
  { prop: 'select', label: '选择器', hidden: true, visible: false },
])
//详情面板的ref对象
const detailRef=ref(null)
//详情事件
const detail = (e: unknown) => {
  console.log(e, '详情')
  detailRef.value.init({...e})
}
```
## 新增/修改

1. 属性

|属性名|类型|默认值|说明|
|:-------- |:-----|:-----|:-----|
|language  | Object|zhCn|语言包|
|notNeedChangeCheck|Array|[input]|不需要创建change检查的类型|
|submitButtonTxt|{add: Stringedit: String}| {add:'提交',edit:'修改'}|新增/修改的按钮文本配置|
|cancelButtonTxt|String|取消|关闭按钮的文本配置|
|width|String|50%|弹框宽度|
|title|{add: Stringedit: String}| {add:'新增',edit:'编辑'}|新增/修改的标题配置|
|column|Array|必填|编辑列|
|inline|Boolean|false|行内表单模式|
|labelPosition|'left', 'right' , 'top'|right|表单域标签位置|
|labelWidth| [String, Number]| ''|标签长度| 
|labelSuffix| String| ''|表单域标签后缀|
|hideRequiredAsterisk| Boolean| false|隐藏必填星号|
|requireAsteriskPosition| 'left' , 'right'| 'left'|星号位置|
|showMessage| Boolean| true|是否显示错误信息|
|inlineMessage| Boolean| false|以行内形式显示错误信息|
|statusIcon| Boolean| false|在输入框内显示反馈图标|
|validateOnRuleChange| Boolean| true|是否在rules改变后立即触发|
|size| '' , 'large' , 'default' , 'small'| ''|表单内组件尺寸|
|disabled| Boolean| false|禁用所有组件|
|scrollToError| Boolean| false|滚动到第一个错误表单|

>tableColumn 字段
>>inputInnerType
    switchInnerType
     checkboxInnerType
    radioInnerType
    selectInnerType
     dateInnerType
     详情见下表



2. 事件

|事件名|触发时机|参数|说明|
|:-------- |:-----|:-----|:-----|
|submit|确定按钮点击|所有数据|保存事件|
3. 插槽

|插槽名|说明|参数|
|:---|:----|:----|
|${prop}|输入框|data:所有数据<br>prop:当前属性名|
|item_${prop}|输入框|data:所有数据<br>prop:当前属性名|
|label_${prop}|输入框|data:所有数据<br>prop:当前属性名|
|error_${prop}|输入框|data:所有数据<br>prop:当前属性名|
|footer|操作按钮|data:所有数据|
详情见下表

4.使用

```html
<MyEdit ref="editRef" :column="editColumn" @submit='submitFun'></MyEdit>
```
```javascript
//配置项
const editColumn = ref([
  {
    prop: 'text',
    label: '文本输入框',
    type: 'input',
    inputType: 'text',
    isRequired:true
  } as inputInnerType,
  {
    prop: 'textarea',
    label: '文本域输入框',
    type: 'input',
    inputType: 'textarea',
  } as inputInnerType,
  {
    prop: 'password',
    label: '密码输入框',
    type: 'input',
    inputType: 'password',
  } as inputInnerType,
  {
    prop: 'number',
    label: '数字输入框',
    type: 'input',
    inputType: 'number',
  } as inputInnerType,
  {
    prop: 'year',
    label: '日期-年',
    type: 'date',
    dateType: 'year',
    valueFormat: 'YYYY',
  } as dateInnerType,
  {
    prop: 'years',
    label: '日期-多年',
    type: 'date',
    dateType: 'years',
    valueFormat: 'YYYY',
  } as dateInnerType,

  {
    prop: 'month',
    label: '日期-月',
    type: 'date',
    dateType: 'month',
    valueFormat: 'YYYY-MM',
  } as dateInnerType,
  {
    prop: 'date',
    label: '日期-日',
    type: 'date',
    dateType: 'date',
    valueFormat: 'YYYY-MM-DD',
    format: 'YYYY-MM-DD',
  } as dateInnerType,
  {
    prop: 'dates',
    label: '日期-多日',
    type: 'date',
    dateType: 'dates',
    valueFormat: 'YYYY-MM-DD',
    format: 'YYYY-MM-DD',
  } as dateInnerType,
  {
    prop: 'datetime',
    label: '日期-天时间',
    type: 'date',
    dateType: 'datetime',
    valueFormat: 'YYYY-MM-DD hh:mm:ss',
    format: 'YYYY-MM-DD hh:mm:ss',
  } as dateInnerType,
  {
    prop: 'week',
    label: '日期-周',
    type: 'date',
    dateType: 'week',
    valueFormat: 'YYYY-ww',
  } as dateInnerType,
  {
    prop: 'datetimerange',
    label: '日期-多时间',
    type: 'date',
    dateType: 'datetimerange',
    valueFormat: 'YYYY-MM-DD hh:mm:ss',
    format: 'YYYY-MM-DD hh:mm:ss',
    aliases: 'startDateTime,endDateTime',
  } as dateInnerType,
  {
    prop: 'daterange',
    label: '日期-多天',
    type: 'date',
    dateType: 'daterange',
    valueFormat: 'YYYY-MM-DD',
    format: 'YYYY-MM-DD',
    aliases: 'startDate,endDate',
  } as dateInnerType,
  {
    prop: 'monthrange',
    label: '日期-多月',
    type: 'date',
    dateType: 'monthrange',
    valueFormat: 'YYYY-MM',
    aliases: 'startMouth,endMouth',
  } as dateInnerType,
  {
    prop: 'switch',
    label: '开关',
    type: 'switch',
  } as switchInnerType,
  {
    prop: 'checkboxNumber',
    label: '多选框数字',
    type: 'checkbox',
    options: 10,
  } as checkboxInnerType,
  {
    prop: 'radioNumber',
    label: '单选框数字',
    type: 'radio',
    options: 10,
  } as radioInnerType,
  {
    prop: 'selectNumber',
    label: '选择器数字',
    type: 'select',
    options: 10,
  } as selectInnerType,
  {
    prop: 'selectNumberMultiple',
    label: '选择器数字多选',
    type: 'select',
    options: 10,
    multiple:true,
  } as selectInnerType,
  {
    prop: 'checkbox',
    label: '多选框',
    type: 'checkbox',
    options: [
      {
        label: 'a',
        value: 'a',
      },
      {
        label: 'b',
        value: 'b',
        disable: true,
      },
      {
        label: 'c',
        value: 'c',
      },
    ],
  } as checkboxInnerType,
  {
    prop: 'radio',
    label: '单选框',
    type: 'radio',
    options: [
      {
        label: 'a',
        value: 'a',
      },
      {
        label: 'b',
        value: 'b',
        disable: true,
      },
      {
        label: 'c',
        value: 'c',
      },
    ],
  } as radioInnerType,
  {
    prop: 'select',
    label: '选择器',
    type: 'select',
    options: [
      {
        label: 'a',
        value: 'a',
      },
      {
        label: 'b',
        value: 'b',
        disabled: true,
      },
      {
        label: 'c',
        value: 'c',
      },
    ],
  } as selectInnerType,
])
//新增/编辑 ref对象
const editRef=ref(null)
//修改事件
const update = (e: any = {}) => {
  console.log(e, '修改')
  editRef.value.init({...e})
}
//保存事件
const submitFun=(e:any)=>{
  console.log(e, '保存')
}

```

-----------

# 子组件
## 公共参数
|属性名|类型|说明|默认值|
|----|----|----|----|
prop| string| model 的键名。|必填|
  label| string|标签|必填|
  labelPosition| '' , 'left' , 'right' , 'top'|  	表单域标签的位置|--|
  labelWidth| string , number| 标签宽度，例如 '50px'。 可以使用 auto。|--|
  isForm| boolean|表单字段|false|
  isTable| boolean|表格字段|false|
  error| string| 表单域验证错误时的提示信息。|--|
  showMessage| boolean| 是否显示校验错误信息|--|
  inlineMessage| string , boolean| 	是否在行内显示校验信息|--|
  type| 'input' , 'date' , 'radio' , 'select' , 'switch' , 'checkbox'|表单项类型|必填|
  span| number|栏宽度|--|
  for| string| 和原生标签相同能力|--|
  validateStatus| '' , 'error' , 'validating' , 'success'| formitem 校验的状态|--|
  isDefault| boolean|是否有默认选中|false|
  isRequired| boolean,((rule: any, value: any, callback: any)=>void)|是否必填|false|
  size| large' ,'default' , 'small'|	多选框组尺寸	 |--|
  disabled| boolean|	是否禁用	 |false|
  clearable| boolean|是否有清除按钮|false|
  readonly|boolean|只读|false|
## 输入框
|插槽名|说明|
|-----|-----|
|prefix-{prop}|	输入框头部内容，只对非 type="textarea" 有效|
|suffix-{prop}|	输入框尾部内容，只对非 type="textarea" 有效|
|prepend-{prop}|	输入框前置内容，只对非 type="textarea" 有效|
|append-{prop}|	输入框后置内容，只对非 type="textarea" 有效|
|prefix|	全局输入框头部内容，只对非 type="textarea" 有效|
|suffix|	全局输入框尾部内容，只对非 type="textarea" 有效|
|prepend|全局输入框前置内容，只对非 type="textarea" 有效|
|append|	全局输入框后置内容，只对非 type="textarea" 有效|

|属性名|类型|说明|
|-----|-----|-----|
|inputType| 'text' , 'textarea' , 'password' , 'number'|输入框类型|
|maxlength| string , number|	同原生 maxlength 属性
|minlength| string , number|	原生属性，最小输入长度
|showWordLimit| boolean|	是否显示统计字数, 只在 type 为 'text' 或 'textarea' 的时候生效	 false
|placeholder| string|	输入框占位文本
|showPassword| boolean|	是否显示切换密码图标
|prefixIcon| string|	自定义前缀图标
|suffixIcon| string|自定义后缀图标
|rows| number|	输入框行数，仅 type 为 'textarea' 时有效
|autosize| boolean , object|	textarea 高度是否自适应，仅 type 为 'textarea' 时生效。 可以接受一个对象，比如: { minRows: 2, maxRows: 6 }|
|autocomplete| string|	原生 autocomplete 属性	off
|name| string|等价于原生 input name 属性
|max| any|原生 max 属性，设置最大值	—	—
|min| any|	原生属性，设置最小值	—	—
|step| any|原生属性，设置输入字段的合法数字间隔	—	—
|resize| 'none' , 'both' , 'horizontal' , 'vertical'|	控制是否能被用户缩放
|autofocus| boolean|	原生属性，自动获取焦点	false
|form| string|	原生属性	string	—
|validateEvent| boolean|	输入时是否触发表单的校验
|inputStyle| string , object;
|blur| (event: FocusEvent) => void|	当选择器的输入框失去焦点时触发
|focus| (event: FocusEvent) => void|当选择器的输入框获得焦点时触发
|change| (value: string , number) => void|仅当 modelValue 改变时，当输入框失去焦点或用户按Enter时触发
|input| (value: string , number) => void|在 Input 值改变时触发
|clear| () => void|在点击由 clearable 属性生成的清空按钮时触发

## 日期选择
|插槽名|说明|
|-----|-----|
|default-{prop}|	自定义单元格内容|
|range-separator-{prop}|	自定义范围分割符内容|
|prev-month-{prop} |	上个月的图标|
|next-month-{prop}	|下个月的图标|
|prev-year-{prop} 	|上一年图标|
|next-year-{prop} |	下一年图标|
|default|	全局自定义单元格内容|
|range-separator|	全局自定义范围分割符内容|
|prev-month |	全局上个月的图标|
|next-month	|全局下个月的图标|
|prev-year 	|全局上一年图标|
|next-year |全局下一年图标|

|属性名|类型|说明|
|----|----|----|
|startPlaceholder| string|时间范围开始时间|
|rangeSeparator| string|时间范围连接符|
|endPlaceholder| string|时间范围结束时间|
|aliases| string|时间范围转义单字段|
|editable| boolean|
|valueFormat| string|时间绑定格式|
|format| string|时间显示格式|
|dateType| 'year' , 'years','yearrange' , 'month' , 'date' , 'dates' , 'datetime' , 'week' , 'datetimerange' , 'daterange' , 'monthrange'|类型|
|change| (val: any) => void|用户确认选定的值时触发|
|blur| (e: FocusEvent) => void|在组件 Input 失去焦点时触发|
|focus| (e: FocusEvent) => void|在组件 Input 获得焦点时触发|
|clear| () => void|2.7.7	可清空的模式下用户点击清空按钮时触发|
|calendarChange| (val: [Date, null , Date]) => void|在日历所选日期更改时触发|
|panelChange| (date: Date , [Date, Date], mode: 'month' , 'year', view| string) => void|	当日期面板改变时触发。|
|visibleChange| (visibility: boolean) => void|	当 DatePicker 的下拉列表出现/消失时触发|

## 开关 
|插槽名|说明|
|-----|-----|
|active-action-{prop}|激活按钮|
|active-action-{prop}|未激活按钮|
|active-action|全局激活按钮|
|active-action|全局未激活按钮|

|属性名|类型|说明
|----|----|----|
|loading| boolean|是否显示加载中	boolean false|
|width| string , number|	switch 的宽度|
|inlinePrompt| boolean|	无论图标或文本是否显示在点内，只会呈现文本的第一个字符	boolean false|
|activeIcon| string|	switch 状态为 on 时所显示图标，设置此项会忽略 active-text|
|inactiveIcon| string|switch 状态为 off 时所显示图标，设置此项会忽略 inactive-text|
|activeActionIcon| string| 	on状态下显示的图标组件|
|inactiveActionIcon| string| 	off状态下显示的图标组件|
|activeText| string|	switch 打开时的文字描述|
|inactiveText| string|	switch 的状态为 off 时的文字描述|
|activeValue| boolean , string , number|	switch 状态为 on 时的值	 true|
|inactiveValue| boolean , string , number|	switch的状态为 off 时的值	false|
|name| string|switch 对应的 name 属性|
|validateEvent| boolean|	是否触发表单验证	true|
|beforeChange| boolean , (() => Promise<boolean>)|	switch 状态改变前的钩子， 返回 false 或者返回 Promise 且被 reject 则停止切换|
|id| string|	input 的 id|
|tabindex| string , number|	input 的 tabindex|
|change| (val: boolean , string , number) => void|切换时触发|

## 下拉框
|插槽名|说明|
|-----|-----|
|active-action-{prop}|激活按钮|
|active-action-{prop}|未激活按钮|
|active-action|全局激活按钮|
|active-action|全局未激活按钮|

|属性名|类型|说明|默认值|
|----|----|----|----|
|multiple| boolean|	是否多选	| false|
|valueKey| string|	作为 value 唯一标识的键名，绑定值为对象类型时必填	| --|
|collapseTags| boolean|	多选时是否将选中值按文字的形式展示	| false|
|collapseTagsTooltip| boolean|	当鼠标悬停于折叠标签的文本时，是否显示所有选中的标签。 要使用此属性，collapse-tags属性必须设定为 true	 | false|
|multipleLimit| number|multiple 属性设置为 true 时，代表多选场景下用户最多可以选择的项目数， 为 0 则不限制	| 0|
|name| string|	Select 输入框的原生 name 属性|--|
|effect| 'dark' , 'light' , string|	tooltip 主题，内置了 dark / light 两种	|light|
|autocomplete| string|	Select 输入框的原生 autocomplete 属性	|off|
|filterable| boolean|	Select 组件是否可筛选	| false|
|allowCreate| boolean|	是否允许用户创建新条目， 只有当 filterable 设置为 true 时才会生效。	| false|
|filterMethod| () => void|	自定义筛选方法|--|
|remote| boolean|	其中的选项是否从服务器远程加载	 | false|
|remoteMethod| () => void|	自定义远程搜索方法|--|
|remoteShowSuffix| boolean|		远程搜索方法显示后缀图标	| false|
|loading| boolean|		是否正在从远程获取数据	| false|
|loadingText| string|	从服务器加载数据时显示的文本，默认为“Loading”|Loading|
|noMatchText| string|	搜索条件无匹配时显示的文字，也可以使用 empty 插槽设置，默认是 “No matching data'”|No matching data|
|noDataText| string|	无选项时显示的文字，也可以使用 empty 插槽设置自定义内容，默认是 “No data”|No data|
|popperClass| string|	选择器下拉菜单的自定义类名|--|
|reserveKeyword| boolean|当 multiple 和 filterable被设置为 true 时，是否在选中一个选项后保留当前的搜索关键词	| true|
|defaultFirstOption| boolean|	是否在输入框按下回车时，选择第一个匹配项。 需配合 filterable 或 remote 使用		| false|
|teleported| boolean|	是否将下拉列表插入至 body 元素		| true|
|appendTo| string|	下拉框挂载到哪个 DOM 元素|--|
|persistent| boolean|	当下拉选择器未被激活并且persistent设置为false，选择器会被删除。	| true|
|automaticDropdown| boolean|	对于不可搜索的 Select，是否在输入框获得焦点后自动弹出选项菜单	| false|
|clearIcon| string , object|	自定义清除图标	|CircleClose|
|fitInputWidth| boolean|	下拉框的宽度是否与输入框相同	| false|
|suffixIcon| string , object|	自定义后缀图标组件|	ArrowDown|
|tagType| '' , 'success' , 'info' , 'warning' , 'danger'|	标签类型	|info|
|tagEffect| '' , 'light' , 'dark' , 'plain'|	标签效果	 |light|
|validateEvent| boolean|	是否触发表单验证		| true|
|placement| 'top' , 'top-start' , 'top-end' , 'bottom' , 'bottom-start' , 'bottom-end' , 'left' , 'left-start' , 'left-end' , 'right' , 'right-start' , 'right-end'|	下拉框出现的位置	|bottom-start|
|fallbackPlacements| any[]| 	dropdown 可用的 positions 请查看popper.js 文档	['bottom-start', 'top-start', 'right', 'left']|--|
|maxCollapseTags| number|	需要显示的 Tag 的最大数量 只有当 collapse-tags 设置为 true 时才会生效。	|1|
|popperOptions| object|	popper.js 参数	|{}|
|emptyValues| any[]//	组件的空值配置 参考config-providervalueOnClear| string , number , boolean , Function|	清空选项的值 参考 config-provider|--|
|options| selectOptionsGroupType[] , selectOptionsType[] , number|
|focus| (event: FocusEvent) => void|当 input 获得焦点时触发|--|
|blur| (event: FocusEvent) => void|当 input 失去焦点时触发|--|
|clear| () => void|可清空的单选模式下用户点击清空按钮时触发|--|
|removeTag| (tagValue: any) => void|多选模式下移除tag时触发|--|
|visibleChange| (visible: boolean) => void|下拉框出现/隐藏时触发|--|
|change| (value: any) => void|	选中值发生变化时触发|--|


>selectOptionsGroupType 

|属性名|类型|说明|
|----|----|----|
 | label| string|选项的标签|
  |disabled| boolean|是否禁用|
  |options: selectOptionsType[]|option|


>selectOptionsType 

|属性名|类型|说明|
|----|----|----|
 | value| string , number , boolean, object|	选项的值|
|  label| string | number|	选项的标签，若不设置则默认与value相同|
 | disabled| boolean|	是否禁用该选项|
