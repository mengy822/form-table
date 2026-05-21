![封面](https://i-blog.csdnimg.cn/direct/f4eb7b4a21fe4e2fb803e851857d6eab.png)

[👉前往github](https://github.com/mengy822/form-table)


# 介绍

基于 [Element-Plus](https://element-plus.org/zh-CN) 的 [Vue3](https://cn.vuejs.org/) 版本的表单/表格组件库，提供搜索表单、表格、虚拟表格、详情、编辑弹框、导入弹框等核心功能，支持高度自定义配置。

---

# 使用

## 搜索框 (MyForm)

1. 属性

| 属性名 | 类型 | 默认值 | 说明 |
|:-------- |:-----|:-----|:-----|
| language | Object | zhCn | 语言包 |
| notNeedChangeCheck | Array | ['input', 'inputNumber'] | 不需要触发变更检查的组件类型 |
| showSearch | Boolean | true | 显示搜索栏 |
| defaultSearch | Boolean | true | 初始化后立即执行搜索 |
| labelWidth | String | 'auto' | 标签宽度 |
| gutter | Number | 20 | 搜索框间隔 |
| showSearchLabel | Boolean | true | 显示搜索标签 |
| search | Array | 必填 | 搜索条件配置 |
| searchButton | Array | [] | 搜索按钮配置（为空时默认添加 search-refresh 类型按钮） |
| clearable | Boolean | true | 清除按钮 |
| searchValue | Object | {} | 搜索值 |
| isRefreshSearch | Boolean | false | 重置后立即搜索 |

> `search` 可选值：`inputInnerType` | `selectInnerType` | `dateInnerType` | `switchInnerType` | `checkboxInnerType` | `radioInnerType`

2. 事件

| 事件名 | 触发时机 | 参数 | 说明 |
|:-------- |:-----|:-----|:-----|
| search | 搜索按钮点击/初始化/重置 | 根据 search 属性生成的对象 | 搜索事件 |
| refresh | 重置按钮点击 | — | 重置事件 |

3. 插槽

| 插槽名 | 说明 | 参数 |
|:---|:----|:----|
| my-form-item-${prop} | 自定义表单项 | prop, data |
| label_${prop} | 自定义标签 | prop, data |
| error_${prop} | 自定义错误信息 | prop, data |
| ${prop} | 自定义输入框 | prop, data |

4. 使用

```html
<MyForm
  :search="searchList"
  :search-value="searchParams"
  :default-search="true"
  :clearable="true"
  @search="handleSearch"
>
  <template #status="{ prop, data }">
    <el-select v-model="data[prop]" placeholder="请选择状态">
      <el-option label="启用" value="1"></el-option>
      <el-option label="禁用" value="0"></el-option>
    </el-select>
  </template>
</MyForm>
```

```javascript
import { ref } from 'vue'

const searchParams = ref({
  userName: '',
  status: ''
})

const searchList = ref([
  {
    prop: 'userName',
    label: '用户名',
    type: 'input',
    inputType: 'text',
    placeholder: '请输入用户名',
    span: 6
  },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    options: [
      { label: '启用', value: 1 },
      { label: '禁用', value: 0 }
    ],
    span: 6
  }
])

const handleSearch = (params) => {
  console.log('搜索参数:', params)
}
```

---

## 表格 (MyTable)

1. 属性

| 属性名 | 类型 | 默认值 | 说明 |
|:-------- |:-----|:-----|:-----|
| hasPage | Boolean | true | 是否显示分页 |
| language | Object | zhCn | 语言包 |
| hasIndex | Boolean/String | true | 显示序号，string 时为列名 |
| hasSelection | Boolean/Function | false | 显示多选按钮 |
| hasOperation | Boolean/String | true | 显示操作列，string 时为列名 |
| operationWidth | Number | undefined | 操作列总宽度 |
| oneOperationWidth | Number | 70 | 单个操作按钮宽度 |
| hasOperationName | Boolean | true | 是否显示操作列标题 |
| maxHeight | Number/String | undefined | 最大高度 |
| height | Number/String | undefined | 固定高度 |
| baseClass | String | '' | 基础样式类（用于自动计算高度） |
| autoHeightExcludeClassName | Array | [] | 高度计算时排除的 class 名称 |
| align | String | 'center' | 默认对齐方式 |
| operationAlign | String | 'center' | 操作列对齐方式 |
| operationFixed | String | 'right' | 操作列固定位置 |
| hasIndexFixed | String | 'left' | 序号列固定位置 |
| maxWidth | Boolean | true | 是否启用最大宽度限制 |
| hasOperationText | Boolean | true | 操作按钮是否显示文本 |
| hasOperationLink | Boolean | true | 操作按钮是否显示链接样式 |
| hasDetail | Boolean/String/Function | '详情' | 显示详情按钮 |
| hasDetailIcon | Object | View | 详情按钮图标 |
| hasDetailType | String | 'primary' | 详情按钮类型 |
| hasUpdate | Boolean/String/Function | '修改' | 显示修改按钮 |
| hasUpdateIcon | Object | Edit | 修改按钮图标 |
| hasUpdateType | String | 'warning' | 修改按钮类型 |
| hasRemove | Boolean/String/Function | '删除' | 显示删除按钮 |
| hasRemoveIcon | Object | Delete | 删除按钮图标 |
| hasRemoveType | String | 'danger' | 删除按钮类型 |
| hasAdd | Boolean/String/Function | '新增' | 显示新增按钮 |
| hasAddIcon | Object | Plus | 新增按钮图标 |
| hasAddSon | Boolean/String/Function | '新增' | 显示新增子节点按钮 |
| hasAddSonIcon | Object | Plus | 新增子节点按钮图标 |
| hasAddSonType | String | 'primary' | 新增子节点按钮类型 |
| hasBatchRemove | Boolean/String/Function | true | 显示批量删除按钮 |
| hasBatchRemoveIcon | Object | Delete | 批量删除按钮图标 |
| hasBatchRemoveType | String | 'danger' | 批量删除按钮类型 |
| hasImport | Boolean/String/Function | true | 显示导入按钮 |
| hasImportIcon | Object | Upload | 导入按钮图标 |
| hasExport | Boolean/String/Function | true | 显示导出按钮 |
| hasExportIcon | Object | Download | 导出按钮图标 |
| hasTableTopPlain | Boolean | true | 表格顶部按钮 Plain |
| moreButton | String | '更多' | 更多按钮文本 |
| moreButtonType | String | 'primary' | 更多按钮类型 |
| moreButtonTrigger | String | 'hover' | 更多按钮触发方式 |
| isTree | Boolean/Object | false | 树形结构配置 |
| lazy | Boolean | true | 懒加载 |
| defaultExpandAll | Boolean | false | 树形结构默认展开所有节点 |
| loadFun | Function | undefined | 懒加载数据加载函数 |
| treeProps | Object | { children: 'children', hasChildren: 'hasChildren' } | 树形结构配置 |
| tableColumn | Array | 必填 | 表格列配置 |
| dataListFun | Function | undefined | 数据加载函数 |
| dataConfig | Object | { rows: 'rows', total: 'total', extra: 'extra' } | 数据格式配置 |
| total | Number | 0 | 数据总数 |
| removeMessage | String | '您确定删除该数据吗? 警告:该操作不可逆,请慎重操作' | 删除提示 |
| removeType | String | 'warning' | 删除弹窗类型 |
| removeMessageTitle | String | '警告' | 删除弹窗标题 |
| exportMessage | String/Boolean | '是否确认导出数据?' | 导出提示 |
| exportType | String | 'warning' | 导出弹窗类型 |
| exportMessageTitle | String | '提示' | 导出弹窗标题 |
| highlightCurrentRow | Boolean | false | 是否高亮当前行 |
| currentRowKey | String/Number | '' | 当前行的 key |
| rowClassName | String/Function | '' | 行的 className 回调 |
| rowStyle | Object/Function | {} | 行的 style 回调 |
| cellClassName | String/Function | '' | 单元格 className 回调 |
| cellStyle | Object/Function | {} | 单元格 style 回调 |
| headerRowClassName | String/Function | '' | 表头行 className 回调 |
| headerRowStyle | Object/Function | {} | 表头行 style 回调 |
| headerCellClassName | String/Function | '' | 表头单元格 className 回调 |
| headerCellStyle | Object/Function | {} | 表头单元格 style 回调 |
| rowKey | String/Function | '' | 行数据的 Key |
| emptyText | String | '没有数据' | 空数据提示文本 |
| duration | Number | 1500 | 提示时长 |
| message | String | '操作成功' | 成功提示文本 |
| defaultBlock | String | '-' | 默认空白占位符 |
| status | Number/Boolean/String | 200 | 成功状态码 |
| code | String | 'code' | 状态码字段 |
| downFun | Function | undefined | 导出下载方法 |
| sortable | Boolean | true | 是否支持排序 |
| sortableConfig | Object | { descending: 'descending', ascending: 'ascending' } | 排序配置 |
| searchSortableConfig | Object | { fieId: 'fieId', fieVal: 'fieVal' } | 搜索排序配置 |
| simpTransVar | Number | 0 | 简化转换变量 |

> tableColumn 字段

| 字段 | 类型 | 默认值 | 说明 |
|:-----|:-----|:-----|:-----|
| prop | String | 必填 | 列绑定的字段，支持 `a.b.c` 访问嵌套属性，支持 `,`、`~`、`-`、`/` 分隔符组合多个字段 |
| label | String | 必填 | 列显示的文本 |
| isTable | Boolean | true | 是否是表格使用 |
| isForm | Boolean | false | 是否是表单使用 |
| showOverflow | Boolean | true | 超长省略 |
| width | Number | 100 | 列宽 |
| unit | String/Function | '' | 单位 |
| sort | Boolean/String | false | 是否可排序 |
| sortable | Boolean/String | false | 是否可排序 |
| sortProp | String | prop | 排序字段映射 |
| hidden | Boolean | false | 是否隐藏 |
| visible | Boolean | true | 是否可见 |
| align | String | 'center' | 对齐方式 |
| fixed | Boolean/String | false | 固定列 |
| selectable | Boolean | true | 是否可选 |
| maxWidth | Boolean | true | 是否最大宽度 |
| decimalPlaces | Number | 0 | 小数位数 |
| fun | Function | 内置方法 | 显示内容方法，支持 `(row, prop, { renderTxt }) => renderTxt(row[prop])` 用法 |
| funDom | Function | — | 显示内容组件方法 |
| type | String | — | 数据类型 |
| classFun | Function | — | 定制类 |
| showFun | Function | — | 是否显示 |
| slot | String | — | 插槽名（当 prop 与插槽名不一致时使用） |
| header | String/Function | — | 自定义表头 |
| list | Array | — | 子列配置（多级表头） |

**prop 特殊用法：**

- 嵌套对象：`prop: 'user.profile.name'` 访问 `user.profile.name`
- 多字段组合：支持 `,`、`~`、`-`、`/` 作为分隔符，如 `prop: 'createTime~endTime'`

2. 事件

| 事件名 | 触发时机 | 参数 | 说明 |
|:-------- |:-----|:-----|:-----|
| add | 新增按钮点击 | — | 新增事件 |
| update | 修改按钮点击 | row | 修改事件 |
| detail | 详情按钮点击 | row | 详情事件 |
| remove | 删除按钮点击 | row, callback | 删除事件（callback 传入接口 Promise） |
| batch-remove | 批量删除点击 | selectedRows, callback | 批量删除事件 |
| export | 导出按钮点击 | exportData, callback | 导出事件 |
| import | 导入按钮点击 | callback | 导入事件 |
| add-son | 新增子节点点击 | parentRow, callback | 新增子节点事件 |
| custom-event | 调用 handleNeedConfirmEvent 后用户确认时触发 | { eventName, data }, callback | 自定义需要确认的事件 |
| expand-change | 树形表格展开/折叠 | row, expanded | 展开/折叠事件 |
| current-change | 当前行变化 | row | 当前行变化事件 |

3. 插槽

| 插槽名 | 说明 | 参数 |
|:---|:----|:----|
| header | 表格上方区域 | — |
| tableOperation | 表格上方操作按钮区域 | data, loading, plain |
| empty | 空数据内容 | — |
| operationBefore | 操作列前置内容 | data, index, text, link, loading |
| operationAfterAddSon | 新增子节点后置内容 | data, index, text, link, loading |
| operationAfterDetail | 详情后置内容 | data, index, text, link, loading |
| operationAfterUpdate | 修改后置内容 | data, index, text, link, loading |
| operationAfter | 操作列后置内容 | data, index, text, link, loading |
| addSon | 自定义新增子节点按钮 | data, index, text, link, loading |
| detail | 自定义详情按钮 | data, index, text, link, loading |
| update | 自定义修改按钮 | data, index, text, link, loading |
| remove | 自定义删除按钮 | data, index, text, link, loading |
| ${prop} | 表格列自定义内容 | row, prop, index, nowData, loading |

4. 使用

```html
<MyTable
  ref="tableRef"
  :table-column="tableColumns"
  :data-list-fun="getList"
  :base-class="'.app-main'"
  @add="handleAdd"
  @update="handleEdit"
  @detail="handleDetail"
  @remove="handleDelete"
  @export="handleExport"
  @custom-event="handleCustomEvent"
>
  <template #status="{ row }">
    <el-tag :type="row.status === 1 ? 'success' : 'danger'">
      {{ row.status === 1 ? '启用' : '禁用' }}
    </el-tag>
  </template>
  
  <template #operationAfter="{ data, loading }">
    <el-button 
      link 
      type="primary" 
      :loading="loading"
      @click="handleCustomAction(data, tableRef)"
    >
      重置密码
    </el-button>
  </template>
</MyTable>
```

```javascript
import { ref } from 'vue'

const tableRef = ref(null)
const editDialogRef = ref(null)
const detailDialogRef = ref(null)

const tableColumns = ref([
  { prop: 'userName', label: '用户名', width: 120, fixed: 'left' },
  { prop: 'user.profile.email', label: '邮箱', width: 200 },
  { prop: 'age', label: '年龄', width: 80, align: 'center' },
  { prop: 'status', label: '状态', width: 100 },
  { 
    prop: 'createTime~endTime', 
    label: '有效期', 
    width: 200 
  },
  { 
    prop: 'createTime', 
    label: '创建时间', 
    width: 180,
    fun: (row, prop, { renderTxt }) => renderTxt(row[prop])
  },
  { prop: 'remark', label: '备注' }
])

const getList = (params, callback) => {
  callback(
    new Promise((resolve) => {
      fetchUserList(params).then(res => {
        resolve({ rows: res.data, total: res.total })
      }).catch(() => {
        resolve({ rows: [], total: 0 })
      })
    })
  )
}

const handleAdd = () => {
  editDialogRef.value?.init({})
}

const handleEdit = (row) => {
  editDialogRef.value?.init(row)
}

const handleDetail = (row) => {
  detailDialogRef.value?.init(row)
}

const handleDelete = (row, callback) => {
  callback(deleteUser(row.id))
}

const handleExport = (exportData, callback) => {
  callback('/api/export', exportData, '用户数据.xlsx', 'post')
}

const handleCustomAction = (row, tableRef) => {
  tableRef?.handleNeedConfirmEvent({
    data: row,
    eventName: 'resetPassword',
    message: '确认重置该用户的密码吗？',
    iconType: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    title: '提示'
  })
}

const handleCustomEvent = ({ eventName, data }, callback) => {
  if (eventName === 'resetPassword') {
    callback(resetPassword(data.id))
  }
}
```

---

## 虚拟表格 (MyTableV2)

基于 `el-table-v2` 实现的虚拟滚动表格，适用于大数据量场景，API 与 MyTable 基本一致。

| 属性名 | 类型 | 默认值 | 说明 |
|:-------- |:-----|:-----|:-----|
| width | Number | undefined | 表格宽度 |
| rowHeight | Number | 50 | 行高 |

其他属性、事件、插槽与 MyTable 相同。

---

## 详情 (MyDetail)

1. 属性

| 属性名 | 类型 | 默认值 | 说明 |
|:-------- |:-----|:-----|:-----|
| language | Object | zhCn | 语言包 |
| width | String | '50%' | 弹框宽度 |
| title | String | '详情' | 弹框标题（可选） |
| desBorder | Boolean | false | 描述列表是否带有边框 |
| desColumn | Number | 2 | 描述列表列数 |
| desDirection | String | 'horizontal' | 排列方向 |
| desSize | String | '' | 描述列表尺寸 |
| desTitle | String | '' | 描述列表标题文本 |
| desExtra | String | '' | 描述列表操作区文本 |
| column | Array | 必填 | 详情列配置 |
| defaultBlock | String | '-' | 默认空白占位符 |
| dataConfig | Object | { data: 'data', status: 200, code: 'code' } | 数据格式配置 |

> column 字段

| 字段 | 类型 | 默认值 | 说明 |
|:-----|:-----|:-----|:-----|
| prop | String | 必填 | 绑定的字段 |
| label | String | 必填 | 显示的文本 |
| span | Number | 1 | 列的数量 |
| rowspan | Number | 1 | 跨行的数量 |
| width | Number | — | 列宽度 |
| minWidth | Number | — | 列最小宽度 |
| align | String | 'left' | 对齐方式 |
| labelAlign | String | — | 标签对齐方式 |
| fun | Function | 内置方法 | 显示内容方法 |
| classFun | Function | — | 定制类 |
| className | String | — | 内容自定义类名 |
| labelClassName | String | — | 标签自定义类名 |
| showFun | Function | — | 是否显示 |
| list | Array | — | 子项配置 |
| unit | String/Function | '' | 单位 |
| decimalPlaces | Number | 0 | 小数位数 |
| useRander | Boolean | false | 是否使用渲染函数 |

2. 插槽

| 插槽名 | 说明 | 参数 |
|:---|:----|:----|
| left | 左侧区域 | data |
| right | 右侧区域 | data |
| footer | 底部区域 | data |
| label_${prop} | 单项的标签 | prop, nowData, row |
| ${prop} | 单项的内容 | prop, nowData, row |

3. 使用

```html
<MyDetail ref="detailRef" :column="detailColumns"></MyDetail>
```

```javascript
const detailRef = ref(null)

const detailColumns = ref([
  { prop: 'userName', label: '用户名', span: 1 },
  { prop: 'email', label: '邮箱', span: 1 },
  { 
    prop: 'status', 
    label: '状态',
    fun: (row) => row.status === 1 ? '启用' : '禁用'
  },
  { 
    prop: 'createTime', 
    label: '创建时间',
    fun: (row, prop, { renderTxt }) => renderTxt(row[prop])
  }
])

const handleDetail = (row) => {
  detailRef.value?.init(row)
}
```

---

## 新增/修改 (MyEdit)

1. 属性

| 属性名 | 类型 | 默认值 | 说明 |
|:-------- |:-----|:-----|:-----|
| language | Object | zhCn | 语言包 |
| notNeedChangeCheck | Array | ['input', 'inputNumber'] | 不需要触发变更检查的类型 |
| submitButtonTxt | Object | { add: '提交', edit: '修改' } | 提交按钮文本 |
| cancelButtonTxt | String | '取消' | 取消按钮文本 |
| width | String | '50%' | 弹框宽度 |
| title | Object | { add: '新增', edit: '编辑' } | 弹框标题 |
| column | Array | 必填 | 编辑列配置 |
| inline | Boolean | false | 行内表单模式 |
| labelPosition | String | 'right' | 表单域标签位置 |
| labelWidth | String/Number | 'auto' | 标签长度 |
| labelSuffix | String | '' | 表单域标签后缀 |
| hideRequiredAsterisk | Boolean | false | 隐藏必填星号 |
| requireAsteriskPosition | String | 'left' | 星号位置 |
| showMessage | Boolean | true | 是否显示错误信息 |
| inlineMessage | Boolean | false | 行内形式显示错误信息 |
| statusIcon | Boolean | false | 显示反馈图标 |
| validateOnRuleChange | Boolean | true | rules 改变后立即触发 |
| size | String | '' | 表单内组件尺寸 |
| disabled | Boolean | false | 禁用所有组件 |
| scrollToError | Boolean | false | 滚动到第一个错误表单 |
| duration | Number | 1500 | 提示时长 |
| message | String | '操作成功' | 成功提示文本 |
| autoUpdate | Function | undefined | 操作成功后自动调用（可用于刷新表格） |
| status | Number/Boolean/String | 200 | 成功状态码 |
| code | String | 'code' | 状态码字段 |
| dataConfig | Object | { data: 'data', status: 200, code: 'code' } | 数据格式配置 |

> column 字段支持类型：`inputInnerType` | `dateInnerType` | `selectInnerType` | `switchInnerType` | `checkboxInnerType` | `radioInnerType` | `fileInnerType`

2. 事件

| 事件名 | 触发时机 | 参数 | 说明 |
|:-------- |:-----|:-----|:-----|
| submit | 确定按钮点击 | data, callback | 保存事件 |
| close | 弹窗关闭 | — | 关闭事件 |

3. 插槽

| 插槽名 | 说明 | 参数 |
|:---|:----|:----|
| left | 表单左侧区域 | data |
| right | 表单右侧区域 | data |
| footer | 底部按钮区域 | loading, data, orginaData |
| submitFooter | 提交按钮区域 | loading, data, orginaData |
| errorData | 错误信息区域 | data |
| item_${prop} | 表单项包装 | prop, data |
| ${prop} | 输入框内容 | prop, data, config |
| label_${prop} | 标签内容 | prop, data |
| error_${prop} | 错误信息内容 | prop, data |

4. 使用

```html
<MyEdit
  ref="editRef"
  :column="editColumns"
  :label-width="'100px'"
  :auto-update="refreshTable"
  @submit="handleSubmit"
/>
```

```javascript
const editRef = ref(null)

const editColumns = ref([
  {
    prop: 'userName',
    label: '用户名',
    type: 'input',
    inputType: 'text',
    isRequired: true,
    maxlength: 50
  },
  {
    prop: 'email',
    label: '邮箱',
    type: 'input',
    inputType: 'text',
    isRequired: true
  },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    options: [
      { label: '启用', value: 1 },
      { label: '禁用', value: 0 }
    ],
    isRequired: true,
    isDefault: true
  },
  {
    label: '有效期',
    prop: 'dateRange',
    type: 'date',
    dateType: 'daterange',
    aliases: 'startDate,endDate',
    isRequired: true
  },
  {
    label: '年份',
    prop: 'years',
    type: 'date',
    dateType: 'years'
  },
  {
    label: '角色',
    prop: 'roles',
    type: 'select',
    multiple: true,
    valueType: 'string',
    options: [
      { label: '管理员', value: 'admin' },
      { label: '普通用户', value: 'user' }
    ]
  }
])

const refreshTable = () => {
  tableRef.value?.query()
}

const handleSubmit = (data, callback) => {
  callback(saveUser(data))
}

const handleAdd = () => {
  editRef.value?.init({})
}

const handleEdit = (row) => {
  editRef.value?.init(row)
}
```

---

## 导入 (MyImport)

1. 属性

| 属性名 | 类型 | 默认值 | 说明 |
|:-------- |:-----|:-----|:-----|
| errorColumn | Array | [] | 错误信息表格列配置 |

其他属性继承 MyEdit。

2. 事件

| 事件名 | 触发时机 | 参数 | 说明 |
|:-------- |:-----|:-----|:-----|
| submit | 确定按钮点击 | data, callback | 导入事件 |
| close | 弹窗关闭 | — | 关闭事件 |

3. 使用

```html
<MyImport
  ref="importRef"
  :column="importColumns"
  :error-column="errorColumns"
  @submit="handleImport"
/>
```

```javascript
const importRef = ref(null)

const importColumns = ref([
  {
    prop: 'file',
    label: '导入文件',
    type: 'file',
    accept: '.xlsx,.xls',
    limitSize: 10,
    hasTemplate: '/template/import-template.xlsx'
  }
])

const errorColumns = ref([
  { prop: 'rowNum', label: '行号', width: 80 },
  { prop: 'errorMsg', label: '错误信息', width: 300 }
])

const handleImport = (data, callback) => {
  const formData = new FormData()
  formData.append('file', data.file)
  callback(importExcel(formData))
}

const openImport = () => {
  importRef.value?.init({})
}
```

---

## 弹框 (MyDialog)

1. 属性

| 属性名 | 类型 | 默认值 | 说明 |
|:-------- |:-----|:-----|:-----|
| title | String | — | 弹框标题 |
| width | Number/String | '50%' | 弹框宽度 |

2. 事件

| 事件名 | 参数 | 说明 |
|:-------- |:-----|:-----|
| beforeClose | callback: () => void | 弹窗关闭前事件 |

3. 插槽

| 插槽名 | 参数 | 说明 |
|:---|:----|:----|
| inner | { innerData } | 弹窗内容区域 |
| footer | — | 弹窗底部区域 |

4. 使用

```html
<MyDialog ref="dialogRef" title="弹窗标题">
  <template #inner="{ innerData }">
    <div>{{ innerData }}</div>
  </template>
</MyDialog>
```

```javascript
const dialogRef = ref(null)

const openDialog = (data) => {
  dialogRef.value?.init(data)
}
```

---
## Echarts 图表组件

基于 ECharts 封装的图表组件，支持图表联动功能（图例、tooltip、点击联动）。

1. 属性

| 属性名 | 类型 | 默认值 | 说明 |
|:-------- |:-----|:-----|:-----|
| options | Object | {} | ECharts 图表配置项 |
| listen | String | '.main-container' | 监听容器选择器，当该容器大小改变时自动缩放图表 |
| width | String | '100%' | 图表宽度 |
| height | String | '400px' | 图表高度 |
| chartId | String | null | 图表唯一标识，传入时自动开启联动功能 |
| linkageGroup | String | 'default' | 联动组名称，同一组的图表可相互联动（页面只有一个联动组时可忽略） |

2. 事件

| 事件名 | 触发时机 | 参数 | 说明 |
|:-------- |:-----|:-----|:-----|
| chart-ready | 图表初始化完成 | chartId, chart | 图表准备就绪事件 |

3. 暴露的方法

| 方法名 | 参数 | 说明 |
|:-------- |:-----|:-----|
| chart | — | 获取 ECharts 实例(可能不正确,建议通过@chart-ready 事件获取) |
| resize | — | 手动调整图表大小 |

4. 联动功能说明

当满足以下条件时，图表之间会实现联动效果（图例联动、Tooltip 联动、点击联动）：

- 传入 `chartId`（同一页面内需唯一）
- 多个图表使用相同的 `linkage-group`（页面只有一个联动组时可忽略，使用默认值即可）
- **同一联动组内的图表实例数量大于 2**

> **注意**：
> - 传递 `chartId` 即自动开启联动功能
> - 页面只有一个联动组时，`linkageGroup` 可忽略，使用默认值 `'default'` 即可
> - 用户需自行保证 `chartId` 在同一页面内是唯一的
> - 联动效果需要同一组内至少有 2 个图表实例才会生效

5. 使用

```html
<!-- 不开启联动（未传入 chartId） -->
<Echarts 
  :options="chartOptions" 
  height="350px" 
  width="100%" 
/>

<!-- 开启联动：只需传递 chartId（使用默认联动组） -->
<Echarts 
  :chart-id="'chart-a'" 
  :options="chartAOptions" 
  height="350px" 
  width="100%" 
  @chart-ready="handleChartReady"
/>

<!-- 开启联动：指定联动组 -->
<Echarts 
  :chart-id="'chart-b'" 
  :options="chartBOptions" 
  linkage-group="my-group" 
  height="350px" 
  width="100%" 
/>
```

```javascript
import { ref } from 'vue'

const chartAOptions = ref({
  title: { text: '销售趋势' },
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月'] },
  yAxis: { type: 'value' },
  series: [{ type: 'line', data: [120, 200, 150, 80] }]
})

const handleChartReady = (chartId, chart) => {
  console.log(`图表 ${chartId} 初始化完成`, chart)
}
```

# 子组件

## 公共参数

以下属性为各表单子组件（Input、Select、Date、Checkbox、Radio、Switch、File）的通用配置。

| 属性名 | 类型 | 说明 | 默认值 |
|----|----|----|----|
| prop | String | model 的键名 | 必填 |
| label | String | 标签 | 必填 |
| type | String | 表单项类型（input/select/date/switch/checkbox/radio/file） | 必填 |
| labelPosition | String | 表单域标签的位置 | — |
| labelWidth | String/Number | 标签宽度 | — |
| isForm | Boolean | 表单字段 | false |
| isTable | Boolean | 表格字段 | false |
| error | String | 表单域验证错误时的提示信息 | — |
| showMessage | Boolean | 是否显示校验错误信息 | — |
| inlineMessage | String/Boolean | 是否在行内显示校验信息 | — |
| span | Number | 栏宽度 | — |
| for | String | 和原生标签相同能力 | — |
| validateStatus | String | formitem 校验的状态 | — |
| isDefault | Boolean | 是否有默认选中 | false |
| isRequired | Boolean/Function | 是否必填 | false |
| size | String | 组件尺寸 | — |
| disabled | Boolean/Function | 是否禁用 | false |
| clearable | Boolean | 是否有清除按钮 | true |
| readonly | Boolean | 只读 | false |

> **isDefault 行为说明**：
> - Checkbox/Radio/Select：自动选中第一个可用选项
> - Date：单个日期设为当前时间；日期范围设为今天 00:00:00 到 23:59:59

---

## 输入框 (Input)

| 属性名 | 类型 | 默认值 | 说明 |
|----|----|----|----|
| inputType | String | 'text' | 输入框类型（text/textarea/password/number/numberRange） |
| maxlength | Number | 50 | 最大输入长度 |
| minlength | Number | — | 最小输入长度 |
| showWordLimit | Boolean | false | 是否显示统计字数 |
| placeholder | String | '请输入' + label | 输入框占位文本 |
| showPassword | Boolean | false | 是否显示切换密码图标 |
| prefixIcon | String | — | 自定义前缀图标 |
| suffixIcon | String | — | 自定义后缀图标 |
| rows | Number | 2 | 输入框行数 |
| autosize | Boolean/Object | false | textarea 高度自适应 |
| autocomplete | String | 'off' | 原生 autocomplete 属性 |
| name | String | — | 原生 name 属性 |
| max | Number | — | 最大值 |
| min | Number | — | 最小值 |
| step | Number | — | 合法数字间隔 |
| resize | String | — | 控制缩放 |
| autofocus | Boolean | false | 自动获取焦点 |
| form | String | — | 原生 form 属性 |
| validateEvent | Boolean | true | 输入时是否触发表单校验 |
| inputStyle | Object | {} | 输入框样式 |
| integerPlaces | Number | 10 | 整数位数（numberRange） |
| decimalPlaces | Number | 2 | 小数位数（numberRange/number） |

---

## 下拉框 (Select)

| 属性名 | 类型 | 默认值 | 说明 |
|----|----|----|----|
| type | String | '' | 类型（'' / group） |
| options | Array/Number | 必填 | 选项配置 |
| multiple | Boolean | false | 是否多选 |
| filterable | Boolean | false | 是否可筛选 |
| remote | Boolean | false | 是否远程加载 |
| remoteMethod | Function | — | 远程搜索方法 |
| extraParams | Object | {} | 额外参数（自动传递到 remoteMethod） |
| clearable | Boolean | false | 是否可清空 |
| collapseTags | Boolean | false | 多选时是否折叠 |
| multipleLimit | Number | 0 | 最多选择数量 |
| loading | Boolean | false | 是否加载中 |
| valueType | String | — | 值类型（为 'string' 时转为逗号分隔字符串） |

**远程搜索示例：**

```javascript
{
  label: '设备编号',
  prop: 'vehicleId',
  type: 'select',
  options: [],
  filterable: true,
  remote: true,
  remoteMethod: querySearchAllAsync,
  extraParams: { typeCode: 'DJ6' }
}
```

```javascript
const querySearchAllAsync = (keyword, callback, extraParams) => {
  fetchDeviceList({ keyword, ...extraParams }).then(res => {
    callback(res.data)
  })
}
```

---

## 日期选择 (Date)

| 属性名 | 类型 | 默认值 | 说明 |
|----|----|----|----|
| dateType | String | 'datetimerange' | 日期类型（year/years/month/date/dates/datetime/week/time/timerange/daterange/monthrange/datetimerange） |
| valueFormat | String | 自动推断 | 绑定值格式 |
| format | String | 同 valueFormat | 显示格式 |
| aliases | String | — | 范围字段别名（用于拆分字段） |
| startPlaceholder | String | '开始日期' | 开始占位符 |
| endPlaceholder | String | '结束日期' | 结束占位符 |
| rangeSeparator | String | '-' | 范围分隔符 |

---

## 开关 (Switch)

| 属性名 | 类型 | 默认值 | 说明 |
|----|----|----|----|
| activeValue | Any | true | 开启时的值 |
| inactiveValue | Any | false | 关闭时的值 |
| activeText | String | — | 开启时的文本 |
| inactiveText | String | — | 关闭时的文本 |
| loading | Boolean | false | 是否加载中 |
| disabled | Boolean | false | 是否禁用 |

---

## 多选框 (Checkbox)

| 属性名 | 类型 | 默认值 | 说明 |
|----|----|----|----|
| type | String | 'checkbox' | 类型（checkbox / checkboxButton） |
| options | Array/Number | 必填 | 选项配置 |
| min | Number | 0 | 最小选择数量 |
| max | Number | 选项数量 | 最大选择数量 |
| valueType | String | — | 值类型（为 'string' 时转为逗号分隔字符串） |

---

## 单选框 (Radio)

| 属性名 | 类型 | 默认值 | 说明 |
|----|----|----|----|
| type | String | 'radio' | 类型（radio / radioButton） |
| options | Array/Number | 必填 | 选项配置 |
| valueType | String | — | 值类型 |

---

## 文件上传 (File)

| 属性名 | 类型 | 默认值 | 说明 |
|----|----|----|----|
| accept | String | — | 接受的文件类型 |
| limitSize | Number | 2 | 文件大小限制（MB） |
| limitNum | Number | 1 | 最大文件数量 |
| hasTemplate | String | — | 模板下载地址 |
| drag | Boolean | false | 是否支持拖拽 |
| autoUpload | Boolean | true | 是否自动上传 |

---

# 数据转换功能

在 MyEdit 和 MyForm 组件中，支持以下数据自动转换：

| 组件 | 条件 | 转换结果 |
|:-----|:-----|:-----|
| Date | dateType 包含 range + aliases | 拆分为多个字段（按 aliases） |
| Date | dateType 最后一个字符为 s（如 years、dates） | 转为逗号分隔字符串 |
| Select | multiple + valueType = 'string' | 转为逗号分隔字符串 |
| Checkbox | valueType = 'string' | 转为逗号分隔字符串 |
| Input | multiple: true + aliases | 拆分为独立字段 |
| Input | multiple: false | 转为逗号分隔字符串 |

> **注意**：Select 多选不支持 aliases 拆分为独立字段。

