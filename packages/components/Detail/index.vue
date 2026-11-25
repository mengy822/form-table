<script setup lang="ts">
import { markRaw, ref, nextTick, computed, h, Fragment, onBeforeUnmount, useSlots, useAttrs, type VNode, type Component, type Slot } from 'vue';
import { ElDescriptions, ElDescriptionsItem, ElButton } from 'element-plus';
import type { DescriptionsItemProps } from 'element-plus';
import { deepClone, getDomComputed, getComputedStyle } from '../js/utils';
import MyDialog from '../Dialog/index.vue';
import type { dataItemType, ObjectType } from '../js/types';
import type { tableColumnItem } from '../Table/index.vue';
import { formatDisplayContent } from '../utils';

// ============ 类型定义 ============
type MyDialogInstance = InstanceType<typeof MyDialog>;

type DataRecord = Record<string, unknown>;
type ColumnItem = tableColumnItem & {
  useRander?: boolean;
  /** 嵌套子列 */
  list?: ColumnItem[];
  /** 自定义跨度 */
  span?: number;
  /** 跨行 */
  rowspan?: number;
  /** 自定义单元格宽度 */
  width?: string;
  /** 内容对齐 */
  align?: 'left' | 'center' | 'right';
  /** label对齐 */
  labelAlign?: 'left' | 'center' | 'right';
  /** 单元格class */
  className?: string;
  /** label class */
  labelClassName?: string;
  /** 自定义格式化函数 */
  fun?: (row: DataRecord, prop: string, other?: DataRecord) => string;
  /** 自定义渲染组件 */
  funDom?: (row: dataItemType, prop: string, other: DataRecord) => VNode;
  /** 动态class函数 */
  classFun?: (row: DataRecord, prop: string, other?: DataRecord) => string;
  /** 是否显示 */
  showFun?: (row: DataRecord, prop: string) => boolean;
  /** 小数位数 */
  decimalPlaces?: number;
  /** 单位 */
  unit?: string;
  /** 嵌套内部单独配置 column */
  desColumn?: number;
  /** 嵌套内部单独配置 labelWidth */
  labelWidth?: string;
};
type ProcessedColumnItem = ColumnItem & { colIndex: number };

// 分隔符类型
const SEPARATORS = [',', '~', '-', '/'] as const;
type Separator = (typeof SEPARATORS)[number];

// 嵌套描述配置
interface NestedDescriptionsConfig {
  border?: boolean;
  column?: number;
  direction?: 'vertical' | 'horizontal';
  size?: '' | 'large' | 'default' | 'small';
}

// ============ 导出 expose 类型 ============
export interface MyDetailExposed {
  /** 初始化详情数据 */
  init: (data: DataRecord | Promise<unknown>, openCb?: (data: DataRecord) => void) => Promise<void>;
  /** 关闭详情弹窗 */
  close: () => void;
  /** 更新指定字段的数据 */
  updateData: <T = unknown>(prop: string, data: T) => void;
  /** 获取指定字段的数据 */
  getData: <T = unknown>(prop: string) => T | undefined;
}

// ============ Props 定义 ============
const props = withDefaults(
  defineProps<{
    width?: string;
    labelWidth?: string;
    title?: string;
    desBorder?: boolean;
    closeOnClickModal?: boolean;
    desColumn?: number;
    desDirection?: 'vertical' | 'horizontal';
    sonDirection?: 'vertical' | 'horizontal';
    desSize?: '' | 'large' | 'default' | 'small';
    desTitle?: string;
    desExtra?: string;
    column: ColumnItem[];
    defaultBlock?: string;
    dataConfig?: { data: string; status: string | number | boolean; code: string };
    nestedDefaultBorder?: boolean;
  }>(),
  {
    width: '50%',
    labelWidth: '80px',
    title: '详情',
    desBorder: false,
    closeOnClickModal: false,
    desColumn: 2,
    desDirection: 'horizontal',
    sonDirection: 'vertical',
    desSize: '',
    desTitle: '',
    desExtra: '',
    defaultBlock: '-',
    dataConfig: () => ({ data: 'data', status: 200, code: 'code' }),
    nestedDefaultBorder: true
  }
);

// ============ Emits 定义 ============
const emit = defineEmits<{
  close: [data?: DataRecord];
}>();

// ============ 获取 slots 和 attrs ============
const slots = useSlots();
const attrs = useAttrs();

