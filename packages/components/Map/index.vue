<template>
  <div class="mapContainer" ref="mapContainer">
    <div :id="mapId" class="map" :style="`width: 100%; height: ${heightInner}`"></div>
    <div class="top-com">
      <slot name="top"></slot>
    </div>
    <div class="left-com">
      <slot name="left"></slot>
    </div>
    <div class="right-com">
      <slot name="right"></slot>
    </div>
    <div class="left-bottom-com">
      <slot name="leftBottom"></slot>
    </div>
    <div class="right-bottom-com">
      <slot name="rightBottom"></slot>
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
        :is-playing="isPlaying"
        :current-segment-index="currentSegmentIndex"
        :current-point-index="currentPointIndex"
        :speed="playbackSpeed"
        :current-segment="currentSegment"
        :current-point="currentPoint"
        :progress="playbackProgress"
        :total-distance="totalDistance"
        :traveled-distance="traveledDistance"
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

<script lang="ts" setup name="MyMap">
import type { ComponentInternalInstance } from 'vue'
import {
  computed,
  getCurrentInstance,
  onBeforeUnmount,
  onMounted,
  type PropType,
  ref,
  watch,
} from 'vue'
import L from 'leaflet'
import AMapLoad, { type AMapNamespace } from './AMap'
import TrackPlaybackControl from './TrackPlaybackControl.vue'
import { getRemainingHeight } from '@/components/FormTable/js/utils'
import { isLat, isLng } from '@/utils/validate'
import useTrackPlayback, {
  type PlaybackOptions,
  type TrackPoint,
  type TrackSegment,
  type UseTrackPlaybackReturn,
} from '@/components/FormTable/utils/hooks/useTrackPlayback'
import { useListenDomChange } from '@/components/FormTable/utils/hooks'

// ==================== 类型定义 ====================
// 定义绘制相关类型
type DrawMode = 'Marker' | 'Circle' | 'Polyline' | 'Rectangle' | 'Polygon' | ''

/** 支持的绘制类型 */
type DrawType = 'Marker' | 'Circle' | 'Polyline' | 'Rectangle' | 'Polygon'

/** 标记点/图形节点数据 */
export interface PointData {
  /** 纬度 */
  lat: number
  /** 经度 */
  lng: number
  /** 标记文字 */
  txt?: string
  /** 自定义 class */
  class?: string
  /** 自定义 style */
  style?: string
  /** 边线颜色 */
  color?: string
  /** 填充颜色 */
  fillColor?: string
  /** 填充透明度 */
  fillOpacity?: number
  /** 是否/放大到指定级别，false 时不改变缩放级别 */
  zoom?: boolean | number
  /** 信息窗内容（可为字符串/Promise/函数） */
  popup?:
    | string
    | ((data: { [key: string]: string | number } | undefined) => string | Promise<string>)
  /** 点击回调 */
  cb?: (point: PointData) => void
  /** 附加业务数据 */
  extData?: Record<string, any>

  [key: string]: any
}

/** 图形数据：点对象或 "lng,lat" 字符串 */
type ShapeData = Array<PointData | string>

/** 圆形绘制参数：[中心点, 半径(米)] */
type CircleData = [PointData, number]

/** 绘制完成后提取的坐标结果 */
interface DrawCoordinatesResult {
  polygon: any
  sum?: string
  len?: number[] | string
  type: string
}

/** 地图视野信息 */
interface MapBoundsInfo {
  bounds: any
  zoom: number
  center: any
  range: { x: number; y: number; width: number; height: number }
}

/** 轨迹段入参：外部调用时 id/name 可缺省，加载时自动补全 */
type TrackSegmentInput = Omit<TrackSegment, 'id' | 'name'> &
  Partial<Pick<TrackSegment, 'id' | 'name'>>

/** 归一化轨迹段数据，补全 hook 所需的 id/name */
const normalizeSegments = (list: TrackSegmentInput[]): TrackSegment[] => {
  return list.map((seg, index) => ({
    ...seg,
    id: seg.id ?? index,
    name: seg.name ?? `segment-${index + 1}`,
  }))
}

// 加载状态
const isLoading = ref(false)
const loadingText = ref('加载中...')
const loadingProgress = ref(0)
const showProgress = ref(true)

// 所有 ref 声明
const mapId = computed(() => {
  return window.location.href.toString()
})
const lnglat = ref('')
const { proxy } = getCurrentInstance() as ComponentInternalInstance

const props = defineProps({
  onlyByOne: {
    type: Boolean,
    default: true,
  },
  showMarkers: {
    type: Boolean,
    default: true,
  },
  selectGrid: {
    type: Object as PropType<Record<string, any>>,
    default: () => {
      return {}
    },
  },
  center: {
    type: Array as PropType<Array<string | number>>,
    default: (): Array<string | number> => {
      return []
    },
  },
  zoom: {
    type: Number,
    default: 5,
  },
  minZoom: {
    type: Number,
    default: 2,
  },
  maxZoom: {
    type: Number,
    default: 26,
  },
  disableClustering: {
    type: Number,
    default: undefined,
  },
  showGrid: {
    type: Boolean,
    default: false,
  },
  showDefaultSlot: {
    type: Boolean,
    default: true,
  },
  gridType: {
    type: String as PropType<'big' | 'small'>,
    default: 'small',
  },
  iconSize: {
    type: Array as PropType<number[]>,
    default: (): number[] => {
      return [24, 36]
    },
  },
  iconUrl: {
    type: String,
    default: 'mark_bs',
  },
  height: {
    type: String,
    default: undefined,
  },
  highLightColor: {
    type: String,
    default: '#00FF00',
  },
  baseClass: {
    type: String,
    default: '.app-main',
  },
  lowLightColor: {
    type: String,
    default: '#ff7f00',
  },
  draw: {
    type: Boolean,
    default: false,
  },
  // 性能优化配置
  maxPoints: {
    type: Number,
    default: 5000,
  },
  batchSize: {
    type: Number,
    default: 1000,
  },
  enableLazyLoad: {
    type: Boolean,
    default: true,
  },
})

