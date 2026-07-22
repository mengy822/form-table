<template>
  <div
    class="track-playback-control"
    :class="{
      hide: !isActive,
      mini: isMiniMode
    }"
  >
    <!-- 完整模式内容 -->
    <template v-if="!isMiniMode">
      <div class="control-header">
        <h3>轨迹回放控制</h3>
        <div style="display: flex; align-items: center">
          <div class="status-indicator" :class="{ playing: isPlaying }">
            {{ isPlaying ? '播放中' : '已暂停' }}
          </div>
          <div class="quanping" @click="toggleSideBar"></div>
        </div>
      </div>

      <div class="control-section">
        <div class="playback-controls">
          <div class="btn-group">
            <button class="control-btn qidian" @click="seekToStart" title="回到起点">
              <span class="icon"></span>
            </button>
            <button class="control-btn shang" @click="previousPoint" :disabled="currentPointIndex <= 0" title="上一个点">
              <span class="icon"></span>
            </button>
            <button class="control-btn play-btn" @click="togglePlay" :class="{ playing: isPlaying }" :title="isPlaying ? '暂停' : '播放'">
              <span class="icon"></span>
            </button>
            <button class="control-btn xia" @click="nextPoint" :disabled="currentPointIndex >= currentSegment.points.length - 1" title="下一个点">
              <span class="icon"></span>
            </button>
            <button class="control-btn zhongdian" @click="seekToEnd" title="跳到终点">
              <span class="icon"></span>
            </button>

            <button class="control-btn reset-btn" @click="reset" title="重置">
              <span class="icon"></span>
            </button>
          </div>
        </div>
      </div>

      <div class="control-section">
        <div class="speed-control">
          <!--          <label>播放速度:</label>-->
          <div class="speed-buttons">
            <button
              v-for="speedOption in speedOptions"
              :key="speedOption"
              class="speed-btn"
              :class="{ active: speed === speedOption }"
              @click="setSpeed(speedOption)"
            >
              {{ speedOption }}x
            </button>
          </div>
        </div>
      </div>

      <div class="control-section">
        <div class="progress-control">
          <!--          <label>播放进度:</label>-->
          <!--          <div class="progress-info">-->
          <!--            <span>点 {{ currentPointIndex + 1 }} / {{ currentSegment.points.length }}</span>-->
          <!--            <span>{{ progress.toFixed(1) }}%</span>-->
          <!--          </div>-->
          <input
            type="range"
            class="progress-slider"
            :min="0"
            :max="currentSegment.points.length - 1"
            :value="currentPointIndex"
            @input="onProgressChange"
            @change="onProgressChangeEnd"
          />
        </div>
      </div>

      <div class="control-section stats-section">
        <div class="stats-grid">
          <slot
            name="overviewData"
            :data="hook"
            :dyClass="{
              item: 'stat-item',
              key: 'stat-label',
              value: 'stat-value'
            }"
          >
            <div class="stat-item">
              <div class="stat-value">{{ (traveledDistance / 1000).toFixed(2) }} km</div>
              <div class="stat-label">已行驶距离</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ (totalDistance / 1000).toFixed(2) }} km</div>
              <div class="stat-label">总距离</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ currentPoint?.speed?.toFixed(1) || 0 }} km/h</div>
              <div class="stat-label">当前速度</div>
            </div>
          </slot>
        </div>
      </div>

      <div class="control-section options-section">
        <div class="option-item">
          <input type="checkbox" id="autoCenter" v-model="autoCenter" @change="updateOptions" />
          <label for="autoCenter" title="自动居中">居中</label>
        </div>
        <div class="option-item">
          <input type="checkbox" id="showTrack" v-model="showTrack" @change="updateOptions" />
          <label for="showTrack" title="显示轨迹线">轨迹线</label>
        </div>
        <div class="option-item">
          <input type="checkbox" id="showMarkers" v-model="showMarkers" @change="updateOptions" />
          <label for="showMarkers" title="显示标记点">标记点</label>
        </div>
        <div class="option-item">
          <input type="checkbox" id="loop" v-model="loop" @change="updateOptions" />
          <label for="loop" title="循环播放">循环</label>
        </div>
      </div>
    </template>
 <!-- 迷你模式内容 - 只显示播放按钮 -->
    <template v-else>
      <div class="mini-player" @click="toggleSideBar">
        <div class="image"></div>
        轨迹
        <!--        <button class="control-btn play-btn" @click="handleMiniPlay" :class="{ playing: isPlaying }">-->
        <!--          <span class="icon">{{ isPlaying ? '⏸️' : '▶️' }}</span>-->
        <!--        </button>-->
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { TrackSegment } from '../utils/useTrackPlayback';
interface Props {
  segments: TrackSegment[];
  isPlaying: boolean;
  currentSegmentIndex: number;
  currentPointIndex: number;
  speed: number;
  currentSegment: TrackSegment;
  currentPoint: any;
  progress: number;
  totalDistance: number;
  traveledDistance: number;
  playbackOptions: {
    speed: number;
    autoCenter: boolean;
    showTrack: boolean;
    showMarkers: boolean;
    loop: boolean;
  };
  hook: { [key: string]: number };
}