// ============ 响应式数据 ============
const myDialog = ref<MyDialogInstance | null>(null);
const dataFinal = ref<DataRecord>({});
const maxWidth = ref<string>('400px');
const componentCache = ref<Map<string, Component>>(new Map());

// ============ 工具函数 ============
/** 判断是否为有效嵌套列表 */
const isValidNestedList = (list: unknown): list is ColumnItem[] => {
  return Array.isArray(list) && list.length > 0;
};

/** 根据路径取值 */
const getValueByPath = (obj: unknown, path: string): unknown => {
  if (!path) return undefined;
  if (path.indexOf('.') === -1) {
    return (obj as DataRecord)?.[path];
  }
  const keys = path.split('.');
  let result: unknown = obj;
  for (const key of keys) {
    if (result === null || result === undefined) return undefined;
    result = (result as DataRecord)?.[key];
  }
  return result;
};

// ============ 计算属性 ============
const display = computed((): 'grid' | 'block' => {
  return slots.left || slots.right ? 'grid' : 'block';
});

const gridTemplateColumns = computed((): string => {
  return `${slots.left ? 'auto ' : ''}1fr${slots.right ? ' auto' : ''}`;
});

const hasNestedItems = computed((): boolean => {
  return columnFinal.value.some((item) => isValidNestedList(item.list));
});

const desBorder = computed((): boolean => {
  return props.desBorder || hasNestedItems.value;
});

// ============ 核心方法 ============
/** 创建缓存自定义渲染组件 */
const createMarkRaw = (
  myRender: NonNullable<tableColumnItem['funDom']>,
  data: dataItemType,
  prop: string,
  other: DataRecord = {}
): Component => {
  const cacheKey = `${prop}_${JSON.stringify(Object.keys(data))}`;
  if (componentCache.value.has(cacheKey)) {
    return componentCache.value.get(cacheKey)!;
  }

  const innerother: DataRecord & {
    loading: boolean;
    renderTxt: (context: string | number | boolean) => string | number | boolean;
  } = {
    ...other,
    ...attrs,
    loading: false,
    renderTxt: (context: string | number | boolean): string | number | boolean => context ?? props.defaultBlock
  };

  const component = markRaw({
    render() {
      return myRender(data, prop, innerother);
    }
  });

  componentCache.value.set(cacheKey, component);
  return component;
};

/** 多字段分隔拼接 */
const getSplitColumnData = (
  column: tableColumnItem,
  rowData: DataRecord,
  separator: Separator,
  other?: DataRecord
): { content: string; classNames: string } => {
  const itemprops = column.prop.split(separator);
  const contents: string[] = [];
  const classNamesList: string[] = [];

  itemprops.forEach((propPath: string) => {
    let value: unknown;
    if (column.fun) {
      value = column.fun(rowData, propPath.trim(), other);
    } else {
      value = getValueByPath(rowData, propPath.trim());
    }

    const content = formatDisplayContent({
      value,
      decimalPlaces: column.decimalPlaces,
      defaultBlock: props.defaultBlock,
      unit: column.unit,
      rowData,
      other,
      prop: propPath
    });

    contents.push(content);
    if (column.classFun) {
      const className = column.classFun(rowData, propPath.trim(), other) || '';
      if (className) classNamesList.push(className);
    }
  });

  return {
    content: contents.join(separator),
    classNames: classNamesList.join(separator)
  };
};

/** 获取字段展示内容与class */
const getColumnData = (
  columnItem: tableColumnItem,
  rowData: DataRecord = dataFinal.value,
  other?: DataRecord
): { content: string; classNames: string } => {
  if (isValidNestedList(columnItem.list)) {
    return { content: '', classNames: '' };
  }

  const nowSeparator = SEPARATORS.find((item) => columnItem.prop.indexOf(item) > -1);

  if (nowSeparator) {
    return getSplitColumnData(columnItem, rowData, nowSeparator, other);
  }

  let content: string;
  if (columnItem.fun) {
    const result = columnItem.fun(rowData, columnItem.prop, other);
    content = result ?? props.defaultBlock;
  } else {
    const value = getValueByPath(rowData, columnItem.prop);
    content = formatDisplayContent({
      value,
      decimalPlaces: columnItem.decimalPlaces,
      defaultBlock: props.defaultBlock,
      unit: columnItem.unit,
      rowData,
      other,
      prop: columnItem.prop
    });
  }

  let classNames = '';
  if (columnItem.classFun) {
    classNames = columnItem.classFun(rowData, columnItem.prop, other) || '';
  }

  return { content, classNames };
};