// 所有 ref
const mapContainer = useTemplateRef('mapContainer')
const imageMap = ref<Record<string, string>>({})
const heightInner = ref('100vh')
const isMapReady = ref(false)
const showPlayback = ref(false)
const trackSegments = ref<TrackSegment[]>([])
const playbackControl = ref<InstanceType<typeof TrackPlaybackControl>>()
const hook = ref<UseTrackPlaybackReturn>()
const playbackOptions = ref<Required<PlaybackOptions>>({
  speed: 1,
  autoCenter: false,
  showTrack: true,
  showMarkers: true,
  loop: false,
})
const drawType = ref<DrawType | ''>('')

// 普通变量
/** 高德地图实例（AMap.Map） */
let mapInstance: any = null
/** 单点标记（leaflet 兼容逻辑使用） */
let marker: any = null
/** 地图实例就绪等待队列 */
let resolveQueue: Array<(map?: any) => void> = []
let drawLayerGrounp: any = null
/** 已绘制的图形图层集合 */
let layerGroup: any[] | null = null
let markers: any[] = []
let overlays: any[] = []
/** 高德鼠标绘制插件（AMap.MouseTool） */
let drawPlugin: any = null
const drawControl: any = null
/** 高德 JS API 命名空间（createMap 中赋值） */
let AMap: AMapNamespace
let isMapDestroyed = false
let isComponentUnmounted = false
let isHookInitialized = false

// 清理资源结构
const cleanupResources = {
  markers: [] as any[],
  overlays: [] as any[],
  infoWindows: [] as any[],
  eventHandlers: [] as { type: string; handler: Function }[],
  timers: [] as NodeJS.Timeout[],
  drawPlugin: null as any,
  layerGroup: null as any,
  hook: null as any,
}

// emits 定义
const emits = defineEmits([
  'click',
  'drawCreatedBack',
  'mapmove',
  'loadProgress',
  'mapReady',
  'playbackOptionsUpdated',
])

// icon 计算
const icon = computed<L.Icon>(() => {
  return L.icon({
    iconSize: props.iconSize as [number, number],
    iconUrl: imageMap.value[props.iconUrl],
  })
})

// ==================== 🔴 修改1：正确的让出主线程工具函数 ====================
// ✅ 使用 MessageChannel 让出主线程（最快，推荐）
const yieldToMainThread = () => {
  return new Promise((resolve) => {
    const channel = new MessageChannel()
    channel.port1.onmessage = () => {
      resolve(true)
    }
    channel.port2.postMessage(null)
  })
}

// ✅ 使用 setTimeout 让出主线程（兼容性最好）
const yieldToMainThreadWithTimeout = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, 0)
  })
}

// ✅ 使用 requestIdleCallback 让出主线程（浏览器空闲时执行）
const yieldToMainThreadWithIdle = () => {
  return new Promise((resolve) => {
    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(() => {
        resolve(true)
      })
    } else {
      setTimeout(() => resolve(true), 0)
    }
  })
}

// 组合使用
const yieldControl = (type: 'timeout' | 'message' | 'idle' = 'message') => {
  switch (type) {
    case 'timeout':
      return yieldToMainThreadWithTimeout()
    case 'message':
      return yieldToMainThread()
    case 'idle':
      return yieldToMainThreadWithIdle()
    default:
      return yieldToMainThread()
  }
}

// ==================== 清理函数 ====================
const cleanupMapEvents = () => {
  if (!mapInstance) return
  try {
    cleanupResources.eventHandlers.forEach(({ type, handler }) => {
      if (mapInstance && typeof mapInstance.off === 'function') {
        mapInstance.off(type, handler)
      }
    })
    cleanupResources.eventHandlers = []
  } catch (e) {
    console.warn('清理地图事件失败:', e)
  }
}

const cleanupAllResources = () => {
  if (isMapDestroyed) return
  try {
    cleanupMapEvents()

    cleanupResources.markers.forEach((marker) => {
      try {
        if (mapInstance && typeof mapInstance.remove === 'function') {
          mapInstance.remove(marker)
        }
        if (typeof marker.destroy === 'function') {
          marker.destroy()
        }
      } catch (e) {}
    })
    cleanupResources.markers = []

    cleanupResources.overlays.forEach((overlay) => {
      try {
        if (mapInstance && typeof mapInstance.remove === 'function') {
          mapInstance.remove(overlay)
        }
        if (typeof overlay.destroy === 'function') {
          overlay.destroy()
        }
      } catch (e) {}
    })
    cleanupResources.overlays = []

    cleanupResources.infoWindows.forEach((infoWindow) => {
      try {
        if (typeof infoWindow.close === 'function') {
          infoWindow.close()
        }
        if (typeof infoWindow.destroy === 'function') {
          infoWindow.destroy()
        }
      } catch (e) {}
    })
    cleanupResources.infoWindows = []

    if (cleanupResources.drawPlugin) {
      try {
        if (typeof cleanupResources.drawPlugin.close === 'function') {
          cleanupResources.drawPlugin.close()
        }
        if (typeof cleanupResources.drawPlugin.destroy === 'function') {
          cleanupResources.drawPlugin.destroy()
        }
      } catch (e) {}
      cleanupResources.drawPlugin = null
    }

    if (cleanupResources.hook) {
      try {
        if (typeof cleanupResources.hook.clearLayers === 'function') {
          cleanupResources.hook.clearLayers()
        }
        if (typeof cleanupResources.hook.pause === 'function') {
          cleanupResources.hook.pause()
        }
        if (cleanupResources.hook.currentSegmentIndex) {
          cleanupResources.hook.currentSegmentIndex.value = 0
        }
        if (cleanupResources.hook.currentPointIndex) {
          cleanupResources.hook.currentPointIndex.value = 0
        }
      } catch (e) {}
    }

    cleanupResources.timers.forEach((timer) => {
      try {
        clearTimeout(timer)
        clearInterval(timer)
      } catch (e) {}
    })
    cleanupResources.timers = []

    if (cleanupResources.layerGroup) {
      try {
        if (mapInstance && typeof mapInstance.remove === 'function') {
          mapInstance.remove(cleanupResources.layerGroup)
        }
      } catch (e) {}
      cleanupResources.layerGroup = null
    }

    markers = []
    overlays = []
    layerGroup = null
    drawPlugin = null
    drawLayerGrounp = null
  } catch (e) {
    console.warn('清理资源时出错:', e)
  }
}

