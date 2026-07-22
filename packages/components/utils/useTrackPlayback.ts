/*
 * @Author: bst 1@1.com
 * @Date: 2025-12-25 16:39:25
 * @LastEditors: bst 1@1.com
 * @LastEditTime: 2026-01-20 xx:xx:xx
 * @FilePath: 转换为高德地图版本
 * @Description: 轨迹回放组件（高德地图版本）- 最终内存修复版
 */
import { computed, onUnmounted, ref, nextTick, Ref } from 'vue'

export interface TrackPoint {
  lat: number
  lng: number
  timestamp: Date
  speed?: number
  altitude?: number
  heading?: number
  description?: string
  color?: string
  lineWeight?: number
  popup?: any
  class?: string
  icon?: string
  cb?: (data: any) => void
  [key: string]: any
}

export interface TrackSegment {
  id: number | string
  name: string
  points: TrackPoint[]
  color?: string
  lineWeight?: number
}

export interface PlaybackOptions {
  speed?: number
  autoCenter?: boolean
  showTrack?: boolean
  showMarkers?: boolean
  loop?: boolean
}

export interface UseTrackPlaybackReturn {
  isPlaying: Ref<boolean>
  currentSegmentIndex: Ref<number>
  currentPointIndex: Ref<number>
  speed: Ref<number>
  currentPoint: Ref<TrackPoint | null>
  drawLineCount: Ref<number>
  currentSegment: Readonly<Ref<TrackSegment | null>>
  progress: Readonly<Ref<number>>
  totalPoints: Readonly<Ref<number>>
  totalDistance: Readonly<Ref<number>>
  traveledDistance: Readonly<Ref<number>>
  play: () => void
  pause: () => void
  togglePlay: () => void
  reset: () => void
  seekTo: (segmentIndex: number, pointIndex: number) => void
  setSpeed: (speed: number) => void
  init: () => void
  clearLayers: () => void
  drawTrackLine: (updatedOptions?: PlaybackOptions) => Promise<void>
  updateTrackLine: () => void
  loadTrackData: (newSegments: TrackSegment[]) => Promise<void>
  destroy: () => void
  clearCache: () => void
  forceGC: () => void
  getMemoryStats: () => any
}

