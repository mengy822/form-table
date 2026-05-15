<template>
  <div
    class="table-operations"
    :style="{ justifyContent: getAlignStyle() }"
  >
    <!-- 动态渲染按钮（根据 getSlotContent） -->
    <template v-if="getSlotContent && getSlotContent.length">
      <!-- 显示的按钮（前 simpTransVar 个） -->
      <template v-for="(item, idx) in visibleButtons" :key="`visible-${idx}`">
        <component
          :is="renderButtonItem(item, false)"
          :data="scope.row"
          :index="getRowIndex(scope.$index)"
          :text="hasOperationText"
          :link="hasOperationLink"
          :loading="operationLoading"
          :row="scope.row"
        />
      </template>

      <!-- 如果隐藏按钮数量为1，直接显示该按钮 -->
      <template v-if="hiddenButtons.length === 1">
        <template v-for="(item, idx) in hiddenButtons" :key="`hidden-direct-${idx}`">
          <component
            :is="renderButtonItem(item, false)"
            :data="scope.row"
            :index="getRowIndex(scope.$index)"
            :text="hasOperationText"
            :link="hasOperationLink"
            :loading="operationLoading"
            :row="scope.row"
          />
        </template>
      </template>

      <!-- 更多操作按钮（隐藏按钮数量大于1时显示） -->
      <el-dropdown
        v-if="hiddenButtons.length > 1"
        @command="handleMoreCommand"
        :trigger="moreButtonTrigger"
      >
        <el-button
          :text="hasOperationText"
          :link="hasOperationLink"
          :loading="operationLoading"
          :type="moreButtonType"
        >
          {{ moreButton }}
          <el-icon class="el-icon--right">
            <ArrowDown />
          </el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="(item, idx) in hiddenButtons"
              :key="`hidden-${idx}`"
              :command="{ item, index: idx }"
            >
              <component
                :is="renderButtonItem(item, true)"
                :data="scope.row"
                :index="getRowIndex(scope.$index)"
                :text="hasOperationText"
                :link="hasOperationLink"
                :loading="operationLoading"
                :row="scope.row"
              />
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </template>
  </div>
</template>
<script setup lang="ts">
import { VNode, computed, h } from 'vue';
import { ArrowDown } from '@element-plus/icons-vue';
import { ElButton, ElTooltip, ElDropdown, ElDropdownMenu, ElDropdownItem, ElIcon } from 'element-plus';
import { ObjectType } from '@/components/js/types';
// 组件名称
defineOptions({
  name: 'TableOperations'
})
// 定义插槽类型
export interface SlotsObject {
  operationBefore?: (props: any) => VNode;
  addSon?: (props: any) => VNode;
  operationAfterAddSon?: (props: any) => VNode;
  detail?: (props: any) => VNode;
  operationAfterDetail?: (props: any) => VNode;
  update?: (props: any) => VNode;
  operationAfterUpdate?: (props: any) => VNode;
  remove?: (props: any) => VNode;
  operationAfter?: (props: any) => VNode;
  [key: string]: any;
}
export interface dataItemType {
  [key: string]: string | number | undefined | boolean|ObjectType
}
// 动态内容类型：VNode 或内置按钮标识
type SlotContentItem = VNode | 'detail' | 'update' | 'addSon' | 'remove';
export type ButtonType = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | ''
export interface TableOperationsProps {
  scope: {
    row: any;
    $index: number;
  };
  slots?: SlotsObject;
  queryParams?: {
    pageNum: number;
    pageSize: number;
  };
  isNotSimpTransVar?: boolean;
  hasOperationText?: boolean;
  hasOperationLink?: boolean;
  hasOperationName?: boolean;
  operationLoading?: boolean;
  hasAddSon?: boolean | ((data: dataItemType) => boolean | string) | string;
  hasAddSonType?: string;
  hasAddSonIcon?: object;
  hasDetail?: boolean | ((data: dataItemType) => boolean | string) | string;
  hasDetailType?: string;
  hasDetailIcon?: object;
  hasUpdate?: boolean | ((data: dataItemType) => boolean | string) | string;
  hasUpdateType?: string;
  hasUpdateIcon?: object;
  hasRemove?: boolean | ((data: dataItemType) => boolean | string) | string;
  hasRemoveType?: string;
  hasRemoveIcon?: object;
  moreButtonTrigger?: 'click'|'hover';
  align?: 'left' | 'center' | 'right';
  getSlotContent?: SlotContentItem[];
  getSlotCount?: number;
  simpTransVar?: number;
  moreButton: string;
  moreButtonType?: ButtonType;
  proxyProps?: {
    onAddSon?: (row: any) => void;
    onDetail?: (row: any) => void;
    onUpdate?: (row: any) => void;
    onRemove?: (row: any) => void;
  };
  getCustomLabel?: (scope: any, defaultLabel: string) => string;
}