const destroyMap = () => {
  if (isMapDestroyed) return
  isMapDestroyed = true
  try {
    cleanupAllResources()
    if (mapInstance) {
      if (typeof mapInstance.off === 'function') {
        mapInstance.off()
      }
      if (typeof mapInstance.destroy === 'function') {
        mapInstance.destroy()
      }
      mapInstance = null
    }
    isMapReady.value = false
  } catch (e) {
    console.warn('销毁地图失败:', e)
  }
}

// ==================== 工具函数 ====================
const getMapInstance = (): Promise<any> => {
  return new Promise((resolve) => {
    if (mapInstance) return resolve(mapInstance)
    else {
      resolveQueue.push(resolve)
    }
  })
}

const removeLayer = (lay: any | any[]) => {
  if (Array.isArray(lay)) {
    for (let i = 0; i < lay.length; i++) {
      mapInstance.removeLayer(lay[i])
    }
  } else mapInstance.removeLayer(lay)
}

const mapSetCenter = async (): Promise<boolean | void> => {
  const lng = lnglat.value.split(',')[0]
  const lat = lnglat.value.split(',')[1]
  if (!isLng(lng)) {
    proxy?.$modal.msgError('请输入正确的经纬度，中间用,分隔')
    return false
  }
  if (!isLat(lat)) {
    proxy?.$modal.msgError('请输入正确的经纬度，中间用,分隔')
    return false
  }
  const obj = [lat, lng]
  await getMapInstance()
  mapInstance.setView(obj)
}

const getBounds = (): MapBoundsInfo => {
  const size = mapInstance?.getSize()
  size.x = size.width
  size.y = size.height
  return {
    bounds: mapInstance?.getBounds(),
    zoom: mapInstance?.getZoom(),
    center: mapInstance?.getCenter(),
    range: size,
  }
}

const loadImages = async (): Promise<void> => {
  const modules = import.meta.glob('@/assets/images/map/*.{png,jpg,jpeg,svg}')
  for (const path in modules) {
    const module = (await modules[path]()) as { default: string }
    const imageName = path.split('/').pop()!.split('.')[0]
    imageMap.value[imageName] = module.default
  }
}

// ==================== 地图初始化 ====================
const initPl = async (): Promise<void> => {
  await getMapInstance()
  if (props.showGrid) {
  } else if (props.draw) {
    initDrawCtrl()
  } else {
    const internal = getCurrentInstance()
    const onEmit = (internal?.vnode.props || {}) as Record<string, any>
    if (onEmit['onMapmove'] || !internal) {
      const zoomEndHandler = () => {
        emits('mapmove', getBounds())
      }
      const moveEndHandler = () => {
        emits('mapmove', getBounds())
      }
      mapInstance.on('zoomend', zoomEndHandler)
      cleanupResources.eventHandlers.push({ type: 'zoomend', handler: zoomEndHandler })
      mapInstance.on('moveend', moveEndHandler)
      cleanupResources.eventHandlers.push({ type: 'moveend', handler: moveEndHandler })
    }
    if (onEmit['onClick'] || !internal) {
      const clickHandler = (e: any) => {
        const lat = e.lnglat.lat,
          lng = e.lnglat.lng
        if (props.onlyByOne) {
          if (marker != null) removeLayer(marker)
          marker = new L.Marker([lat, lng], { icon: icon.value }).addTo(mapInstance!)
          emits('click', { lat: lat, lng: lng }, marker)
        }
      }
      mapInstance.on('click', clickHandler)
      cleanupResources.eventHandlers.push({ type: 'click', handler: clickHandler })
    }
  }
}
/**
 * 探测单张瓦片能否出图（所有源通用）
 */
const probeByImg = (url: string, timeout = 1500, maxRetry = 5): Promise<boolean> => {
  return new Promise((resolve) => {
    let retryCount = 0

    const attempt = () => {
      const img = new Image()
      let settled = false

      const finish = (ok: boolean, isAbort = false) => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        img.onload = null
        img.onerror = null
        img.onabort = null

        if (ok) {
          resolve(true)
          return
        }

        // 取消/超时 → 重试
        if (isAbort && retryCount < maxRetry) {
          retryCount++
          // 小延迟后重试，避免连续被取消
          setTimeout(attempt, 150)
          return
        }

        // 真失败 或 重试耗尽
        resolve(false)
      }

      const timer = setTimeout(() => {
        img.src = ''
        finish(false, true) // 超时当取消处理，允许重试
      }, timeout)

      img.onload = () => finish(img.naturalWidth > 1 && img.naturalHeight > 1)
      img.onerror = () => finish(false, false) // 真失败，不重试
      img.onabort = () => finish(false, true) // 取消 → 重试

      img.src = url
    }

    attempt()
  })
}
/**
 * 占位符替换（统一处理两种格式），把 z/x/y/l 换成 1
 */
const buildProbeUrl = (tpl: string, subdomain?: string): string => {
  let url = tpl
    .replace(/\[z\]/g, '1')
    .replace(/\[x\]/g, '1')
    .replace(/\[y\]/g, '1')
    .replace(/\[l\]/g, '1')
    .replace(/\{z\}/g, '1')
    .replace(/\{x\}/g, '1')
    .replace(/\{y\}/g, '1')
  if (subdomain) {
    url = url.replace(/t\{[^}]*\}/, subdomain)
  }
  return url
}
/**
 * 探测 GeoVisEarth（单域名，探一次）
 */