/** 判断是否存在嵌套子项 */
const hasNestedData = (item: tableColumnItem): item is tableColumnItem & { list: ColumnItem[] } => {
  return isValidNestedList(item.list);
};

/** 简单渲染错误捕获 */
const withErrorBoundary = (renderFn: () => VNode | null, fallback?: VNode): VNode | null => {
  try {
    const result = renderFn();
    return result !== null && result !== undefined ? result : fallback || null;
  } catch (error) {
    console.error('渲染错误:', error);
    return fallback || h('div', { class: 'render-error', style: { color: 'red' } }, '渲染失败');
  }
};

/** 预处理列，补齐span、索引、嵌套 */
const processColumnsWithPosition = (
  columns: ColumnItem[],
  startIndex: number = 0,
  nest: boolean = false,
  nowDesColumn: number = props.desColumn
): ProcessedColumnItem[] => {
  const result: ProcessedColumnItem[] = [];
  let currentIndex = startIndex;
  let desColumnCount = 0;

  for (let i = 0; i < columns.length; i++) {
    const item = { ...columns[i] } as ColumnItem & { colIndex?: number };
    const hasNested = hasNestedData(item);

    item.align = item.align ?? 'left';

    if (hasNested) {
      if (result.length > 0 && !nest) {
        const prevItem = result[result.length - 1];
        const remainingSpan = nowDesColumn - desColumnCount;

        result[result.length - 1] = {
          ...prevItem,
          span: remainingSpan + (prevItem.span || 0)
        };
      }
      item.span = item.span ?? 1;
      if (!nest) item.span = nowDesColumn;

      const nestedList = (item.list || []) as ColumnItem[];
      const nestedDesColumn = nestedList[0]?.desColumn ?? props.desColumn;

      result.push({
        ...item,
        colIndex: 1,
        list: processColumnsWithPosition(nestedList, 0, true, nestedDesColumn)
      } as ProcessedColumnItem);
      continue;
    } else {
      let defaultSpan = 1;
      if (isValidNestedList(item.list)) defaultSpan = nowDesColumn;
      item.span = item.span ?? defaultSpan;
      desColumnCount = item.span % nowDesColumn;
    }

    item.rowspan = item.rowspan ?? 1;
    if (!item.showFun) item.showFun = () => true;

    item.unit = item.unit ?? '';

    if (!item.fun && !hasNested) {
      item.fun = (row: DataRecord, prop: string, other?: DataRecord): string => {
        const separator = SEPARATORS.find((sep) => prop.indexOf(sep) > -1);

        if (separator) {
          const itemprops = prop.split(separator);
          const contents: string[] = [];

          itemprops.forEach((propPath) => {
            const trimmedPath = propPath.trim();
            const lscontent: unknown = getValueByPath(row, trimmedPath);

            const content = formatDisplayContent({
              value: lscontent,
              decimalPlaces: item.decimalPlaces,
              defaultBlock: props.defaultBlock,
              unit: item.unit,
              rowData: row,
              other,
              prop: item.prop
            });
            contents.push(content);
          });

          return contents.join(separator);
        }

        const value = getValueByPath(row, prop);
        const content = formatDisplayContent({
          value,
          decimalPlaces: item.decimalPlaces,
          defaultBlock: props.defaultBlock,
          unit: item.unit,
          rowData: row,
          other,
          prop: item.prop
        });
        return content;
      };
    }

    result.push({
      ...item,
      colIndex: currentIndex
    } as ProcessedColumnItem);
    currentIndex = (currentIndex + (item.span ?? 1)) % props.desColumn;
  }

  return result;
};

const deepColumn = computed((): ColumnItem[] => {
  return deepClone(props.column) as ColumnItem[];
});

const columnFinal = computed((): ProcessedColumnItem[] => {
  const filtered = deepColumn.value.filter(
    (item) => typeof (item as { isForm?: boolean }).isForm === 'undefined' || (item as { isForm?: boolean }).isForm
  );
  return processColumnsWithPosition(filtered, 0);
});

