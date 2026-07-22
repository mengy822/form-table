<template>
  <div class="mapContainer">
    <div :id="mapId" class="map" :style="`width: 100%; height: ${heightInner}`"></div>
    <div class="top-com">
      <slot name="top"></slot>
    </div>
    <div class="left-com">
      <slot name="left"></slot>
    </div>
    <div class="lnglatSearch">
      <slot name="lnglatSearch"></slot>
      <slot name="tuli"></slot>
    </div>
    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-mask">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <div class="loading-text">{{ loadingText }}</div>
        <div class="loading-progress" v-if="showProgress">
          <div class="progress-bar" :style="{ width: loadingProgress + '%' }"></div>
          <span class="progress-text">{{ loadingProgress }}%</span>
        </div>
      </div>
    </div>
    <div class="playback-control-container" v-if="showPlayback">
      <TrackPlaybackControl
        ref="playbackControl"
        :segments="trackSegments"
        :is-playing="hook?.isPlaying"
        :current-segment-index="hook?.currentSegmentIndex"
        :current-point-index="hook?.currentPointIndex"
        :speed="hook?.speed"
        :current-segment="hook?.currentSegment"
        :current-point="hook?.currentPoint"
        :progress="hook?.progress"
        :total-distance="hook?.totalDistance"
        :traveled-distance="hook?.traveledDistance"
        :hook="hook"
        @toggle-play="togglePlaybackWrapper"
        @reset="resetPlaybackWrapper"
        @set-speed="setPlaybackSpeedWrapper"
        @seek-to="seekToPointWrapper"
        @select-segment="selectSegment"
        @update-options="updatePlaybackOptions"
        @previous-point="previousPoint"
        @next-point="nextPoint"
        :playbackOptions="playbackOptions"
      >
        <template v-slot:overviewData="{ data, dyClass }">
          <slot name="overviewData" :data="data" :dyClass="dyClass"></slot>
        </template>
      </TrackPlaybackControl>
    </div>
  </div>
</template>

<script lang="ts" setup name="map">
import { computed, onMounted, onBeforeUnmount, ref, watch, getCurrentInstance, ComponentInternalInstance, nextTick } from 'vue';
import AMapLoad from './AMap';
import { getRemainingHeight } from '@/components/FormTable/js/utils';
import { isLat, isLng } from '@/utils/validate';
import useTrackPlayback, { TrackSegment, UseTrackPlaybackReturn } from '@/components/FormTable/utils/hooks/useTrackPlayback';

// 定义绘制相关类型
type DrawMode = 'Marker' | 'Circle' | 'Polyline' | 'Rectangle' | 'Polygon' | '';

// 加载状态
const isLoading = ref(false);
const loadingText = ref('加载中...');
const loadingProgress = ref(0);
const showProgress = ref(true);

// 所有 ref 声明
const mapId = computed(() => {
  return window.location.href.toString();
});
const lnglat = ref('');
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const props = defineProps({
  onlyByOne: {
    type: Boolean,
    default: true
  },
  showMarkers: {
    type: Boolean,
    default: true
  },
  selectGrid: {
    type: Object,
    default: () => {
      return {};
    }
  },
  center: {
    type: Array<string | number>,
    default: () => {
      return [];
    }
  },
  zoom: {
    type: Number,
    default: 5
  },
  minZoom: {
    type: Number,
    default: 2
  },
  maxZoom: {
    type: Number,
    default: 26
  },
  disableClustering: {
    type: Number,
    default: undefined
  },
  showGrid: {
    type: Boolean,
    default: false
  },
  showDefaultSlot: {
    type: Boolean,
    default: true
  },
  gridType: {
    type: String as Partial<'big' | 'small'>,
    default: 'small'
  },
  iconSize: {
    type: Array<number>,
    default: () => {
      return [24, 36];
    }
  },
  iconUrl: {
    type: String,
    default: 'mark_bs'
  },
  height: {
    type: String,
    default: undefined
  },
  highLightColor: {
    type: String,
    default: '#00FF00'
  },
  baseClass: {
    type: String,
    default: '.app-main'
  },
  lowLightColor: {
    type: String,
    default: '#ff7f00'
  },
  draw: {
    type: Boolean,
    default: false
  },
  // 性能优化配置
  maxPoints: {
    type: Number,
    default: 5000
  },
  batchSize: {
    type: Number,
    default: 1000
  },
  enableLazyLoad: {
    type: Boolean,
    default: true
  }
});

// 所有 ref
const imageMap = ref({});
const heightInner = ref('100vh');
const isMapReady = ref(false);
const showPlayback = ref(false);
const trackSegments = ref<TrackSegment[]>([]);
const playbackControl = ref();
const hook = ref<UseTrackPlaybackReturn>();
const playbackOptions = ref({
  speed: 1,
  autoCenter: false,
  showTrack: true,
  showMarkers: true,
  loop: false
});
const drawType = ref();

// 普通变量
let mapInstance = null;
let marker = null;
let resolveQueue = [];
let drawLayerGrounp = null;
let layerGroup = null;
let markers = [];
let overlays = [];
let drawPlugin = null;
let drawControl = null;
let drawObj = null;
let isMapDestroyed = false;
let isComponentUnmounted = false;
let isHookInitialized = false;

// 清理资源结构
const cleanupResources = {
  markers: [] as any[],
  overlays: [] as any[],
  infoWindows: [] as any[],
  eventHandlers: [] as { type: string; handler: Function }[],
  timers: [] as NodeJS.Timeout[],
  drawPlugin: null as any,
  layerGroup: null as any,
  hook: null as any
};

// emits 定义
const emits = defineEmits(['click', 'drawCreatedBack', 'mapmove', 'loadProgress']);

// icon 计算
const icon = computed(() => {
  return new L.icon({ iconSize: props.iconSize, iconUrl: imageMap.value[props.iconUrl] });
});

// ==================== 🔴 修改1：正确的让出主线程工具函数 ====================

// ✅ 使用 MessageChannel 让出主线程（最快，推荐）
const yieldToMainThread = () => {
  return new Promise(resolve => {
    const channel = new MessageChannel();
    channel.port1.onmessage = () => {
      resolve(true);
    };
    channel.port2.postMessage(null);
  });
};

// ✅ 使用 setTimeout 让出主线程（兼容性最好）
const yieldToMainThreadWithTimeout = () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(true);
    }, 0);
  });
};

// ✅ 使用 requestIdleCallback 让出主线程（浏览器空闲时执行）
const yieldToMainThreadWithIdle = () => {
  return new Promise(resolve => {
    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(() => {
        resolve(true);
      });
    } else {
      setTimeout(() => resolve(true), 0);
    }
  });
};