const props = withDefaults(defineProps<TableOperationsProps>(), {
  slots: () => ({}),
  queryParams: () => ({ pageNum: 1, pageSize: 10 }),
  isNotSimpTransVar: true,
  hasOperationText: false,
  hasOperationLink: false,
  hasOperationName: false,
  operationLoading: false,
  hasAddSonType: 'primary',
  hasDetailType: 'primary',
  hasUpdateType: 'warning',
  hasRemoveType: 'danger',
  align: 'center',
  moreButton: '更多',
  moreButtonType:'primary',
  moreButtonTrigger:'hover',
  getSlotContent: () => [],
  getSlotCount: 0,
  simpTransVar: 3,
  proxyProps: () => ({})
});

const emit = defineEmits<{
  'add-son': [row: any];
  'detail': [row: any];
  'update': [row: any];
  'remove': [row: any];
}>();

const isVNode = (item: any): item is VNode => {
  return item && typeof item === 'object' && 'type' in item;
};

// 判断按钮是否应该显示（支持 boolean、函数、字符串）
const shouldShowButton = (condition: boolean | ((data: dataItemType) => boolean | string) | string | undefined, row: any, eventName: string): boolean => {
  // 如果是字符串，直接返回 true（显示文字按钮）
  if (typeof condition === 'string') {
    return true;
  }
  if (typeof condition === 'function') {
    return !!condition(row);
  }
  return !!(condition && props.proxyProps?.[eventName as keyof typeof props.proxyProps]);
};

// 获取按钮文本（支持直接文字）
const getButtonLabel = (condition: boolean | ((data: dataItemType) => boolean | string) | string | undefined, row: any, defaultLabel: string): string => {
  // 如果是字符串，直接返回该字符串
  if (typeof condition === 'string') {
    return condition;
  }
  if (props.getCustomLabel) {
    const customLabel = props.getCustomLabel({ row }, defaultLabel);
    if (customLabel) return customLabel;
  }
  return defaultLabel;
};

// 判断菜单项是否应该显示
const shouldShowMenuItem = (item: SlotContentItem): boolean => {
  if (typeof item === 'string') {
    const row = props.scope.row;
    switch (item) {
      case 'addSon':
        return shouldShowButton(props.hasAddSon, row, 'onAddSon');
      case 'detail':
        return shouldShowButton(props.hasDetail, row, 'onDetail');
      case 'update':
        return shouldShowButton(props.hasUpdate, row, 'onUpdate');
      case 'remove':
        return shouldShowButton(props.hasRemove, row, 'onRemove');
      default:
        return false;
    }
  }
  // VNode 默认显示
  return isVNodeVisible(item);
};
const isVNodeVisible=(vnode:VNode)=> {
  // 1. 注释节点永远不会"显示"（语义上不可见）
  if (vnode.type !== Symbol.for('v-cmt')) {
    return true
  }

  // 2. 检查是否已挂载到 DOM
  // @ts-ignore
  if (vnode.el && document.contains(vnode.el)) {
    // 检查真实可见性
    const rect = vnode.el.getBoundingClientRect()
    return rect.width > 0 || rect.height > 0
  }

  // 3. 对于组件节点，检查组件实例
  const instance = vnode.component
  if (instance && instance.isMounted && !instance.isDeactivated) {
    // 组件已挂载且未失活，可以认为在页面上
    return true
  }

  // 4. 对于块节点（v-if 产生的锚点），不算"显示"
  if (vnode.shapeFlag === 8 && vnode.children === 'v-if') {
    return false
  }

  return false
}
const displaySlotContent = computed(() => {
  if (!props.getSlotContent || props.getSlotContent.length === 0) {
    return [];
  }
  const count = props.getSlotCount;
  let content = props.getSlotContent;
  if (count > 0 && count < props.getSlotContent.length) {
    content = props.getSlotContent.slice(0, count);
  }
  // 过滤掉不应该显示的按钮
  return content.filter(item => shouldShowMenuItem(item));
});

const visibleButtons = computed(() => {
  const buttons = displaySlotContent.value;
  const threshold = props.simpTransVar || 3;
  return buttons.slice(0, threshold);
});

