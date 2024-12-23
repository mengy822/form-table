<template>
  <div class="top-right-btn" :style="style">
    <el-row>
      <el-tooltip class="item" effect="dark" :content="showSearch ? '隐藏搜索' : '显示搜索'" placement="top" v-if="search">
        <el-button circle :icon="Search" @click="toggleSearch()" />
      </el-tooltip>
      <el-tooltip class="item" effect="dark" content="刷新" placement="top">
        <el-button circle :icon="Refresh" @click="refresh()" />
      </el-tooltip>
      <el-tooltip class="item" effect="dark" content="显示/隐藏列" placement="top" v-if="columns.length > 0">
        <div class="show-btn">
          <el-popover placement="bottom" trigger="click">
            <div class="tree-header">显示/隐藏列</div>
            <el-tree ref="columnRef" :data="columnsFinal" show-checkbox @check="columnChange"
            node-key="key"
              :props="{ label: 'label', children: 'children' }"></el-tree>
            <template #reference>
              <el-button circle :icon="Menu" />
            </template>
          </el-popover>
        </div>
      </el-tooltip>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref,nextTick } from 'vue';
import { Refresh, Menu, Search } from '@element-plus/icons-vue'
const props = defineProps({
  showSearch: {
    type: Boolean,
    default: true
  },
  columns: {
    type: Array<{ key: string,label: string,  visible: boolean }>,
    default: () => {
      return []
    }
  },
  search: {
    type: Boolean,
    default: true
  },
  gutter: {
    type: Number,
    default: 10
  },
})

const columnRef = ref();
const emits = defineEmits(['update:showSearch','update:columns', 'queryTable']);

const style = computed(() => {
  const ret: any = {};
  if (props.gutter) {
    ret.marginRight = `${props.gutter / 2}px`;
  }
  return ret;
});

// 搜索
function toggleSearch() {
  emits("update:showSearch", !props.showSearch);
}

// 刷新
function refresh() {
  emits("queryTable");
}
const columnsFinal=ref<typeof props.columns>([])
// 更改数据列的显示和隐藏
function columnChange(...args: any[]) {
  columnsFinal.value.forEach((item) => {
    item.visible = args[1].checkedKeys.includes(item.key);
  })

  emits("update:columns", columnsFinal.value);
}
// 显隐列初始默认隐藏列
onMounted(() => {
  nextTick(() => {
    columnsFinal.value=[...props.columns]
    columnRef.value?.setCheckedKeys(columnsFinal.value.filter(item=>item.visible).map(item=>item.key), true);
  })
})
</script>

<style lang="scss" scoped>
:deep(.el-transfer__button) {
  border-radius: 50%;
  display: block;
  margin-left: 0px;
}

:deep(.el-transfer__button:first-child) {
  margin-bottom: 10px;
}

.my-el-transfer {
  text-align: center;
}

.tree-header {
  width: 100%;
  line-height: 24px;
  text-align: center;
}

.show-btn {
  margin-left: 12px;
}
.top-right-btn{
  margin-left:auto;
}
</style>