// 组合使用
const yieldControl = (type: 'timeout' | 'message' | 'idle' = 'message') => {
  switch (type) {
    case 'timeout':
      return yieldToMainThreadWithTimeout();
    case 'message':
      return yieldToMainThread();
    case 'idle':
      return yieldToMainThreadWithIdle();
    default:
      return yieldToMainThread();
  }
};

// ==================== 清理函数 ====================

const cleanupMapEvents = () => {
  if (!mapInstance) return;
  try {
    cleanupResources.eventHandlers.forEach(({ type, handler }) => {
      if (mapInstance && typeof mapInstance.off === 'function') {
        mapInstance.off(type, handler);
      }
    });
    cleanupResources.eventHandlers = [];
  } catch (e) {
    console.warn('清理地图事件失败:', e);
  }
};

const cleanupAllResources = () => {
  if (isMapDestroyed) return;
  try {
    cleanupMapEvents();

    cleanupResources.markers.forEach((marker) => {
      try {
        if (mapInstance && typeof mapInstance.remove === 'function') {
          mapInstance.remove(marker);
        }
        if (typeof marker.destroy === 'function') {
          marker.destroy();
        }
      } catch (e) {}
    });
    cleanupResources.markers = [];

    cleanupResources.overlays.forEach((overlay) => {
      try {
        if (mapInstance && typeof mapInstance.remove === 'function') {
          mapInstance.remove(overlay);
        }
        if (typeof overlay.destroy === 'function') {
          overlay.destroy();
        }
      } catch (e) {}
    });
    cleanupResources.overlays = [];

    cleanupResources.infoWindows.forEach((infoWindow) => {
      try {
        if (typeof infoWindow.close === 'function') {
          infoWindow.close();
        }
        if (typeof infoWindow.destroy === 'function') {
          infoWindow.destroy();
        }
      } catch (e) {}
    });
    cleanupResources.infoWindows = [];

    if (cleanupResources.drawPlugin) {
      try {
        if (typeof cleanupResources.drawPlugin.close === 'function') {
          cleanupResources.drawPlugin.close();
        }
        if (typeof cleanupResources.drawPlugin.destroy === 'function') {
          cleanupResources.drawPlugin.destroy();
        }
      } catch (e) {}
      cleanupResources.drawPlugin = null;
    }

    if (cleanupResources.hook) {
      try {
        if (typeof cleanupResources.hook.clearLayers === 'function') {
          cleanupResources.hook.clearLayers();
        }
        if (typeof cleanupResources.hook.pause === 'function') {
          cleanupResources.hook.pause();
        }
        if (cleanupResources.hook.currentSegmentIndex) {
          cleanupResources.hook.currentSegmentIndex.value = 0;
        }
        if (cleanupResources.hook.currentPointIndex) {
          cleanupResources.hook.currentPointIndex.value = 0;
        }
      } catch (e) {}
    }

    cleanupResources.timers.forEach((timer) => {
      try {
        clearTimeout(timer);
        clearInterval(timer);
      } catch (e) {}
    });
    cleanupResources.timers = [];

    if (cleanupResources.layerGroup) {
      try {
        if (mapInstance && typeof mapInstance.remove === 'function') {
          mapInstance.remove(cleanupResources.layerGroup);
        }
      } catch (e) {}
      cleanupResources.layerGroup = null;
    }

    markers = [];
    overlays = [];
    layerGroup = null;
    drawPlugin = null;
    drawLayerGrounp = null;
  } catch (e) {
    console.warn('清理资源时出错:', e);
  }
};

const destroyMap = () => {
  if (isMapDestroyed) return;
  isMapDestroyed = true;
  try {
    cleanupAllResources();
    if (mapInstance) {
      if (typeof mapInstance.off === 'function') {
        mapInstance.off();
      }
      if (typeof mapInstance.destroy === 'function') {
        mapInstance.destroy();
      }
      mapInstance = null;
    }
    isMapReady.value = false;
  } catch (e) {
    console.warn('销毁地图失败:', e);
  }
};

// ==================== 工具函数 ====================

const getMapInstance = () => {
  return new Promise((resolve, reject) => {
    if (mapInstance) return resolve(mapInstance);
    else {
      resolveQueue.push(resolve);
    }
  });
};

const removeLayer = (lay) => {
  if (Array.isArray(lay)) {
    for (let i = 0; i < lay.length; i++) {
      mapInstance.removeLayer(lay[i]);
    }
  } else mapInstance.removeLayer(lay);
};

const mapSetCenter = async () => {
  const lng = lnglat.value.split(',')[0];
  const lat = lnglat.value.split(',')[1];
  if (!isLng(lng)) {
    proxy.$modal.msgError('请输入正确的经纬度，中间用,分隔');
    return false;
  }
  if (!isLat(lat)) {
    proxy.$modal.msgError('请输入正确的经纬度，中间用,分隔');
    return false;
  }
  const obj = [lat, lng];
  await getMapInstance();
  mapInstance.setView(obj);
};

const getBounds = () => {
  const size = mapInstance?.getSize();
  size.x = size.width;
  size.y = size.height;
  return {
    bounds: mapInstance?.getBounds(),
    zoom: mapInstance?.getZoom(),
    center: mapInstance?.getCenter(),
    range: size
  };
};

const loadImages = async () => {
  const modules = import.meta.glob('@/assets/images/map/*.{png,jpg,jpeg,svg}');
  for (const path in modules) {
    const module = await modules[path]();
    const imageName = path.split('/').pop().split('.')[0];
    imageMap.value[imageName] = module.default;
  }
};

// ==================== 地图初始化 ====================

const initPl = async () => {
  await getMapInstance();
  if (props.showGrid) {
  } else if (props.draw) {
    initDrawCtrl();
  } else {
    const internal = getCurrentInstance();
    const onEmit = (internal?.vnode.props || {}) as Record<string, any>;
    if (onEmit['onMapmove']) {
      const zoomEndHandler = () => {
        emits('mapmove', getBounds());
      };
      const moveEndHandler = () => {
        emits('mapmove', getBounds());
      };
      mapInstance.on('zoomend', zoomEndHandler);
      cleanupResources.eventHandlers.push({ type: 'zoomend', handler: zoomEndHandler });
      mapInstance.on('moveend', moveEndHandler);
      cleanupResources.eventHandlers.push({ type: 'moveend', handler: moveEndHandler });
    }
    if (onEmit['onClick']) {
      const clickHandler = (e) => {
        const { lat, lng } = e.latlng;
        if (props.onlyByOne) {
          if (marker != null) removeLayer(marker);
          marker = new L.Marker([lat, lng], { icon: icon.value }).addTo(mapInstance!);
          emits('click', { lat: lat, lng: lng }, marker);
        }
      };
      mapInstance.on('click', clickHandler);
      cleanupResources.eventHandlers.push({ type: 'click', handler: clickHandler });
    }
  }
};