const checkGeoVis = (urlTemplate: string, timeout = 1500): Promise<boolean> => {
  return probeByImg(buildProbeUrl(urlTemplate), timeout)
}
/**
 * 探测天地图：并发探 t0~t7，任意一个出图即可用
 */
const checkTianditu = (urlTemplate: string, timeout = 1500): Promise<boolean> => {
  const subMatch = urlTemplate.match(/t\{([^}]*)\}/)

  // 没有子域名占位符，直接探一次
  if (!subMatch) {
    return probeByImg(buildProbeUrl(urlTemplate), timeout)
  }

  const subdomains = subMatch[1].split(',').map((s) => s.trim())

  // 并发探测，任意一个出图即 true
  return new Promise<boolean>((resolve) => {
    let pending = subdomains.length
    let settled = false

    subdomains.forEach((sub) => {
      const url = buildProbeUrl(urlTemplate, `t${sub}`)
      probeByImg(url, timeout).then((ok) => {
        if (settled) return
        if (ok) {
          settled = true
          resolve(true)
        } else if (--pending === 0) {
          settled = true
          resolve(false)
        }
      })
    })
  })
}
/**
 * 降级链：GeoVisEarth -> 天地图 -> 高德
 */
const probeCache = new Map<string, boolean>()

const decideLayers = async (
  zkxt_satellite_layer: any,
  tianditu_cia_layer: any,
  tianditu_img_c_layer: any
): Promise<{ name: string; layers: any[]; cachedName?: string }> => {
  const geovisUrl = (zkxt_satellite_layer as any)?._tileUrl as string | undefined
  const tdtUrl = (tianditu_cia_layer as any)?._tileUrl as string | undefined
  const FINAL_LAYER_KEY = 'FINAL_LAYER_KEY'
  try {
    const cachedName = sessionStorage.getItem(FINAL_LAYER_KEY)
    if (cachedName === 'geovis') {
      return { name: 'geovis', cachedName, layers: [zkxt_satellite_layer, tianditu_cia_layer] }
    }
    if (cachedName === 'tianditu') {
      return { name: 'tianditu', cachedName, layers: [tianditu_img_c_layer, tianditu_cia_layer] }
    }
    if (cachedName === 'amap') {
      return { name: 'amap', cachedName, layers: [new AMap.TileLayer()] }
    }
  } catch {}
  // ---- 1) GeoVisEarth ----
  if (geovisUrl) {
    let ok = probeCache.get('geovis')
    if (ok === undefined) {
      ok = await checkGeoVis(geovisUrl)
      probeCache.set('geovis', ok)
    }
    if (ok) {
      sessionStorage.setItem(FINAL_LAYER_KEY, 'geovis')
      return { name: 'geovis', layers: [zkxt_satellite_layer, tianditu_cia_layer] }
    }
  }

  // ---- 2) 天地图 ----
  if (tdtUrl) {
    let ok = probeCache.get('tianditu')
    if (ok === undefined) {
      ok = await checkTianditu(tdtUrl)
      probeCache.set('tianditu', ok)
    }
    if (ok) {
      sessionStorage.setItem(FINAL_LAYER_KEY, 'tianditu')
      return { name: 'tianditu', layers: [tianditu_img_c_layer, tianditu_cia_layer] }
    }
  }
  sessionStorage.setItem(FINAL_LAYER_KEY, 'amap')
  // ---- 3) 高德兜底 ----
  return { name: 'amap', layers: [new AMap.TileLayer()] }
}
const createMap = async (divId: string, center: Array<string | number> = []): Promise<void> => {
  const corner1 = [180, -90]
  const corner2 = [-180, 90]
  if ((center || []).length === 0) {
    center = [108.41339, 34.91092]
    if (props.selectGrid.bndCoords) {
      center = [props.selectGrid.lat, props.selectGrid.lon]
    }
  }
  let zoom = props.zoom
  zoom = zoom < props.minZoom ? props.minZoom : zoom
  zoom = zoom > props.maxZoom ? props.maxZoom : zoom
  AMap = await AMapLoad({})
  const zkxtToken = window.serverConfig.zkxt || ''
  const tdtToken = window.serverConfig.tdt || ''
  const zkxt_satellite_layer = new AMap.TileLayer({
    getTileUrl: `https://api.open.geovisearth.com/pj/base/v1/img/[z]/[x]/[y]?format=webp&tmsIds=w&token=${zkxtToken}`,
  })
  const tianditu_cia_layer = new AMap.TileLayer({
    getTileUrl: `https://t{0,1,2,3,4,5,6,7}.tianditu.gov.cn/DataServer?T=cia_w&tk=${tdtToken}&x=[x]&y=[y]&l=[z]`,
    zIndex: 90,
  })
  const tianditu_img_c_layer = new AMap.TileLayer({
    getTileUrl: `https://t{0,1,2,3,4,5,6,7}.tianditu.gov.cn/DataServer?T=img_w&tk=${tdtToken}&x=[x]&y=[y]&l=[z]`,
    zIndex: 10,
  })
  // console.log(zkxt_cia_layer._tileUrl);
  // console.log(tianditu_cia_c_layer._tileUrl);
  // let layers: any[] = [];
  // if (import.meta.env.VITE_APP_MAP_TYPE === 'tdt' || serverConfig.mapType === 'tdt') {
  //   layers = [tianditu_img_c_layer, tianditu_cia_c_layer];
  //   // layers = [new AMap.TileLayer()];
  // } else {
  //   layers = [zkxt_satellite_layer, tianditu_cia_layer];
  // }
  // layers = [zkxt_satellite_layer, tianditu_cia_layer];
  const map = new AMap.Map(divId, {
    center: center,
    maxZoom: props.maxZoom,
    minZoom: props.minZoom,
    zoom: zoom,
    showIndoorMap: false,
    layers: [new AMap.TileLayer()],
  })
  // 非 amap 配置才走降级链
  if (import.meta.env.VITE_APP_MAP_TYPE !== 'amap' || window.serverConfig.mapType !== 'amap') {
    const { name, cachedName, layers } = await decideLayers(
      zkxt_satellite_layer,
      tianditu_cia_layer,
      tianditu_img_c_layer
    )
    // console.log('图层降级结果:', name, cachedName);
    if (name != 'amap') map.setLayers(layers)
  }
  const completeHandler = () => {
    mapInstance = map
    resolveQueue.forEach((resolve) => resolve(mapInstance))
    resolveQueue = []
    isMapReady.value = true
    emits('mapmove', getBounds())
    emits('mapReady', mapInstance)
    initPl()
  }
  map.on('complete', completeHandler)
  cleanupResources.eventHandlers.push({ type: 'complete', handler: completeHandler })
}