interface Emits {
  (e: 'togglePlay'): void;

  (e: 'reset'): void;

  (e: 'setSpeed', speed: number): void;

  (e: 'seekTo', segmentIndex: number, pointIndex: number): void;

  (e: 'selectSegment', index: number): void;

  (e: 'updateOptions', options: any): void;

  (e: 'previousPoint'): void;

  (e: 'nextPoint'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 状态管理
const isActive = ref(true);
const isMiniMode = ref(false);

const speedOptions = [0.5, 1, 2, 5, 10];
const selectedSegmentIndex = ref(props.currentSegmentIndex);
const autoCenter = ref(props.playbackOptions.autoCenter);
const showTrack = ref(props.playbackOptions.showTrack);
const showMarkers = ref(props.playbackOptions.showMarkers);
const loop = ref(props.playbackOptions.loop);

// 监听播放状态
watch(
  () => props.isPlaying,
  (e) => {
    console.log('播放状态', props.isPlaying);
  }
);

// 监听播放选项变化
watch(
  () => props.playbackOptions,
  () => {
    autoCenter.value = props.playbackOptions.autoCenter;
    showTrack.value = props.playbackOptions.showTrack;
    showMarkers.value = props.playbackOptions.showMarkers;
    loop.value = props.playbackOptions.loop;
  },
  {
    immediate: true,
    deep: true
  }
);

// 监听外部segment变化
watch(
  () => props.currentSegmentIndex,
  (newVal) => {
    selectedSegmentIndex.value = newVal;
  }
);

// 切换侧边栏（展开/收起）
const toggleSideBar = () => {
  if (isMiniMode.value) {
    // 迷你模式 → 完整模式
    isMiniMode.value = false;
    isActive.value = true;
  } else if (isActive.value) {
    // 完整模式 → 迷你模式
    isMiniMode.value = true;
    isActive.value = false;
  } else {
    // 隐藏状态 → 完整模式（保持原有逻辑）
    isActive.value = true;
  }
};

// 迷你模式下的播放按钮点击
const handleMiniPlay = () => {
  emit('togglePlay');
};

// 原有方法
const togglePlay = () => {
  emit('togglePlay');
};

const reset = () => {
  emit('reset');
};

const setSpeed = (speed: number) => {
  emit('setSpeed', speed);
};

const onSegmentChange = () => {
  emit('selectSegment', selectedSegmentIndex.value);
};

const seekToStart = () => {
  emit('seekTo', selectedSegmentIndex.value, 0);
};

const seekToEnd = () => {
  const segment = props.segments[selectedSegmentIndex.value];
  emit('seekTo', selectedSegmentIndex.value, segment.points.length - 1);
};

const previousPoint = () => {
  emit('previousPoint');
};

const nextPoint = () => {
  emit('nextPoint');
};

const onProgressChange = (event: Event) => {
  const value = parseInt((event.target as HTMLInputElement).value);
};

const onProgressChangeEnd = (event: Event) => {
  const value = parseInt((event.target as HTMLInputElement).value);
  emit('seekTo', selectedSegmentIndex.value, value);
};

const updateOptions = () => {
  emit('updateOptions', {
    autoCenter: autoCenter.value,
    showTrack: showTrack.value,
    showMarkers: showMarkers.value,
    loop: loop.value
  });
};
</script>
<style scoped lang="scss">
.track-playback-control {
  position: relative;
  display: inline-block;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  max-width: 350px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  // 切换按钮 - 始终在主内容的左侧
  .switch {
    cursor: pointer;
    position: absolute;
    left: -14px;
    top: 50%;
    transform: translateY(-50%);
    transition: all 0.3s ease;
    z-index: 889;
    clip-path: polygon(0% 80%, 0% 20%, 100% 0%, 100% 100%);
    width: 14px;
    height: 80px;
    background: rgba(255, 255, 255, 0.95);
    filter: drop-shadow(-2px 0 10px rgba(0, 0, 0, 0.3));
    color: #96989a;
    display: flex;
    align-items: center;
    justify-content: center;

    .is-active {
      transform: rotate(180deg);
    }

    &:hover {
      filter: drop-shadow(-2px 0 12px rgba(0, 0, 0, 0.4));
      color: #3498db;
    }
  }

  // 迷你模式样式 - 相对于父元素定位
  &.mini {
    position: absolute;
    top: 0;
    right: 0;
    max-width: 70px;
    padding: 12px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.98);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(10px);
    animation: slideInRight 0.3s ease;

    // 迷你模式下 switch 贴合播放按钮
    .switch {
      left: -14px;
      height: 46px;
      top: 50%;
      transform: translateY(-50%);

      svg {
        transform: scale(0.8);
      }
    }

    .mini-player {
      cursor: pointer;
      width: 48px;
      height: 48px;
      text-align: center;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;

      opacity: 1;

      /** 文本1 */
      font-size: 10px;
      font-weight: 400;
      letter-spacing: 0;
      line-height: 14.48px;
      color: rgba(56, 56, 56, 1);
      vertical-align: top;

      .image {
        width: 18px;
        height: 18px;
        background-image: url('./guiji.png');
        margin-bottom: 5px;
      }

      //.play-btn {
      //  width: 46px;
      //  height: 46px;
      //  margin: 0;
      //  font-size: 1.4rem;
      //
      //  &:hover {
      //    transform: scale(1.05);
      //  }
      //}
    }
  }

  // 隐藏状态
  &.hide:not(.mini) {
    opacity: 0;
    visibility: hidden;
    transform: translateX(100%);
  }

  // 右上角滑入动画
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .control-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid #e0e0e0;

    .quanping {
      margin-left: 5px;
      cursor: pointer;
      width: 13px;
      height: 13px;
      background-image: url('./quanping.png');
    }

    h3 {
      margin: 0;
      color: #2c3e50;
      font-size: 1rem;
      font-weight: bold;
    }

    .status-indicator {
      padding: 4px 12px;
      border-radius: 15px;
      font-size: 0.8rem;
      font-weight: 500;
      background: #ecf0f1;
      color: #7f8c8d;

      &.playing {
        background: #2ecc71;
        color: white;
        animation: pulse 2s infinite;
      }
    }
  }