const createMap = async (divId, center = []) => {
  const corner1 = [180, -90];
  const corner2 = [-180, 90];
  if ((center || []).length === 0) {
    center = [108.41339, 34.91092];
    if (props.selectGrid.bndCoords) {
      center = [props.selectGrid.lat, props.selectGrid.lon];
    }
  }
  let zoom = props.zoom;
  zoom = zoom < props.minZoom ? props.minZoom : zoom;
  zoom = zoom > props.maxZoom ? props.maxZoom : zoom;
  const AMap = await AMapLoad({});

  const zkxt_satellite_layer = new AMap.TileLayer({
    getTileUrl: `https://api.open.geovisearth.com/map/v1/img/[z]/[x]/[y]?format=webp&tmsIds=w&token=b5cf06c4d74ee60be2d41bb6010e201a`
  });
  const zkxt_cia_layer = new AMap.TileLayer({
    getTileUrl: `https://api.open.geovisearth.com/map/cia/[z]/[x]/[y]?format=webp&tmsIds=w&token=b5cf06c4d74ee60be2d41bb6010e201a`,
    zIndex: 10
  });
  const tianditu_cia_layer = new AMap.TileLayer({
    getTileUrl: `https://t{0,1,2,3,4,5,6,7}.tianditu.gov.cn/DataServer?T=cia_w&tk=79c06532cbb5d37e874972cf7bc83346&x=[x]&y=[y]&l=[z]`,
    zIndex: 9
  });
  let layers = [];
  if (import.meta.env.VITE_APP_MAP_TYPE == 'amap') {
    layers = [new AMap.TileLayer()];
  } else {
    layers = [zkxt_satellite_layer, tianditu_cia_layer];
  }
  const map = new AMap.Map(divId, {
    center: center,
    maxZoom: props.maxZoom,
    minZoom: props.minZoom,
    zoom: zoom,
    showIndoorMap: false,
    layers: layers
  });

  const completeHandler = () => {
    mapInstance = map;
    resolveQueue.forEach((resolve) => resolve(mapInstance));
    resolveQueue = [];
    isMapReady.value = true;
    emits('mapmove', getBounds());
    initPl();
  };
  map.on('complete', completeHandler);
  cleanupResources.eventHandlers.push({ type: 'complete', handler: completeHandler });
};

const setupMapEvents = (map: any) => {
  cleanupMapEvents();
};

// ==================== 坐标转换函数 ====================

const PI = 3.1415926535897932384626;
const a = 6378245.0;
const ee = 0.00669342162296594323;

const wgs84ToGcj02 = (lng: number, lat: number): [number, number] => {
  if (typeof lng !== 'number' || typeof lat !== 'number') {
    throw new Error('坐标参数必须是数字类型');
  }
  lat = +lat;
  lng = +lng;
  if (isNaN(lng) || isNaN(lat)) {
    throw new Error('坐标参数包含无效数字');
  }
  if (out_of_china(lng, lat)) {
    return [lng, lat];
  }
  let dlat = transformlat(lng - 105.0, lat - 35.0);
  let dlng = transformlng(lng - 105.0, lat - 35.0);
  const radlat = (lat / 180.0) * PI;
  let magic = Math.sin(radlat);
  magic = 1 - ee * magic * magic;
  const sqrtmagic = Math.sqrt(magic);
  dlat = (dlat * 180.0) / (((a * (1 - ee)) / (magic * sqrtmagic)) * PI);
  dlng = (dlng * 180.0) / ((a / sqrtmagic) * Math.cos(radlat) * PI);
  const mgLat = lat + dlat;
  const mgLng = lng + dlng;
  return [mgLng, mgLat];
};

const gcj02towgs84 = (lng: number, lat: number): [number, number] => {
  lat = +lat;
  lng = +lng;
  if (out_of_china(lng, lat)) {
    return [lng, lat];
  } else {
    let dlat = transformlat(lng - 105.0, lat - 35.0);
    let dlng = transformlng(lng - 105.0, lat - 35.0);
    const radlat = (lat / 180.0) * PI;
    let magic = Math.sin(radlat);
    magic = 1 - ee * magic * magic;
    const sqrtmagic = Math.sqrt(magic);
    dlat = (dlat * 180.0) / (((a * (1 - ee)) / (magic * sqrtmagic)) * PI);
    dlng = (dlng * 180.0) / ((a / sqrtmagic) * Math.cos(radlat) * PI);
    const mglat = lat + dlat;
    const mglng = lng + dlng;
    return [lng * 2 - mglng, lat * 2 - mglat];
  }
};

const out_of_china = (lng: number, lat: number): boolean => {
  lat = +lat;
  lng = +lng;
  return !(lng > 73.66 && lng < 135.05 && lat > 3.86 && lat < 53.55);
};