const setupMapEvents = (map: any) => {
  cleanupMapEvents()
}

// ==================== 坐标转换函数 ====================
const PI = 3.1415926535897932384626
const a = 6378245.0
const ee = 0.00669342162296594323

const wgs84ToGcj02 = (lng: number, lat: number): [number, number] => {
  if (typeof lng !== 'number' || typeof lat !== 'number') {
    throw new Error('坐标参数必须是数字类型')
  }
  lat = +lat
  lng = +lng
  if (isNaN(lng) || isNaN(lat)) {
    throw new Error('坐标参数包含无效数字')
  }
  if (out_of_china(lng, lat)) {
    return [lng, lat]
  }
  let dlat = transformlat(lng - 105.0, lat - 35.0)
  let dlng = transformlng(lng - 105.0, lat - 35.0)
  const radlat = (lat / 180.0) * PI
  let magic = Math.sin(radlat)
  magic = 1 - ee * magic * magic
  const sqrtmagic = Math.sqrt(magic)
  dlat = (dlat * 180.0) / (((a * (1 - ee)) / (magic * sqrtmagic)) * PI)
  dlng = (dlng * 180.0) / ((a / sqrtmagic) * Math.cos(radlat) * PI)
  const mgLat = lat + dlat
  const mgLng = lng + dlng
  return [mgLng, mgLat]
}

const gcj02towgs84 = (lng: number, lat: number): [number, number] => {
  lat = +lat
  lng = +lng
  if (out_of_china(lng, lat)) {
    return [lng, lat]
  } else {
    let dlat = transformlat(lng - 105.0, lat - 35.0)
    let dlng = transformlng(lng - 105.0, lat - 35.0)
    const radlat = (lat / 180.0) * PI
    let magic = Math.sin(radlat)
    magic = 1 - ee * magic * magic
    const sqrtmagic = Math.sqrt(magic)
    dlat = (dlat * 180.0) / (((a * (1 - ee)) / (magic * sqrtmagic)) * PI)
    dlng = (dlng * 180.0) / ((a / sqrtmagic) * Math.cos(radlat) * PI)
    const mglat = lat + dlat
    const mglng = lng + dlng
    return [lng * 2 - mglng, lat * 2 - mglat]
  }
}

const out_of_china = (lng: number, lat: number): boolean => {
  lat = +lat
  lng = +lng
  return !(lng > 73.66 && lng < 135.05 && lat > 3.86 && lat < 53.55)
}

const transformlat = (lng: number, lat: number): number => {
  lat = +lat
  lng = +lng
  let ret =
    -100.0 +
    2.0 * lng +
    3.0 * lat +
    0.2 * lat * lat +
    0.1 * lng * lat +
    0.2 * Math.sqrt(Math.abs(lng))
  ret += ((20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0) / 3.0
  ret += ((20.0 * Math.sin(lat * PI) + 40.0 * Math.sin((lat / 3.0) * PI)) * 2.0) / 3.0
  ret += ((160.0 * Math.sin((lat / 12.0) * PI) + 320 * Math.sin((lat * PI) / 30.0)) * 2.0) / 3.0
  return ret
}

const transformlng = (lng: number, lat: number): number => {
  lat = +lat
  lng = +lng
  let ret =
    300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng))
  ret += ((20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0) / 3.0
  ret += ((20.0 * Math.sin(lng * PI) + 40.0 * Math.sin((lng / 3.0) * PI)) * 2.0) / 3.0
  ret += ((150.0 * Math.sin((lng / 12.0) * PI) + 300.0 * Math.sin((lng / 30.0) * PI)) * 2.0) / 3.0
  return ret
}

// ==================== 绘图相关函数 ====================
const initDrawCtrl = async (): Promise<void> => {
  await getMapInstance()
  mapInstance.off('click')
  drawPlugin = new AMap.MouseTool(mapInstance)
  cleanupResources.drawPlugin = drawPlugin
}

const stopDraw = (can_clear: number = 1) => {
  if (drawPlugin) {
    drawPlugin.close()
  }
  if (mapInstance && mapInstance.getAllOverlays) {
    const overlays = mapInstance.getAllOverlays()
    overlays.forEach((overlay: any) => {
      const extDataCan_clear = overlay?._opts?.extData?.can_clear ?? true
      if ((extDataCan_clear && can_clear == 1) || can_clear == 2)
        if (overlay._isTempDraw) {
          mapInstance.remove(overlay)
        }
    })
  }
  mapInstance?.setDefaultCursor('default')
}

const startDraw = async (
  idx: DrawType | 'Info',
  latLngs: ShapeData | CircleData | PointData[] = [],
  isClear: boolean | number = true,
  zhuanzhu: boolean = true
): Promise<void> => {
  await getMapInstance()
  mapInstance?.setDefaultCursor('default')
  if (isClear) stopDraw(typeof isClear == 'boolean' ? undefined : isClear)
  if (latLngs && latLngs.length > 0) {
    switch (idx) {
      case 'Polygon':
        await drawPolygon(latLngs, zhuanzhu)
        break
      case 'Polyline':
        await drawPolyline(latLngs, zhuanzhu)
        break
      case 'Circle':
        await drawCircle(latLngs as CircleData, zhuanzhu)
        break
      case 'Rectangle':
        await drawRectangle(latLngs, zhuanzhu)
        break
      case 'Marker':
        await drawMarkers(latLngs, zhuanzhu)
        break
      case 'Info':
        await drawInfo(latLngs, zhuanzhu)
        break
    }
    return
  }
  await enableInteractiveDraw(idx as DrawType)
}