const hiddenButtons = computed(() => {
  const buttons = displaySlotContent.value;
  const threshold = props.simpTransVar || 3;
  if (buttons.length <= threshold) {
    return [];
  }
  return buttons.slice(threshold);
});

const handleMoreCommand = (command: { item: SlotContentItem; index: number }) => {
  const { item } = command;
  if (typeof item === 'string') {
    switch (item) {
      case 'addSon':
        handleAddSon(props.scope.row);
        break;
      case 'detail':
        handleDetail(props.scope.row);
        break;
      case 'update':
        handleUpdate(props.scope.row);
        break;
      case 'remove':
        handleRemove(props.scope.row);
        break;
    }
  }
};

const getAlignStyle = (): string => {
  const alignMap = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end'
  };
  return alignMap[props.align] || 'center';
};

const getRowIndex = (index: number): number => {
  return props.queryParams.pageSize * (props.queryParams.pageNum - 1) + index + 1;
};

const handleAddSon = (row: any) => {
  emit('add-son', row);
};

const handleDetail = (row: any) => {
  emit('detail', row);
};

const handleUpdate = (row: any) => {
  emit('update', row);
};

const handleRemove = (row: any) => {
  emit('remove', row);
};

// 核心渲染函数：根据 item 类型返回对应的 VNode
const renderButtonItem = (item: SlotContentItem, isInDropdown: boolean) => {
  // 如果是 VNode，直接返回
  if (isVNode(item)) {
    return item;
  }

  // 如果是字符串，返回一个函数式组件
  const type = item as string;

  return (renderProps: any) => {
    const row = renderProps.row || renderProps.data;
    const index = renderProps.index;

    const buttonConfig: Record<string, any> = {
      addSon: {
        condition: props.hasAddSon,
        slot: props.slots?.addSon,
        type: props.hasAddSonType,
        icon: props.hasAddSonIcon,
        label: getButtonLabel(props.hasAddSon, row, '新增'),
        handler: () => handleAddSon(row),
        eventName: 'onAddSon'
      },
      detail: {
        condition: props.hasDetail,
        slot: props.slots?.detail,
        type: props.hasDetailType,
        icon: props.hasDetailIcon,
        label: getButtonLabel(props.hasDetail, row, '详情'),
        handler: () => handleDetail(row),
        eventName: 'onDetail'
      },
      update: {
        condition: props.hasUpdate,
        slot: props.slots?.update,
        type: props.hasUpdateType,
        icon: props.hasUpdateIcon,
        label: getButtonLabel(props.hasUpdate, row, '修改'),
        handler: () => handleUpdate(row),
        eventName: 'onUpdate'
      },
      remove: {
        condition: props.hasRemove,
        slot: props.slots?.remove,
        type: props.hasRemoveType,
        icon: props.hasRemoveIcon,
        label: getButtonLabel(props.hasRemove, row, '删除'),
        handler: () => handleRemove(row),
        eventName: 'onRemove'
      }
    };

    const config = buttonConfig[type];
    if (!config) return null;

    // 使用插槽（如果存在）
    if (config.slot) {
      return h(config.slot, {
        data: row,
        index: index
      });
    }

    // 判断是否显示按钮
    let shouldShow = false;
    if (typeof config.condition === 'string') {
      shouldShow = true;
    } else if (typeof config.condition === 'function') {
      shouldShow = config.condition(row);
    } else {
      shouldShow = !!(config.condition && props.proxyProps?.[config.eventName]);
    }

    if (!shouldShow) return null;

    // 创建按钮
    const button = h(ElButton, {
      text: props.hasOperationText,
      link: props.hasOperationLink,
      type: config.type,
      loading: props.operationLoading,
      icon: config.icon,
      onClick: config.handler,
      style: isInDropdown ? { width: '100%' } : {}
    }, () => config.label);

    // 添加 tooltip（仅在下拉菜单外显示）
    if (props.hasOperationName && !isInDropdown) {
      let tooltipContent = config.label;
      if (typeof config.condition === 'function') {
        tooltipContent = `${config.label}${row?.name || ''}`;
      }
      return h(ElTooltip, {
        content: tooltipContent,
        placement: 'top'
      }, () => button);
    }

    return button;
  };
};

defineExpose({
  getRowIndex
});
</script>

<style scoped lang="scss">
.table-operations {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;

  :deep(.el-button) {
    margin: 0;

    & + .el-button {
      margin-left: 0;
    }
  }

  :deep(.el-dropdown-menu__item) {
    padding: 4px 12px;

    .el-button {
      width: 100%;
      justify-content: flex-start;
    }
  }
}
</style>