const transformlat = (lng: number, lat: number): number => {
  lat = +lat;
  lng = +lng;
  let ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
  ret += ((20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0) / 3.0;
  ret += ((20.0 * Math.sin(lat * PI) + 40.0 * Math.sin((lat / 3.0) * PI)) * 2.0) / 3.0;
  ret += ((160.0 * Math.sin((lat / 12.0) * PI) + 320 * Math.sin((lat * PI) / 30.0)) * 2.0) / 3.0;
  return ret;
};

const transformlng = (lng: number, lat: number): number => {
  lat = +lat;
  lng = +lng;
  let ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
  ret += ((20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0) / 3.0;
  ret += ((20.0 * Math.sin(lng * PI) + 40.0 * Math.sin((lng / 3.0) * PI)) * 2.0) / 3.0;
  ret += ((150.0 * Math.sin((lng / 12.0) * PI) + 300.0 * Math.sin((lng / 30.0) * PI)) * 2.0) / 3.0;
  return ret;
};

// ==================== 绘图相关函数 ====================

const initDrawCtrl = async () => {
  await getMapInstance();
  mapInstance.off('click');
  drawPlugin = new AMap.MouseTool(mapInstance);
  cleanupResources.drawPlugin = drawPlugin;
};

const stopDraw = (can_clear = 1) => {
  if (drawPlugin) {
    drawPlugin.close();
  }
  if (mapInstance && mapInstance.getAllOverlays) {
    const overlays = mapInstance.getAllOverlays();
    overlays.forEach((overlay: any) => {
      const extDataCan_clear = overlay?._opts?.extData?.can_clear ?? true;
      if ((extDataCan_clear && can_clear == 1) || can_clear == 2)
        if (overlay._isTempDraw) {
          mapInstance.remove(overlay);
        }
    });
  }
  mapInstance?.setDefaultCursor('default');
};

const startDraw = async (idx: DrawType | 'Info', latLngs: any[] = [], isClear: boolean | number = true, zhuanzhu = true) => {
  await getMapInstance();
  mapInstance?.setDefaultCursor('default');
  if (isClear) stopDraw(typeof isClear == 'boolean' ? undefined : isClear);
  if (latLngs && latLngs.length > 0) {
    switch (idx) {
      case 'Polygon':
        await drawPolygon(latLngs);
        break;
      case 'Polyline':
        await drawPolyline(latLngs);
        break;
      case 'Circle':
        await drawCircle(latLngs);
        break;
      case 'Rectangle':
        await drawRectangle(latLngs);
        break;
      case 'Marker':
        await drawMarkers(latLngs, zhuanzhu);
        break;
      case 'Info':
        await drawInfo(latLngs, zhuanzhu);
        break;
    }
    return;
  }
  await enableInteractiveDraw(idx);
};

const samplePoints = (points: any[], maxPoints: number) => {
  if (points.length <= maxPoints) return points;
  const step = Math.floor(points.length / maxPoints);
  const result = [];
  for (let i = 0; i < points.length; i += step) {
    result.push(points[i]);
  }
  if (result[result.length - 1] !== points[points.length - 1]) {
    result.push(points[points.length - 1]);
  }
  return result;
};

// 🔴 修改2：绘制多边形 - 添加 yieldControl
const drawPolygon = async (points: ShapeData) => {
  if (points.length < 3) {
    console.error('多边形需要至少3个点');
    return;
  }

  await yieldControl('message');

  const sampledPoints = points.length > props.maxPoints ? samplePoints(points, props.maxPoints) : points;
  const path = sampledPoints.map((p) => {
    if (typeof p == 'string') {
      const pa = p.split(',');
      return [pa[0], pa[1]];
    } else {
      return [p.lng, p.lat];
    }
  });
  const color = points[0]?.color || 'red';
  const fillColor = points[0]?.fillColor || 'red';
  const fillOpacity = points[0]?.fillOpacity || 0.3;

  const polygon = new AMap.Polygon({
    path: path,
    strokeColor: color,
    strokeWeight: 2,
    strokeOpacity: 0.8,
    fillColor: fillColor,
    fillOpacity: fillOpacity,
    zIndex: 50
  });

  polygon._isTempDraw = true;
  mapInstance.add(polygon);
  mapInstance.setFitView([polygon]);

  if (layerGroup) {
    layerGroup.push(polygon);
  } else {
    layerGroup = [polygon];
  }
  overlays.push(polygon);
  cleanupResources.overlays.push(polygon);
  return polygon;
};

// 🔴 修改3：绘制折线 - 添加 yieldControl
const drawPolyline = async (points: ShapeData) => {
  if (points.length < 2) {
    console.error('折线需要至少2个点');
    return;
  }

  await yieldControl('message');

  const sampledPoints = points.length > props.maxPoints ? samplePoints(points, props.maxPoints) : points;
  const path = sampledPoints.map((p) => [p.lng, p.lat]);
  const color = points[0]?.color || 'red';

  const polyline = new AMap.Polyline({
    path: path,
    strokeColor: color,
    strokeWeight: 3,
    strokeOpacity: 0.8,
    lineJoin: 'round',
    zIndex: 50,
    extData: points[0]?.extData || {}
  });

  polyline._isTempDraw = true;
  mapInstance.add(polyline);
  mapInstance.setFitView([polyline]);

  if (layerGroup) {
    layerGroup.push(polyline);
  } else {
    layerGroup = [polyline];
  }
  overlays.push(polyline);
  cleanupResources.overlays.push(polyline);
  return polyline;
};

// 🔴 修改4：绘制圆形 - 添加 yieldControl
const drawCircle = async (circleData: (CircleData | PointData)[]) => {
  if (circleData.length === 0) return;

  await yieldControl('message');

  const center = circleData[0];
  const radius: number = circleData[1];

  const circle = new AMap.Circle({
    center: [center[1], center[0]],
    radius: radius,
    strokeColor: center.color || 'red',
    strokeWeight: 2,
    strokeOpacity: 0.8,
    fillColor: center.fillColor || center.color || 'red',
    fillOpacity: center.fillOpacity || 0.2,
    zIndex: 50
  });

  circle._isTempDraw = true;
  mapInstance.add(circle);
  mapInstance.setFitView([circle]);

  if (layerGroup) {
    layerGroup.push(circle);
  } else {
    layerGroup = [circle];
  }
  overlays.push(circle);
  cleanupResources.overlays.push(circle);
  return circle;
};

// 🔴 修改5：绘制矩形 - 添加 yieldControl
const drawRectangle = async (points: ShapeData) => {
  if (points.length < 2) {
    console.error('矩形需要至少2个点');
    return;
  }

  await yieldControl('message');

  points = points.map((item) => {
    const pa = item.split(',');
    return [pa[0], pa[1]];
  });
  const bounds = new AMap.Bounds(new AMap.LngLat(points[0][0], points[0][1]), new AMap.LngLat(points[1][0], points[1][1]));

  const rectangle = new AMap.Rectangle({
    bounds: bounds,
    strokeColor: points[0]?.color || 'red',
    strokeWeight: 2,
    strokeOpacity: 0.8,
    fillColor: points[0]?.fillColor || points[0]?.color || 'red',
    fillOpacity: points[0]?.fillOpacity || 0.2,
    zIndex: 50
  });

  rectangle._isTempDraw = true;
  mapInstance.add(rectangle);
  mapInstance.setFitView([rectangle]);

  if (layerGroup) {
    layerGroup.push(rectangle);
  } else {
    layerGroup = [rectangle];
  }
  overlays.push(rectangle);
  cleanupResources.overlays.push(rectangle);
  return rectangle;
};

const _renderClusterMarker = function (context) {
  const factor = Math.pow(context.count / count, 1 / 18);
  const div = document.createElement('div');
  const Hue = 180 - factor * 180;
  const bgColor = 'hsla(' + Hue + ',100%,40%,0.7)';
  const fontColor = 'hsla(' + Hue + ',100%,90%,1)';
  const borderColor = 'hsla(' + Hue + ',100%,40%,1)';
  const shadowColor = 'hsla(' + Hue + ',100%,90%,1)';
  div.style.backgroundColor = bgColor;
  const size = Math.round(30 + Math.pow(context.count / count, 1 / 5) * 20);
  div.style.width = div.style.height = size + 'px';
  div.style.border = 'solid 1px ' + borderColor;
  div.style.borderRadius = size / 2 + 'px';
  div.style.boxShadow = '0 0 5px ' + shadowColor;
  div.innerHTML = context.count;
  div.style.lineHeight = size + 'px';
  div.style.color = fontColor;
  div.style.fontSize = '14px';
  div.style.textAlign = 'center';
  context.marker.setOffset(new AMap.Pixel(-size / 2, -size / 2));
  context.marker.setContent(div);
};

const _renderMarker = function (context) {
  const content =
    '<div style="background-color: hsla(180, 100%, 50%, 0.3); height: 18px; width: 18px; border: 1px solid hsl(180, 100%, 40%); border-radius: 12px; box-shadow: hsl(180, 100%, 50%) 0px 0px 3px;"></div>';
  const offset = new AMap.Pixel(-9, -9);
  context.marker.setContent(content);
  context.marker.setOffset(offset);
};

// 🔴 修改6：分批绘制标记点 - 使用 setTimeout 让出主线程
const drawMarkers = async (points: PointData[], zhuanzhu) => {
  clearMarkers();
  const totalPoints = points.length;

  if (totalPoints > props.batchSize) {
    const batchSize = props.batchSize;
    const totalBatches = Math.ceil(totalPoints / batchSize);
    let completedBatches = 0;

    for (let i = 0; i < totalBatches; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, totalPoints);
      const batch = points.slice(start, end);

      // ✅ 使用 setTimeout 让出主线程
      await new Promise(resolve => {
        setTimeout(() => {
          batch.forEach((point) => {
            const marker = drawMarker(point);
            if (marker) {
              cleanupResources.markers.push(marker);
            }
          });
          completedBatches++;
          const progress = Math.round((completedBatches / totalBatches) * 100);
          loadingProgress.value = progress;
          emits('loadProgress', progress);

          resolve(true);
        }, 0);
      });

      // ✅ 每批处理后让出主线程
      await yieldControl('message');

      if (completedBatches === totalBatches) {
        if (cleanupResources.markers.length > 0 && zhuanzhu) {
          mapInstance.setFitView(cleanupResources.markers);
        }
      }
    }
  } else {
    points.forEach((point) => {
      const marker = drawMarker(point);
      if (marker) {
        cleanupResources.markers.push(marker);
      }
    });
    if (cleanupResources.markers.length > 0 && zhuanzhu) {
      mapInstance.setFitView(cleanupResources.markers);
    }
  }
};

const drawInfo = async (points: PointData[], zhuanzhu) => {
  clearMarkers();
  const point = points[0];
  const position = [point.lng, point.lat];
  mapInstance.setCenter(position);

  if (point.popup) {
    const infoStatus = point.popup;
    const isPromise = infoStatus instanceof Promise;
    if (isPromise) {
      infoStatus.then((res) => {
        const infoWindow = new AMap.InfoWindow({
          content: res,
          offset: new AMap.Pixel(0, -30)
        });
        infoWindow.open(mapInstance, position);
        cleanupResources.infoWindows.push(infoWindow);
      });
    } else {
      const infoWindow = new AMap.InfoWindow({
        content: point.popup,
        offset: new AMap.Pixel(0, -30)
      });
      infoWindow.open(mapInstance, position);
      cleanupResources.infoWindows.push(infoWindow);
    }
  }
};

const drawMarker = (point: PointData) => {
  const position = [point.lng, point.lat];
  let content = point.txt || '';
  if (point.class || point.style) {
    content = `<div class="${point.class}" style="${point.style}">${content}</div>`;
  }

  const marker = new AMap.Marker({
    position: position,
    content: content || undefined,
    title: point.txt || '',
    offset: new AMap.Pixel(-12, -12)
  });

  const clickHandler = (e: any) => {
    mapInstance.setCenter(e.target.getPosition());
    const nowZoom = mapInstance?.getZoom();
    if (point.zoom != false) mapInstance.setZoom(nowZoom > 16 ? nowZoom : 16);
    if (point.cb) {
      point.cb(point);
    }
    if (point.popup) {
      const infoStatus = point.popup(point);
      if (!infoStatus) return;
      const isPromise = infoStatus instanceof Promise;
      if (isPromise) {
        infoStatus.then((res) => {
          const infoWindow = new AMap.InfoWindow({
            content: res,
            offset: new AMap.Pixel(0, -30)
          });
          infoWindow.open(mapInstance, position);
          cleanupResources.infoWindows.push(infoWindow);
        });
      } else {
        const infoWindow = new AMap.InfoWindow({
          content: point.popup(point),
          offset: new AMap.Pixel(0, -30)
        });
        infoWindow.open(mapInstance, position);
        cleanupResources.infoWindows.push(infoWindow);
      }
    }
  };

  marker.on('click', clickHandler);
  cleanupResources.eventHandlers.push({ type: 'click', handler: clickHandler });

  marker._isTempDraw = true;
  mapInstance.add(marker);

  return marker;
};

const enableInteractiveDraw = async (type: DrawType) => {
  if (!drawPlugin) {
    drawPlugin = new AMap.MouseTool(mapInstance);
    cleanupResources.drawPlugin = drawPlugin;
  }
  drawType.value = type;
  mapInstance.setDefaultCursor('crosshair');
  drawPlugin.close();

  switch (type) {
    case 'Marker':
      drawPlugin.marker({});
      break;
    case 'Polyline':
      drawPlugin.polyline({
        strokeColor: '#3366FF',
        strokeWeight: 3,
        strokeOpacity: 0.8
      });
      break;
    case 'Polygon':
      drawPlugin.polygon({
        strokeColor: '#3366FF',
        strokeWeight: 2,
        strokeOpacity: 0.8,
        fillColor: '#3366FF',
        fillOpacity: 0.3
      });
      break;
    case 'Circle':
      drawPlugin.circle({
        strokeColor: '#3366FF',
        strokeWeight: 2,
        strokeOpacity: 0.8,
        fillColor: '#3366FF',
        fillOpacity: 0.2
      });
      break;
    case 'Rectangle':
      drawPlugin.rectangle({
        strokeColor: '#3366FF',
        strokeWeight: 2,
        strokeOpacity: 0.8,
        fillColor: '#3366FF',
        fillOpacity: 0.2,
        extData: { flag: 1 }
      });
      break;
  }

  const drawHandler = (event: any) => {
    const obj = event.obj;
    obj._isTempDraw = true;
    mapInstance.setDefaultCursor('default');
    if (layerGroup) {
      if (Array.isArray(layerGroup)) {
        layerGroup.push(obj);
      } else {
        layerGroup.push(obj);
      }
    } else {
      layerGroup = [obj];
    }
    overlays.push(obj);
    cleanupResources.overlays.push(obj);

    let latlng = null;
    const dtype = drawType.value || obj.CLASS_NAME;
    switch (dtype) {
      case 'AMap.Polygon':
      case 'Polygon':
      case 'Overlay.Polygon':
        latlng = getPolygonCoordinates(obj);
        break;
      case 'Polyline':
      case 'AMap.Polyline':
      case 'Overlay.Polyline':
        latlng = getPolylineCoordinates(obj);
        break;
      case 'Circle':
      case 'AMap.Circle':
        latlng = getCircleCoordinates(obj);
        break;
      case 'Rectangle':
      case 'AMap.Rectangle':
        latlng = getRectangleCoordinates(obj);
        break;
      case 'Marker':
      case 'AMap.Marker':
        latlng = getMarkerCoordinates(obj);
        break;
    }
    emits('drawCreatedBack', latlng);
    drawPlugin.close();
  };

  drawPlugin.on('draw', drawHandler);
  cleanupResources.eventHandlers.push({ type: 'draw', handler: drawHandler });
};

// ==================== 坐标提取函数 ====================

const getPolygonCoordinates = (polygon: any): Array<[number, number]> => {
  if (!polygon || !polygon.getPath) {
    console.error('无效的多边形对象');
    return [];
  }
  if (polygon.w?.extData?.flag == 1) {
    return getRectangleCoordinates(polygon);
  }
  try {
    const path = polygon.getPath();
    if (!Array.isArray(path)) {
      return [];
    }
    const coordinates = path
      .map((point: any) => {
        if (Array.isArray(point)) {
          return [point[0], point[1]] as [number, number];
        } else if (point && typeof point === 'object') {
          return [point.lng || point.lon || 0, point.lat || 0] as [number, number];
        }
        return [0, 0] as [number, number];
      })
      .filter((coord: [number, number]) => !isNaN(coord[0]) && !isNaN(coord[1]));
    const area = calculatePolygonArea(coordinates);
    return {
      polygon: coordinates.map((item) => ({ lat: item[1], lng: item[0] })),
      sum: area.toFixed(2),
      len: area.toFixed(2),
      type: 'polygon'
    };
  } catch (error) {
    console.error('获取多边形坐标失败:', error);
    return [];
  }
};

const calculateDistance = (lng1: number, lat1: number, lng2: number, lat2: number): number => {
  const R = 6378137;
  const radLat1 = (lat1 * Math.PI) / 180;
  const radLat2 = (lat2 * Math.PI) / 180;
  const a = radLat1 - radLat2;
  const b = ((lng1 - lng2) * Math.PI) / 180;
  const s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
  return s * R;
};

const calculatePolygonArea = (coordinates: Array<[number, number]>): number => {
  if (coordinates.length < 3) return 0;
  const closedCoords = [...coordinates];
  if (closedCoords[0][0] !== closedCoords[closedCoords.length - 1][0] || closedCoords[0][1] !== closedCoords[closedCoords.length - 1][1]) {
    closedCoords.push([closedCoords[0][0], closedCoords[0][1]]);
  }
  let area = 0;
  const len = closedCoords.length;
  for (let i = 0; i < len; i++) {
    const j = (i + 1) % len;
    const xi = (closedCoords[i][0] * Math.PI) / 180;
    const xj = (closedCoords[j][0] * Math.PI) / 180;
    const yi = (closedCoords[i][1] * Math.PI) / 180;
    const yj = (closedCoords[j][1] * Math.PI) / 180;
    area += (xj - xi) * (2 + Math.sin(yi) + Math.sin(yj));
  }
  const R = 6378137;
  area = Math.abs((area * R * R) / 2.0);
  return area;
};

const calculatePolylineLength = (coordinates: Array<{ lat: number; lng: number }>): number[] => {
  if (coordinates.length < 2) return [0];
  const lengthArr = [0];
  let length = 0;
  for (let i = 1; i < coordinates.length; i++) {
    const { lng: lng1, lat: lat1 } = coordinates[i - 1];
    const { lng: lng2, lat: lat2 } = coordinates[i];
    length += calculateDistance(lng1, lat1, lng2, lat2);
    lengthArr.push(length);
  }
  return lengthArr;
};

const getPolylineCoordinates = (polyline: any): Array<[number, number]> => {
  if (!polyline || !polyline.getPath) {
    console.error('无效的折线对象');
    return [];
  }
  try {
    const path = polyline.getPath();
    if (!Array.isArray(path)) {
      return [];
    }
    const coordinates = path
      .map((point: any) => {
        if (Array.isArray(point)) {
          return { lng: point[0], lat: point[1] } as { lat: number; lng: number };
        } else if (point && typeof point === 'object') {
          return { lng: point.lng || point.lon || 0, lat: point.lat || 0 } as { lat: number; lng: number };
        }
        return { lat: 0, lng: 0 } as { lat: number; lng: number };
      })
      .filter((coord: { lat: number; lng: number }) => !isNaN(coord.lat) && !isNaN(coord.lng));
    let length = [];
    if (coordinates.length >= 2) {
      length = calculatePolylineLength(coordinates);
    }
    return {
      polygon: coordinates,
      len: length,
      type: 'polyline'
    };
  } catch (error) {
    console.error('获取折线坐标失败:', error);
    return [];
  }
};

const getCircleCoordinates = (
  circle: any
): {
  center: [number, number];
  radius: number;
} => {
  if (!circle || !circle.getCenter || !circle.getRadius) {
    console.error('无效的圆形对象');
    return { center: [0, 0], radius: 0 };
  }
  try {
    const center = circle.getCenter();
    const radius = circle.getRadius();
    const centerCoords: [number, number] = [center.lng || center.lon || 0, center.lat || 0];
    return {
      polygon: {
        center: {
          lat: centerCoords[1],
          lng: centerCoords[0]
        },
        radius
      }
    };
  } catch (error) {
    console.error('获取圆形坐标失败:', error);
    return { center: [0, 0], radius: 0 };
  }
};

const getRectangleCoordinates = (
  rectangle: any
): {
  southwest: [number, number];
  northeast: [number, number];
  bounds: Array<[number, number]>;
} => {
  if (!rectangle || !rectangle.getBounds) {
    console.error('无效的矩形对象');
    return {
      southwest: [0, 0],
      northeast: [0, 0],
      bounds: []
    };
  }
  try {
    const bounds = rectangle.getBounds();
    const southwest = bounds.getSouthWest();
    const northeast = bounds.getNorthEast();
    const swCoords: [number, number] = [southwest.lng || southwest.lon || 0, southwest.lat || 0];
    const neCoords: [number, number] = [northeast.lng || northeast.lon || 0, northeast.lat || 0];
    const width = calculateDistance(swCoords[0], swCoords[1], neCoords[0], swCoords[1]);
    const height = calculateDistance(swCoords[0], swCoords[1], swCoords[0], neCoords[1]);
    const area = width * height;
    return {
      polygon: {
        topLeft: {
          lat: swCoords[1],
          lng: swCoords[0]
        },
        bottomRight: {
          lat: neCoords[1],
          lng: neCoords[0]
        }
      },
      sum: area.toFixed(2),
      len: area.toFixed(2),
      type: 'rectangle'
    };
  } catch (error) {
    console.error('获取矩形坐标失败:', error);
    return {
      polygon: {
        topLeft: {
          lat: 0,
          lng: 0
        },
        bottomRight: {
          lat: 0,
          lng: 0
        }
      },
      sum: (0).toFixed(2),
      len: (0).toFixed(2),
      type: 'rectangle'
    };
  }
};

const getMarkerCoordinates = (marker: any): [number, number] => {
  if (!marker || !marker.getPosition) {
    console.error('无效的标记对象');
    return [0, 0];
  }
  try {
    const position = marker.getPosition();
    const coords: [number, number] = [position.lng || position.lon || 0, position.lat || 0];
    return coords;
  } catch (error) {
    console.error('获取标记点坐标失败:', error);
    return [0, 0];
  }
};

const clearMarkers = () => {
  cleanupResources.markers.forEach((marker) => {
    try {
      if (mapInstance && typeof mapInstance.remove === 'function') {
        mapInstance.remove(marker);
      }
      if (typeof marker.destroy === 'function') {
        marker.destroy();
      }
    } catch (e) {}
  });
  cleanupResources.markers = [];
};

const clearOverlays = () => {
  cleanupResources.overlays.forEach((overlay) => {
    try {
      if (mapInstance && typeof mapInstance.remove === 'function') {
        mapInstance.remove(overlay);
      }
      if (typeof overlay.destroy === 'function') {
        overlay.destroy();
      }
    } catch (e) {}
  });
  cleanupResources.overlays = [];
  cleanupResources.layerGroup = null;
  layerGroup = null;
};

const drawCreatedBack = (e) => {
  const drawLayer = e.layer;
  drawLayer.options.draw = true;
  if (!drawLayerGrounp || !drawLayerGrounp._map) {
    drawLayerGrounp = new L.FeatureGroup();
    mapInstance.addLayer(drawLayerGrounp);
  }
  drawLayerGrounp.addLayer(drawLayer);
  let len = 0;
  let polygon: null;
  if (e.layer instanceof L.Circle || e.layer instanceof L.CircleMarker) {
    const center = e.layer.getLatLng();
    const radius = e.layer.getRadius();
    polygon = { center, radius };
  } else if (e.layer instanceof L.Rectangle) {
    const bounds = e.layer.getBounds();
    const topLeft = bounds.getNorthWest();
    const bottomRight = bounds.getSouthEast();
    polygon = { topLeft, bottomRight };
  } else {
    polygon = e.layer.getLatLngs();
    switch (e.layerType) {
      case 'polyline':
        polygon = polygon.map((item) => ({ lat: item.lat, lng: item.lng }));
        len = formatLength(polygon);
        break;
      case 'polygon':
        polygon = polygon[0];
        len = formatArea(polygon);
        break;
    }
  }

  const data = {
    type: e.layerType,
    e: e,
    layer: drawLayer,
    polygon: polygon,
    len: len
  };
  drawObj.disable();
  mapInstance.setDefaultCursor('default');
  emits('drawCreatedBack', data);
};

// ==================== Watches ====================

watch(
  () => props.showGrid,
  () => {
    initPl();
  },
  {
    immediate: true
  }
);

watch(
  () => props.showMarkers,
  () => {
    playbackOptions.value.showMarkers = props.showMarkers;
  },
  {
    immediate: true
  }
);

watch(
  () => trackSegments.value,
  (newVal, oldVal) => {
    if (oldVal && newVal !== oldVal) {
      if (hook.value) {
        hook.value.clearLayers();
      }
    }
  }
);

// ==================== 🔴 修改7：轨迹回放相关函数（使用 MessageChannel 让出主线程） ====================

const loadTrackData = async (data: any[]) => {
  try {
    // 显示加载状态
    isLoading.value = true;
    loadingText.value = '正在加载轨迹数据...';
    loadingProgress.value = 0;
    showProgress.value = true;

    // ✅ 使用 MessageChannel 让出主线程
    await yieldControl('message');

    await getMapInstance();

    // 更新数据
    trackSegments.value = data;
    loadingProgress.value = 30;
    loadingText.value = '正在更新轨迹数据...';

    // ✅ 再次让出主线程
    await yieldControl('message');

    // 判断是否已初始化
    if (isHookInitialized && hook.value) {
      // 复用现有实例，只更新数据
      loadingText.value = '正在更新轨迹...';
      loadingProgress.value = 50;

      await yieldControl('message');

      // 直接调用 loadTrackData 更新数据
      await hook.value.loadTrackData(trackSegments.value);

      loadingProgress.value = 90;
      loadingText.value = '更新完成...';
    } else {
      // 首次创建
      loadingText.value = '正在初始化轨迹回放...';
      loadingProgress.value = 50;

      await yieldControl('message');

      hook.value = useTrackPlayback(
        mapInstance,
        trackSegments.value,
        playbackOptions.value
      );
      hook.value.drawLineCount = 0;
      cleanupResources.hook = hook.value;
      isHookInitialized = true;

      loadingProgress.value = 70;
      loadingText.value = '正在初始化...';

      await yieldControl('message');

      // 初始化
      await hook.value.init();
    }

    showPlayback.value = true;
    loadingProgress.value = 100;

    // ✅ 使用 setTimeout 确保 UI 更新完成
    await yieldControl('timeout');

    isLoading.value = false;
    showProgress.value = false;

    emits('loadProgress', 100);
    console.log('轨迹数据加载完成');

  } catch (e) {
    console.error('加载轨迹数据失败:', e);
    isLoading.value = false;
    showProgress.value = false;
  }
};

// 🔴 修改8：批量加载轨迹数据
const loadBatchTrackData = async (dataArray: any[][]) => {
  try {
    isLoading.value = true;
    loadingText.value = '正在批量加载轨迹数据...';
    loadingProgress.value = 0;
    showProgress.value = true;

    await yieldControl('message');
    await getMapInstance();

    // 合并所有批次数据
    const allData: TrackSegment[] = [];
    let totalBatches = dataArray.length;
    let completedBatches = 0;

    for (const batch of dataArray) {
      allData.push(...batch);
      completedBatches++;
      loadingProgress.value = Math.round((completedBatches / totalBatches) * 50);
      loadingText.value = `正在加载批次 ${completedBatches}/${totalBatches}...`;

      // ✅ 每批处理后让出主线程
      await yieldControl('message');
    }

    // 加载合并后的数据
    loadingProgress.value = 60;
    loadingText.value = '正在处理轨迹数据...';
    await yieldControl('message');

    trackSegments.value = allData;
    loadingProgress.value = 70;
    await yieldControl('message');

    // 判断是否已初始化
    if (isHookInitialized && hook.value) {
      await hook.value.loadTrackData(trackSegments.value);
    } else {
      hook.value = useTrackPlayback(mapInstance, trackSegments.value, playbackOptions.value);
      hook.value.drawLineCount = 0;
      cleanupResources.hook = hook.value;
      isHookInitialized = true;
      await hook.value.init();
    }

    showPlayback.value = true;
    loadingProgress.value = 100;

    await yieldControl('timeout');

    isLoading.value = false;
    showProgress.value = false;

    emits('loadProgress', 100);
    console.log('批量轨迹数据加载完成');

  } catch (e) {
    console.error('批量加载轨迹数据失败:', e);
    isLoading.value = false;
    showProgress.value = false;
  }
};

const closeTrackData = () => {
  if (hook.value) {
    try {
      hook.value.clearLayers();
      hook.value.pause();
      if (hook.value.currentSegmentIndex) {
        hook.value.currentSegmentIndex.value = 0;
      }
      if (hook.value.currentPointIndex) {
        hook.value.currentPointIndex.value = 0;
      }
    } catch (e) {
      console.warn('清理轨迹图层失败:', e);
    }
  }
  showPlayback.value = false;
};

const resetTrackData = () => {
  if (hook.value) {
    try {
      hook.value.clearLayers();
      hook.value.pause();
      if (hook.value.currentSegmentIndex) {
        hook.value.currentSegmentIndex.value = 0;
      }
      if (hook.value.currentPointIndex) {
        hook.value.currentPointIndex.value = 0;
      }
      trackSegments.value = [];
      hook.value.loadTrackData([]);
    } catch (e) {
      console.warn('重置轨迹数据失败:', e);
    }
  }
  showPlayback.value = false;
};

const togglePlaybackWrapper = () => {
  hook.value?.togglePlay();
};

const resetPlaybackWrapper = () => {
  hook.value?.reset();
};

const setPlaybackSpeedWrapper = (speed: number) => {
  hook.value?.setSpeed(speed);
};

const seekToPointWrapper = (segmentIndex: number, pointIndex: number) => {
  hook.value?.seekTo(segmentIndex, pointIndex);
};

const selectSegment = (index: number) => {
  if (hook.value) {
    hook.value.currentSegmentIndex.value = index;
    hook.value.currentPointIndex.value = 0;
    hook.value.drawTrackLine();
  }
};

const previousPoint = () => {
  if (hook.value && hook.value.currentPointIndex > 0) {
    hook.value.currentPointIndex--;
    seekToPointWrapper(hook.value.currentSegmentIndex, hook.value.currentPointIndex);
  }
};

const nextPoint = () => {
  if (hook.value && hook.value.currentSegment &&
      hook.value.currentPointIndex < hook.value.currentSegment.points.length - 1) {
    hook.value.currentPointIndex++;
    seekToPointWrapper(hook.value.currentSegmentIndex, hook.value.currentPointIndex);
  }
};

const updatePlaybackOptions = (newOptions: { autoCenter?: boolean; showTrack?: boolean; showMarkers?: boolean; loop?: boolean }) => {
  const updatedOptions = {
    ...playbackOptions.value,
    ...newOptions
  };
  playbackOptions.value = updatedOptions;
  if (newOptions.showTrack !== undefined || typeof newOptions.showMarkers !== 'undefined') {
    hook.value?.drawTrackLine(updatedOptions);
  }
  emits('playbackOptionsUpdated', updatedOptions);
};

const clickMarker = (marker) => {
  if (!marker) return;
  marker.emit('click', {
    target: {
      getPosition: marker.getPosition,
      _position: marker.getPosition()
    }
  });
};

// ==================== 生命周期 ====================

onMounted(async () => {
  createMap(mapId.value, props.center);
  const { height, dom } = getRemainingHeight(props.baseClass, ['.mapContainer']);
  heightInner.value = props.height ?? height + 'px';
  await loadImages();
});

onBeforeUnmount(() => {
  isComponentUnmounted = true;

  if (hook.value) {
    try {
      hook.value.clearLayers();
      hook.value.pause();
    } catch (e) {
      console.warn('清理 hook 失败:', e);
    }
  }

  destroyMap();
});

// ==================== 暴露方法 ====================

defineExpose({
  loadTrackData,
  loadBatchTrackData,
  togglePlayback: togglePlaybackWrapper,
  resetPlayback: resetPlaybackWrapper,
  setPlaybackSpeed: setPlaybackSpeedWrapper,
  seekToPoint: seekToPointWrapper,
  playTrack: hook.value?.play,
  pauseTrack: hook.value?.pause,
  map: mapInstance,
  drawControl: drawControl,
  initDrawCtrl,
  startDraw,
  stopDraw,
  closeTrackData,
  resetTrackData,
  getMarkers: () => cleanupResources.markers,
  clickMarker,
  destroyMap,
  cleanup: cleanupAllResources,
  isLoading,
  hook,
  yieldControl
});
</script>

<style scoped lang="scss">
/* ==================== 加载样式 ==================== */
.loading-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.85);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.loading-content {
  background: white;
  padding: 40px 50px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  text-align: center;
  min-width: 300px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e8e8e8;
  border-top: 4px solid #1890ff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

.loading-text {
  font-size: 16px;
  color: #333;
  margin-bottom: 16px;
}

.loading-progress {
  width: 100%;
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
  position: relative;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #1890ff, #52c41a);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  position: absolute;
  right: 0;
  top: -20px;
  font-size: 12px;
  color: #666;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* ==================== 原有样式 ==================== */
.playback-control-container {
  position: absolute;
  top: 70px;
  right: 20px;
  z-index: 1000;
}

:deep(.leaflet-popup-content) {
  margin: 0 !important;
  width: 500px !important;
  padding: 10px !important;
}

.mapContainer {
  position: relative;
  overflow: hidden;

  .top-com {
    position: absolute;
    top: 10px;
    z-index: 410;
  }

  .left-com {
    position: absolute;
    top: 0;
    left: 0;
  }

  .lnglatSearch {
    position: absolute;
    top: 10px;
    right: 20px;
    z-index: 410;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}

:deep(.leaflet-draw) {
  display: none;
}

:deep(.custom-cluster) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  text-align: center;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 3px solid white;
}

:deep(.custom-cluster-small) {
  width: 40px;
  height: 40px;
  line-height: 34px;
  font-size: 14px;
}

:deep(.custom-cluster-medium) {
  width: 50px;
  height: 50px;
  line-height: 44px;
  font-size: 16px;
}

:deep(.custom-cluster-large) {
  width: 60px;
  height: 60px;
  line-height: 54px;
  font-size: 18px;
}

:deep(.custom-icon) {
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  }
}

:deep(.leaflet-pm-toolbar) {
  display: none !important;

  .leaflet-buttons-control-button {
    background-color: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin: 2px;

    &:hover {
      background-color: #f0f0f0;
    }

    &.active {
      background-color: #3388ff;
      color: white;
      border-color: #3388ff;
    }
  }
}

:deep(.leaflet-pm-icon) {
  filter: brightness(0) saturate(100%) invert(39%) sepia(98%) saturate(7485%) hue-rotate(206deg) brightness(98%) contrast(101%);
}

:deep(.leaflet-pm-draggable) {
  cursor: move !important;
}
</style>