const samplePoints = <T = any>(points: T[], maxPoints: number): T[] => {
  if (points.length <= maxPoints) return points
  const step = Math.floor(points.length / maxPoints)
  const result: T[] = []
  for (let i = 0; i < points.length; i += step) {
    result.push(points[i])
  }
  if (result[result.length - 1] !== points[points.length - 1]) {
    result.push(points[points.length - 1])
  }
  return result
}

// 🔴 修改2：绘制多边形 - 添加 yieldControl
const drawPolygon = async (points: ShapeData, zhuanzhu: boolean = true): Promise<any> => {
  if (points.length < 3) {
    console.error('多边形需要至少3个点')
    return
  }

  await yieldControl('message')

  const sampledPoints =
    points.length > props.maxPoints ? samplePoints(points, props.maxPoints) : points
  const path = sampledPoints.map((p) => {
    if (typeof p == 'string') {
      const pa = p.split(',')
      return [pa[0], pa[1]]
    } else {
      return [p.lng, p.lat]
    }
  })
  const firstPoint = points[0] as PointData
  const color = firstPoint?.color || 'red'
  const fillColor = firstPoint?.fillColor || 'red'
  const fillOpacity = firstPoint?.fillOpacity || 0.3

  const polygon = new AMap.Polygon({
    path: path,
    strokeColor: color,
    strokeWeight: 2,
    strokeOpacity: 0.8,
    fillColor: fillColor,
    fillOpacity: fillOpacity,
    zIndex: 50,
  })

  polygon._isTempDraw = true
  mapInstance.add(polygon)
  // ============【新增开始】支持多边形cb点击回调 ============
  const cb = firstPoint?.cb
  if (typeof cb === 'function') {
    const clickHandler = (e) => {
      // 把 firstPoint（包含extData）传给回调
      cb({ ...firstPoint, lat: e.lnglat.lat, lng: e.lnglat.lng })
    }
    polygon.on('click', clickHandler)
    // 事件存入清理队列，组件卸载自动off，防止内存泄漏
    cleanupResources.eventHandlers.push({
      type: 'click',
      handler: clickHandler,
    })
  }
  // ============【新增结束】====================
  if (zhuanzhu) mapInstance.setFitView([polygon])

  if (layerGroup) {
    layerGroup.push(polygon)
  } else {
    layerGroup = [polygon]
  }
  overlays.push(polygon)
  cleanupResources.overlays.push(polygon)
  return polygon
}

// 🔴 修改3：绘制折线 - 添加 yieldControl
const drawPolyline = async (points: ShapeData, zhuanzhu: boolean = true): Promise<any> => {
  if (points.length < 2) {
    console.error('折线需要至少2个点')
    return
  }

  await yieldControl('message')

  const sampledPoints =
    points.length > props.maxPoints ? samplePoints(points, props.maxPoints) : points
  const path = sampledPoints.map((p) => {
    if (typeof p === 'string') {
      const pa = p.split(',')
      return [pa[0], pa[1]]
    }
    return [p.lng, p.lat]
  })
  const color = (points[0] as PointData)?.color || 'red'

  const polyline = new AMap.Polyline({
    path: path,
    strokeColor: color,
    strokeWeight: 3,
    strokeOpacity: 0.8,
    lineJoin: 'round',
    zIndex: 50,
    extData: (points[0] as PointData)?.extData || {},
  })

  polyline._isTempDraw = true
  const firstPoint = points[0] ?? {}
  const cb = firstPoint?.cb
  if (typeof cb === 'function') {
    const clickHandler = (e) => {
      // 把 firstPoint（包含extData）传给回调
      cb({ ...firstPoint, lat: e.lnglat.lat, lng: e.lnglat.lng })
    }
    polyline.on('click', clickHandler)
    // 事件存入清理队列，组件卸载自动off，防止内存泄漏
    cleanupResources.eventHandlers.push({
      type: 'click',
      handler: clickHandler,
    })
  }
  mapInstance.add(polyline)
  if (zhuanzhu) mapInstance.setFitView([polyline])

  if (layerGroup) {
    layerGroup.push(polyline)
  } else {
    layerGroup = [polyline]
  }
  overlays.push(polyline)
  cleanupResources.overlays.push(polyline)
  return polyline
}

// 🔴 修改4：绘制圆形 - 添加 yieldControl
const drawCircle = async (circleData: CircleData, zhuanzhu: boolean = true): Promise<any> => {
  if (!circleData || circleData.length < 2) return

  await yieldControl('message')

  const center = circleData[0]
  const radius: number = circleData[1]

  const circle = new AMap.Circle({
    center: [center[1], center[0]],
    radius: radius,
    strokeColor: center.color || 'red',
    strokeWeight: 2,
    strokeOpacity: 0.8,
    fillColor: center.fillColor || center.color || 'red',
    fillOpacity: center.fillOpacity || 0.2,
    zIndex: 50,
  })

  circle._isTempDraw = true
  mapInstance.add(circle)
  if (zhuanzhu) mapInstance.setFitView([circle])

  if (layerGroup) {
    layerGroup.push(circle)
  } else {
    layerGroup = [circle]
  }
  overlays.push(circle)
  cleanupResources.overlays.push(circle)
  return circle
}

