// src/components/FormTable/Echarts/linkageManager.ts
import * as echarts from 'echarts';

// 全局联动组存储（使用 window 对象确保单例）
interface LinkageGroup {
  charts: Map<string, echarts.ECharts>;
  isConnected: boolean;
}

// 确保全局唯一
const globalKey = '__ECHARTS_LINKAGE_MANAGER__';
if (!(window as any)[globalKey]) {
  (window as any)[globalKey] = {
    groups: new Map<string, LinkageGroup>(),
    timers: new Map<string, any>()
  };
}

const manager = (window as any)[globalKey];

// 注册图表
export function registerChart(
  groupName: string,
  chartId: string,
  chart: echarts.ECharts
): void {
  if(!chartId)return
  if (!manager.groups.has(groupName)) {
    manager.groups.set(groupName, {
      charts: new Map(),
      isConnected: false
    });
  }

  const group = manager.groups.get(groupName)!;
  group.charts.set(chartId, chart);

  // console.log(`[联动] 注册: ${chartId} 到组 ${groupName}`);
  // console.log(`[联动] 组 ${groupName} 内图表:`, Array.from(group.charts.keys()));
  // console.log(`[联动] 组内总数: ${group.charts.size}`);

  // 清除之前的定时器
  if (manager.timers.has(groupName)) {
    clearTimeout(manager.timers.get(groupName));
  }

  // 当组内有2个以上图表时，延迟设置联动
  if (group.charts.size >= 2) {
    manager.timers.set(groupName, setTimeout(() => {
      setupGroupLinkage(groupName);
    }, 200));
  }
}

// 注销图表
export function unregisterChart(groupName: string, chartId: string): void {
  if (!chartId) return
  const group = manager.groups.get(groupName);
  if (group) {
    group.charts.delete(chartId);
    // console.log(`[联动] 注销: ${chartId} 从组 ${groupName}, 剩余: ${group.charts.size}`);

    if (group.charts.size < 2 && group.isConnected) {
      // 如果少于2个图表，断开连接
      const charts = Array.from(group.charts.values());
      if (charts.length > 0) {
        echarts.disconnect(charts);
        group.isConnected = false;
        // console.log(`[联动] 断开连接: ${groupName}`);
      }
    }
  }
}

// 设置组联动
function setupGroupLinkage(groupName: string): void {
  const group = manager.groups.get(groupName);
  if (!group || group.charts.size < 2) return;

  const charts = Array.from(group.charts.values());
  // console.log(`[联动] ========== 开始设置联动 ==========`);
  // console.log(`[联动] 联动组: ${groupName}`);
  // console.log(`[联动] 图表数量: ${charts.length}`);

  // 使用 connect 实现 tooltip 和缩放联动
  try {
    echarts.connect(charts);
    group.isConnected = true;
    // console.log(`[联动] ✅ echarts.connect 执行成功`);
  } catch (e) {
    console.error(`[联动] connect 失败:`, e);
  }

  // 添加点击高亮联动
  charts.forEach((chart: echarts.ECharts) => {
    chart.off('click');
    chart.on('click', (params: any) => {
      if (params.componentType === 'series') {
        console.log(`[联动] 🔘 点击高亮: dataIndex=${params.dataIndex}`);
        charts.forEach((c: echarts.ECharts) => {
          c.dispatchAction({ type: 'downplay' });
          c.dispatchAction({ type: 'hideTip' });
          c.dispatchAction({
            type: 'highlight',
            seriesIndex: params.seriesIndex,
            dataIndex: params.dataIndex
          });
          c.dispatchAction({
            type: 'showTip',
            seriesIndex: params.seriesIndex,
            dataIndex: params.dataIndex
          });
        });
      }
    });
  });

  // console.log(`[联动] ✅ 点击高亮联动设置完成`);
}