// 构建描述列表
const renderDescriptions = (
  items: ProcessedColumnItem[],
  title: string = props.desTitle,
  desDirection: typeof props.desDirection = props.desDirection,
  desColumn: typeof props.desColumn = props.desColumn,
  labelWidth: typeof props.labelWidth = props.labelWidth
): VNode => {
  const renderNormalItem = (
    item: ProcessedColumnItem,
    renderLabel: () => VNode | string,
    renderDefaultContent: () => VNode | string
  ): VNode | null => {
    const showItem = item.showFun?.(dataFinal.value, item.prop) ?? true;
    if (!showItem) return null;

    const propsOpt: DescriptionsItemProps = {
      span: item.span,
      rowspan: item.rowspan,
      width: item.width,
      align: item.align,
      labelAlign: item.labelAlign,
      className: item.className,
      labelClassName: item.labelClassName
    };
    return h(ElDescriptionsItem, propsOpt, {
      default: renderDefaultContent,
      label: renderLabel
    });
  };

  const allItems = items
    .map((item): VNode | null => {
      const renderLabel = (): VNode | string => {
        const labelSlotKey = `label_${item.prop}` as keyof typeof slots;
        const labelSlot = slots[labelSlotKey];
        if (labelSlot) {
          return labelSlot({
            prop: item.prop,
            nowData: getValueByPath(dataFinal.value, item.prop),
            row: dataFinal.value
          }) as VNode;
        }
        return h(Fragment, null, [item.label]);
      };

      const renderDefaultContent = (): VNode | string => {
        const contentSlot = slots[item.prop as keyof typeof slots];
        if (contentSlot) {
          return contentSlot({
            prop: item.prop,
            nowData: getValueByPath(dataFinal.value, item.prop),
            row: dataFinal.value
          }) as VNode;
        }

        if (item.funDom) {
          const Component = createMarkRaw(item.funDom, dataFinal.value as dataItemType, item.prop);
          return h(Component);
        }
        const innerother: DataRecord & {
          loading: boolean;
          renderTxt: (context: string | number | boolean) => string | number | boolean;
        } = {
          ...attrs,
          loading: false,
          renderTxt: (context: string | number | boolean): string | number | boolean => context ?? props.defaultBlock
        };
        const { content, classNames } = getColumnData(item, dataFinal.value, innerother as DataRecord);
        const finalClassNames = [`span span_${item.prop}`, `span_${item.prop}_${String(getValueByPath(dataFinal.value, item.prop))}`, classNames]
          .filter(Boolean)
          .join(' ');

        return h('span', { class: finalClassNames }, content);
      };

      if (isValidNestedList(item.list)) {
        const nestedItems = item.list as ProcessedColumnItem[];

        return h(ElDescriptionsItem, {
          span: item.span,
          rowspan: item.rowspan,
          width: item.width,
          align: item.align,
          labelAlign: item.labelAlign,
          className: `${item.className || ''} nesting`,
          labelClassName: item.labelClassName
        }, {
          default: () =>
            renderDescriptions(
              nestedItems,
              '',
              props.sonDirection,
              (item as { desColumn?: number }).desColumn ?? props.desColumn,
              (item as { labelWidth?: string }).labelWidth ?? labelWidth
            ),
          label: renderLabel
        });
      }
      return renderNormalItem(item, renderLabel, renderDefaultContent);
    })
    .filter((item): item is VNode => item !== null);
  const childspan = new Set(items.map((item) => item.span || 1)).size;
  return withErrorBoundary(
    () =>
      h(ElDescriptions, {
        border: true,
        column: desColumn,
        direction: desDirection,
        size: props.desSize,
        title: title,
        extra: props.desExtra,
        class: `detail ${desBorder.value ? '' : 'isNotBorder'} ${childspan == 1 ? '' : '_flex'}`,
        labelWidth: labelWidth
      }, {
        default: () => allItems
      }),
    h('div', { class: 'render-error' }, '描述列表渲染失败')
  ) as VNode;
};