// 🔴 修改5：绘制矩形 - 添加 yieldControl
const drawRectangle = async (points: ShapeData, zhuanzhu: boolean = true): Promise<any> => {
  if (points.length < 2) {
    console.error('矩形需要至少2个点')
    return
  }

  await yieldControl('message')

  const path = points.map((item): [string, string] => {
    const pa = (typeof item === 'string' ? item : `${item.lng},${item.lat}`).split(',')
    return [pa[0], pa[1]]
  })
  const firstPoint = points[0] as PointData
  const bounds = new AMap.Bounds(
    new AMap.LngLat(path[0][0], path[0][1]),
    new AMap.LngLat(path[1][0], path[1][1])
  )

  const rectangle = new AMap.Rectangle({
    bounds: bounds,
    strokeColor: firstPoint?.color || 'red',
    strokeWeight: 2,
    strokeOpacity: 0.8,
    fillColor: firstPoint?.fillColor || firstPoint?.color || 'red',
    fillOpacity: firstPoint?.fillOpacity || 0.2,
    zIndex: 50,
  })

  rectangle._isTempDraw = true
  mapInstance.add(rectangle)
  if (zhuanzhu) mapInstance.setFitView([rectangle])

  if (layerGroup) {
    layerGroup.push(rectangle)
  } else {
    layerGroup = [rectangle]
  }
  overlays.push(rectangle)
  cleanupResources.overlays.push(rectangle)
  return rectangle
}

// 🔴 修改6：分批绘制标记点 - 使用 setTimeout 让出主线程
const drawMarkers = async (points: PointData[], zhuanzhu: boolean = true): Promise<void> => {
  // clearMarkers();
  const totalPoints = points.length

  if (totalPoints > props.batchSize) {
    const batchSize = props.batchSize
    const totalBatches = Math.ceil(totalPoints / batchSize)
    let completedBatches = 0

    for (let i = 0; i < totalBatches; i++) {
      const start = i * batchSize
      const end = Math.min(start + batchSize, totalPoints)
      const batch = points.slice(start, end)

      // ✅ 使用 setTimeout 让出主线程
      await new Promise((resolve) => {
        setTimeout(() => {
          batch.forEach((point) => {
            const marker = drawMarker(point)
            if (marker) {
              cleanupResources.markers.push(marker)
            }
          })
          completedBatches++
          const progress = Math.round((completedBatches / totalBatches) * 100)
          loadingProgress.value = progress
          emits('loadProgress', progress)

          resolve(true)
        }, 0)
      })

      // ✅ 每批处理后让出主线程
      await yieldControl('message')

      if (completedBatches === totalBatches) {
        if (cleanupResources.markers.length > 0 && zhuanzhu) {
          mapInstance.setFitView(cleanupResources.markers)
        }
      }
    }
  } else {
    points.forEach((point) => {
      const marker = drawMarker(point)
      if (marker) {
        cleanupResources.markers.push(marker)
      }
    })
    if (cleanupResources.markers.length > 0 && zhuanzhu) {
      mapInstance.setFitView(cleanupResources.markers)
    }
  }
}

const drawInfo = async (points: PointData[], zhuanzhu: boolean = true): Promise<void> => {
  clearMarkers()
  const point = points[0]
  const position = [point.lng, point.lat]
  mapInstance.setCenter(position)
  const offset = point.offset || [0, -30]
  if (point.popup) {
    const infoStatus = point.popup
    const isPromise = infoStatus instanceof Promise
    if (isPromise) {
      infoStatus.then((res) => {
        const infoWindow = new AMap.InfoWindow({
          content: res,
          offset: new AMap.Pixel(...offset),
        })
        infoWindow.open(mapInstance, position)
        cleanupResources.infoWindows.push(infoWindow)
      })
    } else {
      const infoWindow = new AMap.InfoWindow({
        content: point.popup,
        offset: new AMap.Pixel(...offset),
      })
      infoWindow.open(mapInstance, position)
      cleanupResources.infoWindows.push(infoWindow)
    }
  }
}

const drawMarker = (point: PointData): any => {
  const position = [point.lng, point.lat]
  let content = point.txt || ''
  if (point.class || point.style) {
    content = `<div class="${point.class}" style="${point.style}">${content}</div>`
  }

  const marker = new AMap.Marker({
    position: position,
    content: content || undefined,
    title: point.txt || '',
    offset: new AMap.Pixel(-12, -12),
  })

  const clickHandler = (e: any) => {
    mapInstance.setCenter(e.target.getPosition())
    const nowZoom = mapInstance?.getZoom()
    if (point.zoom != false) mapInstance.setZoom(nowZoom > 16 ? nowZoom : 16)
    if (point.cb) {
      point.cb(point)
    }
    if (point.popup) {
      const infoStatus = point.popup(point)
      if (!infoStatus) return
      const isPromise = infoStatus instanceof Promise
      if (isPromise) {
        infoStatus.then((res) => {
          const infoWindow = new AMap.InfoWindow({
            content: res,
            offset: new AMap.Pixel(0, -30),
          })
          infoWindow.open(mapInstance, position)
          cleanupResources.infoWindows.push(infoWindow)
        })
      } else {
        const infoWindow = new AMap.InfoWindow({
          content: point.popup(point),
          offset: new AMap.Pixel(0, -30),
        })
        infoWindow.open(mapInstance, position)
        cleanupResources.infoWindows.push(infoWindow)
      }
    }
  }

  marker.on('click', clickHandler)
  cleanupResources.eventHandlers.push({ type: 'click', handler: clickHandler })

  marker._isTempDraw = true
  mapInstance.add(marker)

  return marker
}

const enableInteractiveDraw = async (type: DrawType): Promise<void> => {
  if (!drawPlugin) {
    drawPlugin = new AMap.MouseTool(mapInstance)
    cleanupResources.drawPlugin = drawPlugin
  }
  drawType.value = type
  mapInstance.setDefaultCursor('crosshair')
  drawPlugin.close()

  switch (type) {
    case 'Marker':
      drawPlugin.marker({})
      break
    case 'Circle':
      drawPlugin.circle({})
      break
    case 'Polyline':
      drawPlugin.polyline({})
      break
    case 'Rectangle':
      drawPlugin.rectangle({})
      break
    case 'Polygon':
      drawPlugin.polygon({})
      break
  }
  // 监听绘制完成事件
  drawPlugin.on('draw', (e: any) => {
    const overlay = e.obj
    overlay._isTempDraw = true
    overlays.push(overlay)
    cleanupResources.overlays.push(overlay)
    if (layerGroup) {
      layerGroup.push(overlay)
    } else {
      layerGroup = [overlay]
    }
    emits('drawCreatedBack', overlay, e)
  })
}

