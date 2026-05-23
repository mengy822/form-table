<!-- src/components/FormTable/Echarts/index1.vue -->
<template>
  <div class="chart-wrapper" :style="{ width, height }">
    <div ref="chartRef" :style="{ width: '100%', height: divHeight }"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted, nextTick, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';
import { registerChart, unregisterChart } from './linkageManager';
import { addWindowResize, removeWindowResize } from '../utils/echarts';

const props = defineProps({
  options: {
    type: Object,
    default() {
      return {};
    }
  },
  listen: {
    type: String,
    default: '.main-container'
  },
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: '400px'
  },
  chartId: {
    type: String,
    default: null
  },
  linkageGroup: {
    type: String,
    default: 'default'
  },
  enableLinkage: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['chart-ready']);
const chatId=computed(()=>props.chartId)
const enableLinkage=computed(()=>(!!props.chartId&&!!props.linkageGroup)||props.enableLinkage)
const divHeight = computed(() => {
  const height1 = props.height;
  return String(height1).indexOf('calc') === -1 ? height1 : '100%';
});

const chartRef = ref<HTMLDivElement>();
let chart: echarts.ECharts | null = null;

const options = computed(() => {
  const opt = { ...props.options };
  if (opt.yAxis && opt.series && opt.series.find((item: any) => item.type === 'line')) {
    if (typeof opt.yAxis.min === 'undefined') opt.yAxis.min = 'dataMin';
    if (typeof opt.yAxis.max === 'undefined') opt.yAxis.max = 'dataMax';
  }
  return opt;
});

const initChart = () => {
  if (!chartRef.value) return;

  if (!chart) {
    chart = echarts.init(chartRef.value);
    chart.setOption(options.value);

    // console.log(`[组件] 图表初始化: ${props.chartId}`);

    // 注册到联动组
    if (enableLinkage.value) {
      registerChart(props.linkageGroup, chatId.value, chart);
    }

    // 窗口缩放
    let time: any;
    addWindowResize(props.listen, () => {
      clearTimeout(time);
      time = setTimeout(() => {
        chart?.resize();
      }, 500);
    });

    emit('chart-ready', chatId.value, chart);
  } else {
    chart.setOption(options.value);
  }
};

watch(() => props.options, () => {
  if (chart) {
    chart.setOption(options.value);
  }
}, { deep: true });

// 当 enableLinkage 变化时重新注册
watch(() => enableLinkage.value, (newVal) => {
  if (newVal && chart) {
    registerChart(props.linkageGroup, chatId.value, chart);
  }
});

onMounted(() => {
  nextTick(() => {
    initChart();
  });
});

onBeforeUnmount(() => {
  removeWindowResize(props.listen);
  if (enableLinkage.value && chart) {
    unregisterChart(props.linkageGroup, chatId.value);
  }
  if (chart) {
    chart.dispose();
    chart = null;
  }
});

defineExpose({ chart, resize: () => chart?.resize() });
</script>

<style scoped>
.chart-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}
.chart-wrapper > div {
  width: 100%;
  height: 100%;
}
</style>