// ============ 暴露的方法 ============
const init = async (data: DataRecord | Promise<unknown> = {}, openCb: (data: DataRecord) => void = () => {}): Promise<void> => {
  let finaldata: DataRecord = {};
  if (data instanceof Promise) {
    let res: unknown;
    try {
      res = await data;
    } catch (e) {
      openCb({});
      return;
    }
    const config = props.dataConfig;
    const resRecord = res as DataRecord;
    if (resRecord[config.code] === config.status) {
      finaldata = (resRecord[config.data] as DataRecord) || {};
    }
  } else {
    finaldata = { ...data };
  }
  dataFinal.value = { ...finaldata };
  myDialog.value?.init();
  nextTick(() => {
    const baseClassElement = document.querySelector('.detailDialog') as HTMLElement | null;
    if (baseClassElement) {
      const baseClassStyle = getComputedStyle(baseClassElement);
      const w = getDomComputed(baseClassStyle, 'width');
      const labelW = Number(props.labelWidth.replace('px', ''));
      maxWidth.value = `${w / props.desColumn - labelW}px`;
    }
    openCb(dataFinal.value);
  });
};

const close = (): void => {
  myDialog.value?.handleClose();
};

const handleClose = (cb: () => void): void => {
  dataFinal.value = {};
  componentCache.value.clear();
  emit('close', dataFinal.value);
  cb();
};

const updateData = <T = unknown,>(prop: string, data: T): void => {
  dataFinal.value[prop] = data;
};

const getData = <T = unknown,>(prop: string): T | undefined => {
  return dataFinal.value[prop] as T | undefined;
};

// ============ 生命周期 ============
onBeforeUnmount(() => {
  componentCache.value.clear();
});

// ============ 使用 defineExpose ============
defineExpose<MyDetailExposed>({
  init,
  close,
  updateData,
  getData
});

// ============ 渲染函数 ============
const renderLeftSlot = (): VNode | null => {
  if (!slots.left) return null;
  return withErrorBoundary(() => slots.left!({ data: dataFinal.value }));
};

const renderRightSlot = (): VNode | null => {
  if (!slots.right) return null;
  return withErrorBoundary(() => slots.right!({ data: dataFinal.value }));
};

const renderFooter = (): VNode | string => {
  if (slots.footer) {
    return withErrorBoundary(() => slots.footer!({ data: dataFinal.value })) as VNode;
  }
  return h('div', { class: 'dialog-footer' }, [
    h(ElButton, { onClick: () => myDialog.value?.handleClose() }, '关闭')
  ]);
};
</script>

<template>
  <MyDialog
    ref="myDialog"
    :width="width"
    :title="title"
    :close-on-click-modal="closeOnClickModal"
    :style="{
      '--label-width': labelWidth,
      '--maxWidth': maxWidth,
      '--desColumn': desColumn
    }"
    @before-close="handleClose"
  >
    <div
      class="detailDialog"
      :style="{
        display: display,
        gridGap: '20px',
        gridTemplateColumns: gridTemplateColumns,
        maxHeight: '50vh',
        overflowY: 'auto'
      }"
    >
      <slot name="left" :data="dataFinal" />
      <component :is="renderDescriptions(columnFinal)" />
      <slot name="right" :data="dataFinal" />
    </div>
    <template #footer>
      <slot name="footer" :data="dataFinal">
        <div class="dialog-footer">
          <ElButton @click="myDialog?.handleClose()">关闭</ElButton>
        </div>
      </slot>
    </template>
  </MyDialog>
</template>

<style scoped lang="scss">
.isNotBorder {
  :deep(.el-descriptions__table) {
    .el-descriptions__label {
      vertical-align: top;
    }

    .el-descriptions__cell {
      background: transparent !important;
      border-width: 0;
    }

    .el-descriptions__content {
      width: calc(var(--maxWidth) - 0) !important;
    }
  }
}

:deep(.el-descriptions._flex) {
  > .el-descriptions__body {
    > .el-descriptions__table {
      table-layout: auto;
    }
  }
}

:deep(.el-descriptions__body) {
  table-layout: fixed;

  .el-descriptions__table {
    table-layout: fixed;
    tbody {
      tr {
        td {
          width: calc(100% / var(--desColumn));
        }

        .el-descriptions__label {
          min-width: var(--label-width);
        }

        .el-descriptions__content {
          word-break: break-all;
          word-wrap: break-word;
          vertical-align: top;
          width: calc(var(--maxWidth) - 0);
        }
      }
    }
  }
}

.detailDialog {
  max-height: 50vh;
  overflow-y: auto;
}

.render-error {
  padding: 20px;
  text-align: center;
  color: #f56c6c;
  background-color: #fef0f0;
  border-radius: 4px;
}
</style>