// ==================== 清除覆盖物函数 ====================
const clearMarkers = () => {
  cleanupResources.markers.forEach((m) => {
    try {
      mapInstance?.remove(m)
      if (typeof m.destroy === 'function') m.destroy()
    } catch (e) {}
  })
  cleanupResources.markers = []
  markers = []
}

const clearOverlays = () => {
  cleanupResources.overlays.forEach((o) => {
    try {
      mapInstance?.remove(o)
      if (typeof o.destroy === 'function') o.destroy()
    } catch (e) {}
  })
  cleanupResources.overlays = []
  overlays = []
  layerGroup = null
}

const clearAllDraw = () => {
  stopDraw(2)
  clearOverlays()
  clearMarkers()
}

// ==================== 轨迹回放包装方法 ====================
const togglePlaybackWrapper = () => {
  if (!hook.value) return
  hook.value.togglePlay()
}
const resetPlaybackWrapper = () => {
  if (!hook.value) return
  hook.value.reset()
}
const setPlaybackSpeedWrapper = (v: number) => {
  playbackOptions.value.speed = v
  if (hook.value) hook.value.setSpeed(v)
  emits('playbackOptionsUpdated', playbackOptions.value)
}
const seekToPointWrapper = (index: number) => {
  if (!hook.value) return
  hook.value.seekToPoint(index)
}
const selectSegment = (index: number) => {
  if (!hook.value) return
  hook.value.selectSegment(index)
}
const previousPoint = () => {
  if (!hook.value) return
  hook.value.prevPoint()
}
const nextPoint = () => {
  if (!hook.value) return
  hook.value.nextPoint()
}
const updatePlaybackOptions = (opt: Partial<PlaybackOptions>) => {
  playbackOptions.value = { ...playbackOptions.value, ...opt }
  if (hook.value) hook.value.updateOptions(playbackOptions.value)
  emits('playbackOptionsUpdated', playbackOptions.value)
}

// 对外暴露初始化轨迹回放
const initTrackPlayback = async (segInput: TrackSegmentInput[]) => {
  await getMapInstance()
  const normalizedSeg = normalizeSegments(segInput)
  trackSegments.value = normalizedSeg
  showPlayback.value = true
  if (isHookInitialized && hook.value) {
    hook.value.destroy()
  }
  isHookInitialized = true
  hook.value = useTrackPlayback(mapInstance, normalizedSeg, playbackOptions.value)
  cleanupResources.hook = hook.value
}

// ==================== 监听高度变化 ====================
const calcHeight = () => {
  if (props.height) {
    heightInner.value = props.height
  } else {
    heightInner.value = getRemainingHeight(props.baseClass)
  }
}
const { listenDomChange } = useListenDomChange()
listenDomChange(calcHeight, mapContainer)

// ==================== 监听props变化 ====================
watch(
  () => props.center,
  (val) => {
    if (isMapReady.value && mapInstance && val?.length) {
      mapInstance.setCenter(val)
    }
  },
  { deep: true }
)

watch(
  () => props.zoom,
  (val) => {
    if (isMapReady.value && mapInstance) {
      mapInstance.setZoom(val)
    }
  }
)

watch(
  () => props.draw,
  (val) => {
    if (!isMapReady.value || !mapInstance) return
    if (val) {
      initDrawCtrl()
    } else {
      stopDraw()
    }
  }
)

// ==================== 生命周期 ====================
onMounted(async () => {
  calcHeight()
  await loadImages()
  isLoading.value = true
  loadingText.value = '地图加载中...'
  try {
    await createMap(mapId.value, props.center)
  } catch (err) {
    console.error('地图初始化失败：', err)
  } finally {
    isLoading.value = false
  }
})

onBeforeUnmount(() => {
  isComponentUnmounted = true
  destroyMap()
})

// ==================== 对外暴露方法 ====================
defineExpose({
  getMapInstance,
  mapSetCenter,
  getBounds,
  startDraw,
  stopDraw,
  clearMarkers,
  clearOverlays,
  clearAllDraw,
  wgs84ToGcj02,
  gcj02towgs84,
  initTrackPlayback,
  hook,
  mapInstance: () => mapInstance,
})
</script>

<style scoped lang="scss">
.mapContainer {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  .map {
    width: 100%;
    height: 100%;
  }
  .top-com {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    z-index: 999;
  }
  .left-com {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    z-index: 999;
  }
  .right-com {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    z-index: 999;
  }
  .left-bottom-com {
    position: absolute;
    left: 0;
    bottom: 0;
    z-index: 999;
  }
  .right-bottom-com {
    position: absolute;
    right: 0;
    bottom: 0;
    z-index: 999;
  }
  .lnglatSearch {
    position: absolute;
    right: 10px;
    top: 10px;
    z-index: 999;
  }
  .loading-mask {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    .loading-content {
      background: #fff;
      padding: 24px 32px;
      border-radius: 8px;
      text-align: center;
      .loading-spinner {
        width: 36px;
        height: 36px;
        border: 4px solid #e6e6e6;
        border-top-color: #409eff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 12px;
      }
      .loading-text {
        font-size: 14px;
        color: #333;
        margin-bottom: 10px;
      }
      .loading-progress {
        width: 200px;
        height: 6px;
        background: #eee;
        border-radius: 3px;
        overflow: hidden;
        margin: 0 auto;
        display: flex;
        align-items: center;
        .progress-bar {
          height: 100%;
          background: #409eff;
          transition: width 0.2s;
        }
        .progress-text {
          margin-left: 8px;
          font-size: 12px;
          color: #666;
        }
      }
    }
  }
  .playback-control-container {
    position: absolute;
    left: 50%;
    bottom: 16px;
    transform: translateX(-50%);
    z-index: 999;
  }
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