  .control-section {
    margin-bottom: 20px;

    label {
      display: block;
      margin-bottom: 8px;
      color: #34495e;
      font-weight: 500;
      font-size: 0.9rem;
    }

    select {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      background: white;
      font-size: 0.9rem;
      color: #2c3e50;
      outline: none;
      transition: border-color 0.3s ease;

      &:focus {
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
      }
    }
  }

  .playback-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;

    .btn-group {
      display: flex;
      justify-content: space-between;
      gap: 5px;
      flex: 1;

       .control-btn {
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .qidian {
        .icon {
          //background: url('./qidian.png') no-repeat;
          //filter: drop-shadow(0px 0px 0 black) brightness(0);
          background: #000000; /* 想要的颜色 */
          -webkit-mask: url('./qidian.png') no-repeat center / contain;
          mask: url('./qidian.png') no-repeat center / contain;
          width: 13px;
          height: 16px;
        }
      }

      .shang {
        .icon {
          //background: url('./shang.png') no-repeat;
          //filter: drop-shadow(0px 0px 0 black) brightness(0);
          background: #000000; /* 想要的颜色 */
          -webkit-mask: url('./shang.png') no-repeat center / contain;
          mask: url('./shang.png') no-repeat center / contain;
          width: 22px;
          height: 18px;
        }
      }

      .xia {
        .icon {
          //background: url('./xia.png') no-repeat;
          //filter: drop-shadow(0px 0px 0 black) brightness(0);
          background: #000000; /* 想要的颜色 */
          -webkit-mask: url('./xia.png') no-repeat center / contain;
          mask: url('./xia.png') no-repeat center / contain;
          width: 22px;
          height: 18px;
        }
      }

      .zhongdian {
        .icon {
          //background: url('./zhongdian.png') no-repeat;
          //filter: drop-shadow(0px 0px 0 black) brightness(0);
          background: #000000; /* 想要的颜色 */
          -webkit-mask: url('./zhongdian.png') no-repeat center / contain;
          mask: url('./zhongdian.png') no-repeat center / contain;
          width: 13px;
          height: 16px;
        }
      }
    }
  }
.control-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 8px;
    background: #f8f9fa;
    color: #2c3e50;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 1.2rem;