export default function useTrackPlayback(
  map: any,
  segments: TrackSegment[],
  options: PlaybackOptions = {},
): UseTrackPlaybackReturn {
  const defaultOptions: PlaybackOptions = {
    speed: 1,
    autoCenter: true,
    showTrack: true,
    showMarkers: true,
    loop: false,
    ...options,
  }

  // 响应式状态
  const isPlaying = ref(false)
  const drawLineCount = ref(0)
  const currentSegmentIndex = ref(0)
  const currentPointIndex = ref(0)
  const speed = ref(defaultOptions.speed || 1)
  const playbackTimer = ref<NodeJS.Timeout | null>(null)

  // 地图图层对象
  let trackLineLayer: any = null
  let markerLayer: any = null
  let historyLineLayer: any = null
  let pointMarkers: any = null
  let infoWindow: any = null

  // 状态控制
  let isClearing = false
  let isDrawing = false
  let isFirstDraw = true
  let fitViewTimer: NodeJS.Timeout | null = null

  // 🔴 事件监听器引用
  let eventListeners: Array<{ target: any; event: string; handler: Function }> = []

  // 🔴 popup 缓存 - 限制大小
  const MAX_CACHE_SIZE = 30
  const popupCache = new Map<string, string>()

  // 🔴 追踪所有创建的图层对象
  const createdLayers: any[] = []
  const segmentsFinal = ref(segments || [])
  // 计算属性
  const currentSegment = computed(() => segmentsFinal.value[currentSegmentIndex.value])
  const currentPoint = computed(() => currentSegment.value?.points[currentPointIndex.value] || null)
  const previousPoint = computed(
    () => currentSegment.value?.points[currentPointIndex.value - 1] || null,
  )

  const totalPoints = computed(() =>
    segmentsFinal.value.reduce((total, segment) => total + segment.points.length, 0),
  )

  const progress = computed(() => {
    if (!currentSegment.value || currentSegment.value.points.length === 0) return 0
    return (currentPointIndex.value / (currentSegment.value.points.length - 1)) * 100
  })

  const totalDistance = computed(() => {
    let distance = 0
    segmentsFinal.value.forEach((segment) => {
      for (let i = 1; i < segment.points.length; i++) {
        const p1 = segment.points[i - 1]
        const p2 = segment.points[i]
        distance += calculateDistance(p1.lat, p1.lng, p2.lat, p2.lng)
      }
    })
    return distance
  })

  const traveledDistance = computed(() => {
    let distance = 0
    const currentSeg = segmentsFinal.value[currentSegmentIndex.value]
    if (!currentSeg) return 0

    for (let i = 1; i <= currentPointIndex.value; i++) {
      const p1 = currentSeg.points[i - 1]
      const p2 = currentSeg.points[i]
      distance += calculateDistance(p1.lat, p1.lng, p2.lat, p2.lng)
    }

    for (let i = 0; i < currentSegmentIndex.value; i++) {
      const segment = segmentsFinal.value[i]
      for (let j = 1; j < segment.points.length; j++) {
        const p1 = segment.points[j - 1]
        const p2 = segment.points[j]
        distance += calculateDistance(p1.lat, p1.lng, p2.lat, p2.lng)
      }
    }

    return distance
  })

  // 工具函数：计算距离
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371e3
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lng2 - lng1) * Math.PI) / 180

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  // 🔴 获取 popup 内容 - 限制缓存大小
  const getPopupContent = async (popup: any, cacheKey?: string): Promise<string> => {
    if (cacheKey && popupCache.has(cacheKey)) {
      return popupCache.get(cacheKey) || ''
    }

    if (!popup) return ''

    try {
      let result = popup

      if (typeof popup === 'function') {
        result = popup()
      }

      if (result && typeof result.then === 'function') {
        result = await result
      }

      let content = ''
      if (result === null || result === undefined) {
        content = ''
      } else if (typeof result === 'string') {
        content = result
      } else if (typeof result === 'object') {
        try {
          content = JSON.stringify(result)
        } catch (e) {
          content = String(result)
        }
      } else {
        content = String(result)
      }

      // 限制内容长度
      if (content.length > 200) {
        content = content.substring(0, 200) + '...'
      }

      if (cacheKey) {
        if (popupCache.size >= MAX_CACHE_SIZE) {
          const firstKey = popupCache.keys().next().value
          if (firstKey) {
            popupCache.delete(firstKey)
          }
        }
        popupCache.set(cacheKey, content)
      }

      return content
    } catch (e) {
      console.warn('获取 popup 内容失败:', e)
      return ''
    }
  }

  // 安全从地图移除对象
  const safeRemoveFromMap = (obj: any) => {
    if (!obj || !map) return
    try {
      if (typeof map.remove === 'function') {
        map.remove(obj)
      }
    } catch (e) {}
  }

  // 🔴 销毁地图对象 - 增强版
  const destroyMapObject = (obj: any) => {
    if (!obj) return
    try {
      safeRemoveFromMap(obj)
      if (typeof obj.destroy === 'function') {
        obj.destroy()
      }
      if (obj.off && typeof obj.off === 'function') {
        obj.off()
      }
      // 清理所有属性
      Object.keys(obj).forEach((key) => {
        try {
          obj[key] = null
          delete obj[key]
        } catch (e) {}
      })
    } catch (e) {
      console.warn('销毁地图对象时出错:', e)
    }
  }

  // 🔴 核心：彻底销毁 MassMarks
  const destroyMassMarks = (massMarks: any) => {
    if (!massMarks) return

    try {
      // 1. 隐藏
      if (typeof massMarks.hide === 'function') {
        massMarks.hide()
      }

      // 2. 移除所有事件监听
      if (massMarks.off && typeof massMarks.off === 'function') {
        massMarks.off('mouseover')
        massMarks.off('mouseout')
        massMarks.off('click')
        try {
          massMarks.off()
        } catch (e) {}
      }

      // 3. 从地图移除
      if (massMarks.setMap && typeof massMarks.setMap === 'function') {
        massMarks.setMap(null)
      }

      // 4. 清除数据
      if (massMarks.clearData && typeof massMarks.clearData === 'function') {
        massMarks.clearData()
      }

      // 5. 销毁对象
      if (massMarks.destroy && typeof massMarks.destroy === 'function') {
        massMarks.destroy()
      }

      // 6. 🔴 清理 DOM 引用
      if (massMarks._container && massMarks._container.parentNode) {
        try {
          massMarks._container.parentNode.removeChild(massMarks._container)
        } catch (e) {}
      }

      // 7. 🔴 清理所有内部属性
      const internalProps = [
        '_container',
        '_markers',
        '_data',
        '_style',
        '_events',
        '_listeners',
        '_cache',
        '_id',
        '_map',
        '_opts',
        '_extData',
        '_clusterData',
        '_markerMap',
        '_dataMap',
        '_dataList',
        '_markersData',
        '_markerStyle',
        '_renderData',
        '_dataCache',
        '_eventHandlers',
        '_eventMap',
        '_domEvents',
      ]
      internalProps.forEach((prop) => {
        try {
          if (massMarks[prop] !== undefined && massMarks[prop] !== null) {
            if (Array.isArray(massMarks[prop])) {
              massMarks[prop].length = 0
            } else if (massMarks[prop] instanceof Map) {
              massMarks[prop].clear()
            } else if (massMarks[prop] instanceof Set) {
              massMarks[prop].clear()
            }
            massMarks[prop] = null
            delete massMarks[prop]
          }
        } catch (e) {}
      })
    } catch (e) {
      console.warn('销毁 MassMarks 时出错:', e)
    }
  }

  // 清理 popup 缓存
  const clearCache = () => {
    popupCache.clear()
  }

  const clearPopupCache = clearCache

  // 手动计算并设置地图边界
  const fitBounds = (points: Array<{ lat: number; lng: number }>) => {
    if (!map || !points || points.length === 0) return

    try {
      let minLng = Infinity
      let maxLng = -Infinity
      let minLat = Infinity
      let maxLat = -Infinity

      points.forEach((point) => {
        if (point.lng < minLng) minLng = point.lng
        if (point.lng > maxLng) maxLng = point.lng
        if (point.lat < minLat) minLat = point.lat
        if (point.lat > maxLat) maxLat = point.lat
      })

      if (!isFinite(minLng) || !isFinite(maxLng) || !isFinite(minLat) || !isFinite(maxLat)) {
        return
      }

      const latPadding = (maxLat - minLat) * 0.1 || 0.01
      const lngPadding = (maxLng - minLng) * 0.1 || 0.01

      minLng -= lngPadding
      maxLng += lngPadding
      minLat -= latPadding
      maxLat += latPadding

      map.setBounds(new AMap.Bounds([minLng, minLat], [maxLng, maxLat]))
    } catch (e) {
      console.warn('设置地图边界失败:', e)
    }
  }

  // 带防抖的 setFitView
  const setFitViewWithDebounce = (layer: any, delay: number = 300) => {
    if (fitViewTimer) {
      clearTimeout(fitViewTimer)
      fitViewTimer = null
    }

    fitViewTimer = setTimeout(() => {
      try {
        if (map && layer) {
          if (currentSegment.value) {
            fitBounds(currentSegment.value.points)
          } else {
            map.setFitView([layer])
          }
        }
      } catch (e) {
        console.warn('设置地图视图失败:', e)
      }
      fitViewTimer = null
    }, delay)
  }

  // 播放控制方法
  const play = () => {
    if (isPlaying.value || !currentSegment.value) return

    isPlaying.value = true

    const playNextPoint = () => {
      if (!isPlaying.value || !map) return

      if (currentPointIndex.value < currentSegment.value.points.length - 1) {
        currentPointIndex.value++
        updateMarkerPosition()
      } else {
        if (currentSegmentIndex.value < segmentsFinal.value.length - 1) {
          currentSegmentIndex.value++
          currentPointIndex.value = 0
          updateTrackLine()
          updateMarkerPosition()
        } else if (defaultOptions.loop) {
          currentSegmentIndex.value = 0
          currentPointIndex.value = 0
          updateTrackLine()
          updateMarkerPosition()
        } else {
          pause()
          return
        }
      }

      updateHistoryLine()

      if (defaultOptions.autoCenter && currentPoint.value) {
        map.setCenter([currentPoint.value.lng, currentPoint.value.lat])
        map.setZoom(map.getZoom())
      }

      const interval = 1000 / speed.value
      playbackTimer.value = setTimeout(playNextPoint, interval)
    }

    playbackTimer.value = setTimeout(playNextPoint, 1000 / speed.value)
  }

  const pause = () => {
    isPlaying.value = false
    if (playbackTimer.value) {
      clearTimeout(playbackTimer.value)
      playbackTimer.value = null
    }
  }

  const togglePlay = () => {
    if (isPlaying.value) {
      pause()
    } else {
      play()
    }
  }

  const reset = () => {
    pause()
    currentSegmentIndex.value = 0
    currentPointIndex.value = 0
    isFirstDraw = true

    if (fitViewTimer) {
      clearTimeout(fitViewTimer)
      fitViewTimer = null
    }

    clearLayers()
    if (currentSegment.value && defaultOptions.showTrack) {
      drawTrackLine()
    }
    if (currentPoint.value) {
      updateMarkerPosition()
    }
    updateHistoryLine()
  }

  const seekTo = (segmentIndex: number, pointIndex: number) => {
    pause()
    currentSegmentIndex.value = segmentIndex
    currentPointIndex.value = pointIndex
    if (currentSegment.value && defaultOptions.showTrack) {
      updateTrackLine()
    }
    if (currentPoint.value) {
      updateMarkerPosition()
    }
    updateHistoryLine()
  }

  const setSpeed = (newSpeed: number) => {
    speed.value = newSpeed
    if (isPlaying.value) {
      pause()
      play()
    }
  }

  // 🔴 核心：清理所有图层
  const clearLayers = () => {
    if (isClearing) return
    isClearing = true

    try {
      // 清理轨迹线
      if (trackLineLayer) {
        destroyMapObject(trackLineLayer)
        trackLineLayer = null
      }

      // 清理历史轨迹线
      if (historyLineLayer) {
        destroyMapObject(historyLineLayer)
        historyLineLayer = null
      }

      // 清理当前标记
      if (markerLayer) {
        destroyMapObject(markerLayer)
        markerLayer = null
      }

      // 清理 InfoWindow
      if (infoWindow) {
        try {
          if (typeof infoWindow.close === 'function') {
            infoWindow.close()
          }
          safeRemoveFromMap(infoWindow)
          if (typeof infoWindow.destroy === 'function') {
            infoWindow.destroy()
          }
          if (infoWindow._container && infoWindow._container.parentNode) {
            try {
              infoWindow._container.parentNode.removeChild(infoWindow._container)
            } catch (e) {}
          }
          Object.keys(infoWindow).forEach((key) => {
            try {
              infoWindow[key] = null
              delete infoWindow[key]
            } catch (e) {}
          })
        } catch (e) {}
        infoWindow = null
      }

      // 清理 MassMarks
      if (pointMarkers) {
        destroyMassMarks(pointMarkers)
        pointMarkers = null
      }

      // 🔴 清理事件监听器
      eventListeners.forEach(({ target, event, handler }) => {
        try {
          if (target && typeof target.off === 'function') {
            target.off(event, handler)
          }
        } catch (e) {}
      })
      eventListeners = []

      // 清理缓存
      clearPopupCache()

      // 重置首次绘制标志
      isFirstDraw = true

      // 清理定时器
      if (fitViewTimer) {
        clearTimeout(fitViewTimer)
        fitViewTimer = null
      }

      // 清理创建的图层列表
      createdLayers.length = 0
    } finally {
      isClearing = false
    }
  }

  // 🔴 核心：加载轨迹数据 - 彻底清理旧数据
  const loadTrackData = async (newSegments: TrackSegment[]) => {
    try {
      // 1. 暂停播放
      pause()

      // 2. 清理图层
      await clearLayers()

      // 3. 🔴 彻底清空旧数据
      for (let i = 0; i < segmentsFinal.value.length; i++) {
        const seg = segmentsFinal.value[i]
        if (seg) {
          if (seg.points) {
            // 清空 points 数组
            seg.points.length = 0
            seg.points = []
          }
          // 清空其他属性
          Object.keys(seg).forEach((key) => {
            try {
              if (key !== 'points') {
                seg[key] = null
                delete seg[key]
              }
            } catch (e) {}
          })
        }
      }
      segmentsFinal.value.length = 0

      // 4. 重置状态
      currentSegmentIndex.value = 0
      currentPointIndex.value = 0
      drawLineCount.value = 0
      isFirstDraw = true

      // 5. 清理定时器
      if (fitViewTimer) {
        clearTimeout(fitViewTimer)
        fitViewTimer = null
      }

      // 6. 清空缓存
      clearPopupCache()

      // 7. 添加新数据
      if (newSegments && newSegments.length > 0) {
        // 🔴 深拷贝数据，切断外部引用
        const clonedSegments = newSegments.map((seg) => ({
          ...seg,
          points: seg.points.map((p) => ({ ...p })),
        }))
        segmentsFinal.value.push(...clonedSegments)
      }

      // 8. 等待绘制完成
      if (currentSegment.value && defaultOptions.showTrack) {
        await drawTrackLine()
      }

      // 9. 更新标记
      if (currentPoint.value) {
        updateMarkerPosition()
      }

      // 10. 更新历史轨迹
      updateHistoryLine()

      // 11. 强制刷新地图
      if (map && typeof map.render === 'function') {
        map.render()
      }

      console.log('轨迹数据加载完成')
    } catch (e) {
      console.error('加载轨迹数据失败:', e)
    }
  }

  // 🔴 核心：彻底销毁
  const destroy = () => {
    // 1. 暂停播放
    pause()

    // 2. 清理所有图层
    clearLayers()

    // 3. 清理定时器
    if (fitViewTimer) {
      clearTimeout(fitViewTimer)
      fitViewTimer = null
    }

    // 4. 清理所有地图事件
    if (map) {
      try {
        if (typeof map.off === 'function') {
          map.off('move')
          map.off('click')
          map.off('zoomend')
          map.off('moveend')
          map.off()
        }
      } catch (e) {}
    }

    // 5. 清理缓存
    clearPopupCache()
    eventListeners = []

    // 6. 重置状态
    isClearing = false
    isDrawing = false
    isFirstDraw = true
    isPlaying.value = false
    currentSegmentIndex.value = 0
    currentPointIndex.value = 0
    drawLineCount.value = 0

    // 7. 🔴 彻底清空数据
    for (let i = 0; i < segmentsFinal.value.length; i++) {
      const seg = segmentsFinal.value[i]
      if (seg) {
        if (seg.points) {
          seg.points.length = 0
        }
        seg.points = []
        Object.keys(seg).forEach((key) => {
          try {
            seg[key] = null
            delete seg[key]
          } catch (e) {}
        })
      }
    }
    segmentsFinal.value.length = 0

    // 8. 清理所有图层引用
    trackLineLayer = null
    historyLineLayer = null
    markerLayer = null
    pointMarkers = null
    infoWindow = null

    // 9. 🔴 清理地图内部缓存
    if (map) {
      try {
        if (map._layers) {
          Object.keys(map._layers).forEach((key) => {
            try {
              map._layers[key] = null
              delete map._layers[key]
            } catch (e) {}
          })
        }
        if (map._cache) {
          map._cache = null
        }
        if (map._events) {
          map._events = null
        }
      } catch (e) {}
    }

    // 10. 强制垃圾回收
    setTimeout(() => {
      forceGC()
    }, 100)
  }

  // 强制垃圾回收
  const forceGC = () => {
    if (typeof window !== 'undefined' && window.gc) {
      try {
        window.gc()
        console.log('强制垃圾回收完成')
      } catch (e) {
        console.warn('垃圾回收失败:', e)
      }
    }
  }

  // 🔴 获取内存统计
  const getMemoryStats = () => {
    return {
      segmentCount: segmentsFinal.value.length,
      totalPoints: totalPoints.value,
      cacheSize: popupCache.size,
      isPlaying: isPlaying.value,
      hasLayers: {
        trackLine: !!trackLineLayer,
        historyLine: !!historyLineLayer,
        marker: !!markerLayer,
        massMarks: !!pointMarkers,
        infoWindow: !!infoWindow,
      },
      eventListenerCount: eventListeners.length,
      createdLayersCount: createdLayers.length,
    }
  }

  // 绘制轨迹线
  const drawTrackLine = async (updatedOptions?: PlaybackOptions) => {
    if (isClearing || isDrawing) {
      await new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (!isClearing && !isDrawing) {
            clearInterval(checkInterval)
            resolve(true)
          }
        }, 50)
      })
    }

    if (!map || !currentSegment.value) return

    isDrawing = true

    try {
      await clearLayers()

      if (typeof updatedOptions !== 'undefined') {
        defaultOptions.showTrack = updatedOptions.showTrack
        defaultOptions.showMarkers = updatedOptions.showMarkers
        defaultOptions.loop = updatedOptions.loop
        defaultOptions.autoCenter = updatedOptions.autoCenter
        defaultOptions.speed = updatedOptions.speed
      }

      if (defaultOptions.showTrack && currentSegment.value.points.length > 0) {
        const path = currentSegment.value.points.map((p) => [p.lng, p.lat])

        try {
          trackLineLayer = new AMap.Polyline({
            path: path,
            strokeColor: currentSegment.value.color || '#1737B8',
            strokeWeight: currentSegment.value.lineWeight || 3,
            strokeOpacity: 0.7,
            strokeStyle: 'solid',
            lineJoin: 'round',
            lineCap: 'round',
            zIndex: 100,
            map: map,
          })
          createdLayers.push(trackLineLayer)

          if (isFirstDraw && trackLineLayer) {
            setFitViewWithDebounce(trackLineLayer, 100)
            isFirstDraw = false
          }

          if (drawLineCount.value === 0) {
            drawLineCount.value++
          }
        } catch (e) {
          console.warn('绘制轨迹线失败:', e)
        }
      }

      if (defaultOptions.showMarkers && currentSegment.value.points.length > 0) {
        try {
          const pointsWithPopup = await Promise.all(
            currentSegment.value.points.map(async (point, index) => {
              const cacheKey = `${currentSegment.value.id}-${index}`
              const popupContent = await getPopupContent(point.popup, cacheKey)

              return {
                ...point,
                lnglat: [point.lng, point.lat],
                name: popupContent,
                _index: index,
              }
            }),
          )

          const icons = Array.from(new Set(pointsWithPopup.map((item) => item.icon))).filter(
            Boolean,
          )
          const iconStyle = icons.map((url) => ({
            url: url,
            anchor: new AMap.Pixel(3, 3),
            size: new AMap.Size(10, 10),
            zIndex: 1,
          }))

          const iconKey = iconStyle.reduce((acc, item, index) => {
            acc[item.url] = index
            return acc
          }, {})

          pointMarkers = new AMap.MassMarks(
            pointsWithPopup.map((point) => ({
              ...point,
              style: iconKey[point.icon],
            })),
            {
              opacity: 0.8,
              zIndex: 99999,
              cursor: 'pointer',
              style: iconStyle,
            },
          )
          createdLayers.push(pointMarkers)

          infoWindow = new AMap.InfoWindow({
            offset: new AMap.Pixel(0, -15),
            autoMove: false,
            closeWhenClickMap: true,
            isCustom: true,
            content: '<div style="display:none;"></div>',
          })

          const mouseoverHandler = function (e: any) {
            if (infoWindow && e.data) {
              const content = e.data.name || ''
              if (content) {
                const isHtml = /<[a-z][\s\S]*>/i.test(content)
                let styledContent = content
                if (!isHtml) {
                  styledContent = `<div style="
                    background: white;
                    padding: 8px 14px;
                    border-radius: 4px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                    font-size: 13px;
                    max-width: 300px;
                    word-wrap: break-word;
                    line-height: 1.5;
                    color: #333;
                  ">${content}</div>`
                }

                try {
                  infoWindow.close()
                  infoWindow.setContent(styledContent)
                  infoWindow.open(map, e.data.lnglat)
                } catch (err) {}
              }
            }
          }

          const mouseoutHandler = function () {
            if (infoWindow) {
              try {
                infoWindow.close()
              } catch (e) {}
            }
          }

          const clickHandler = function (e: any) {
            e.data?.cb?.(e.data)
          }

          pointMarkers.on('mouseover', mouseoverHandler)
          pointMarkers.on('mouseout', mouseoutHandler)
          pointMarkers.on('click', clickHandler)

          eventListeners.push(
            { target: pointMarkers, event: 'mouseover', handler: mouseoverHandler },
            { target: pointMarkers, event: 'mouseout', handler: mouseoutHandler },
            { target: pointMarkers, event: 'click', handler: clickHandler },
          )

          pointMarkers.setMap(map)
        } catch (e) {
          console.warn('绘制标记点失败:', e)
        }
      }

      updateMarkerPosition()
      updateHistoryLine()
    } catch (e) {
      console.warn('绘制轨迹失败:', e)
    } finally {
      isDrawing = false
    }
  }

  const updateTrackLine = () => {
    drawTrackLine()
  }

  // 更新当前标记位置
  const updateMarkerPosition = () => {
    if (!map || !currentPoint.value) return

    const point = currentPoint.value
    const previous = previousPoint.value
    const lnglat = [point.lng, point.lat]
    const content = `
          <div class="current-position-marker">
            <div class="outer-ring"></div>
              <div class="inner-circle"></div>
              <div class="direction-indicator ${point.class || ''}" style="transform: rotate(${point.heading || 0}deg)"></div>
          </div>
        `

    try {
      if (markerLayer) {
        markerLayer.setPosition(lnglat)
        if (previous.class != point.class || previous.heading != point.heading) {
          markerLayer.setContent(content)
          // console.log('点内容更新', previous.class, point.class, previous.heading, point.heading);
        }
        return
      }

      markerLayer = new AMap.Marker({
        map: map,
        position: lnglat,
        icon: '',
        offset: new AMap.Pixel(-26, -13),
        autoRotation: true,
        angle: 0,
        content: content,
        zIndex: 99999,
      })
      createdLayers.push(markerLayer)
    } catch (e) {
      console.warn('更新标记位置失败:', e)
    }
  }

  // 更新历史轨迹线
  const updateHistoryLine = () => {
    if (!map || !currentSegment.value) return

    const passedPoints = currentSegment.value.points.slice(0, currentPointIndex.value + 1)
    // if (passedPoints.length <= 1) {
    //   // 如果点数不足，清除折线
    //   if (historyLineLayer) {
    //     safeRemoveFromMap(historyLineLayer);
    //     historyLineLayer = null;
    //   }
    //   return;
    // }

    const path = passedPoints.map((p) => [p.lng, p.lat])

    // 1. 如果折线不存在，创建它
    if (!historyLineLayer) {
      try {
        historyLineLayer = new AMap.Polyline({
          path: path,
          strokeColor: '#2ecc71',
          strokeWeight: 4,
          strokeOpacity: 1,
          strokeStyle: 'solid',
          lineJoin: 'round',
          lineCap: 'round',
          zIndex: 1000,
          map: map,
        })
        createdLayers.push(historyLineLayer)
      } catch (e) {
        console.warn('创建历史轨迹失败:', e)
      }
      return
    }

    // 2. 如果折线已存在，只更新路径（复用对象！）
    try {
      historyLineLayer.setPath(path)
    } catch (e) {
      console.warn('更新历史轨迹路径失败:', e)
    }
  }

  // 初始化
  const init = () => {
    if (currentSegment.value && defaultOptions.showTrack) {
      drawTrackLine()
    }
    if (currentPoint.value) {
      updateMarkerPosition()
    }
  }

  // 组件卸载时清理
  onUnmounted(() => {
    destroy()
  })

  return {
    // 状态
    isPlaying,
    currentSegmentIndex,
    currentPointIndex,
    speed,
    currentPoint,
    drawLineCount,

    // 计算属性
    currentSegment,
    progress,
    totalPoints,
    totalDistance,
    traveledDistance,

    // 方法
    play,
    pause,
    togglePlay,
    reset,
    seekTo,
    setSpeed,
    init,
    clearLayers,
    drawTrackLine,
    updateTrackLine,
    loadTrackData,
    destroy,
    clearCache,
    forceGC,
    getMemoryStats,
  }
}