    &:hover:not(:disabled) {
      background: #e9ecef;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &.play-btn {
      .icon {
        //background: url('./kaishi.png') no-repeat;
        //filter: drop-shadow(0px 0px 0 #3498db);
        background: #3498db; /* 想要的颜色 */
        -webkit-mask: url('./kaishi.png') no-repeat center / contain;
        mask: url('./kaishi.png') no-repeat center / contain;
        width: 20px;
        height: 20px;
      }

      &.playing {
        .icon {
          background: #e74c3c; /* 想要的颜色 */
          -webkit-mask: url('./zanting.png') no-repeat center / contain;
          mask: url('./zanting.png') no-repeat center / contain;
          width: 20px;
          height: 20px;
        }
      }

      &:hover {
        //background: #2980b9;
        //box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
      }
    }

    &.reset-btn {
      .icon {
        background: url('./chongzhi.png') no-repeat;
        filter: drop-shadow(0px 0px 0 black) brightness(0);
        width: 17px;
        height: 22px;
      }

      &:hover {
        //background: #d68910;
        //box-shadow: 0 4px 12px rgba(243, 156, 18, 0.3);
      }
    }
  }

  .speed-control {
    .speed-buttons {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .speed-btn {
      padding: 6px 12px;
      border: 2px solid #e0e0e0;
      border-radius: 20px;
      background: white;
      color: #7f8c8d;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.85rem;
      flex: 1;

      &:hover {
        border-color: #3498db;
        color: #3498db;
        transform: translateY(-2px);
      }

      &.active {
        background: #3498db;
        border-color: #3498db;
        color: white;
        box-shadow: 0 4px 8px rgba(52, 152, 219, 0.2);
      }
    }
  }

  .progress-control {
    .progress-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 0.9rem;
      color: #7f8c8d;
    }

    .progress-slider {
      width: 100%;
      height: 6px;
      -webkit-appearance: none;
      background: linear-gradient(90deg, #3498db, #2ecc71);
      border-radius: 3px;
      outline: none;

      &::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 20px;
        height: 20px;
        background: white;
        border-radius: 50%;
        cursor: pointer;
        border: 3px solid #3498db;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        transition: all 0.3s ease;

        &:hover {
          transform: scale(1.2);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
      }

      &::-moz-range-thumb {
        width: 20px;
        height: 20px;
        background: white;
        border-radius: 50%;
        cursor: pointer;
        border: 3px solid #3498db;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }
    }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
  :deep(.stat-item),
  .stat-item {
    text-align: center;
    //padding: 12px;
    //background: #f8f9fa;
    //border-radius: 8px;
    //border-left: 4px solid #3498db;
  }

  :deep(.stat-label),
  .stat-label {
    font-size: 0.8rem;
    color: #7f8c8d;
    margin-bottom: 4px;
  }

  :deep(.stat-value),
  .stat-value {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--el-color-primary);
  }

  .options-section {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 0;

    .option-item {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      max-width: 30%;

      input[type='checkbox'] {
        margin-right: 10px;
        width: 18px;
        height: 18px;
        cursor: pointer;

        &:checked {
          accent-color: #3498db;
        }
      }

      label {
        margin: 0;
        cursor: pointer;
        color: #34495e;
        font-size: 0.9rem;
        user-select: none;
      }
    }
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(46, 204, 113, 0.4);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(46, 204, 113, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(46, 204, 113, 0);
    }
  }
}

@media (max-width: 768px) {
  .track-playback-control {
    max-width: 100%;
    margin: 10px;

    .stats-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
