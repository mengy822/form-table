<template>
  <el-upload
    ref="uploadRef"
    :file-list="fileList"
    :before-upload="beforeAvatarUpload"
    :class="`upload-demo ${dataFinal.uploadType}`"
    :on-change="handleChange"
    :drag="dataFinal.drag"
    :accept="dataFinal.accept"
    :auto-upload="dataFinal.autoUpload"
    :http-request="handleRequest"
    :limit="dataFinal.limitNum"
    :list-type="dataFinal.listType"
    :on-exceed="handleExceed"
    :on-remove="handleOnRemove"
    :show-file-list="dataFinal.showFileList ?? true"
  >
    <img
      v-if="(imageUrl || fileList[0]?.url) && dataFinal.uploadType == 'icon'"
      :src="imageUrl || fileList[0]?.url"
      class="avatar"
      alt=""
    />
    <el-icon
      v-if="!(imageUrl || fileList[0]?.url) && dataFinal.uploadType == 'icon'"
      class="avatar-uploader-icon"
    >
      <Plus />
    </el-icon>

    <el-button type="primary" v-if="dataFinal.uploadType == 'button'">点击上传</el-button>
    <template #tip>
      <div class="el-upload__tip">
        <span v-if="dataFinal.accept">请上传{{ dataFinal.accept }}格式的文件&nbsp;</span>
        <span v-if="dataFinal.limitSize">文件大小不超过{{ dataFinal.limitSize }}MB&nbsp;</span>
        <span v-if="dataFinal.limitNum">只能上传{{ dataFinal.limitNum }}个</span>
      </div>
      <div class="el-upload__tip">
        <span v-if="dataFinal.hasTemplate" style="display: flex"
          >上传文件
          <el-button type="text" @click="downloadFun(dataFinal.hasTemplate)"
            >模板文件下载</el-button
          ></span
        >
      </div>
    </template>
  </el-upload>
</template>

<script lang="ts" setup name="File">
import { computed, getCurrentInstance, onDeactivated, onMounted, type PropType, ref, useTemplateRef } from 'vue'
import {
  ElMessage,
  UploadFile,
  UploadInstance,
  UploadProps,
  UploadRawFile,
  UploadRequestOptions,
  UploadStatus,
  UploadUserFile,
} from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { fileInnerType } from '../form/types'
import { handleFileDownload, request } from '../../js'
import { modelValueObjectType } from './types'

const props = defineProps({
  language: {
    type: Object,
    default: () => {
      return zhCn
    },
  },
  data: {
    type: Object as PropType<fileInnerType>,
    required: true,
  },
  modelValue: {
    type: [String, Array, Object] as PropType<
      string | string[] | modelValueObjectType | modelValueObjectType[]
    >,
    default: '',
  },
  dowm: {
    type: Function,
    default: undefined,
  },
})
const dataFinal = computed<fileInnerType>(() => {
  const data = { ...props.data }
  data.uploadType = data.uploadType ?? 'button'
  data.drag = data.drag ?? false
  data.autoUpload = data.autoUpload ?? true
  data.accept = data.accept ?? undefined
  data.limitSize = data.limitSize ?? 2
  data.limitNum = data.limitNum ?? 1
  data.hasTemplate = data.hasTemplate ?? undefined
  return data
})
const imageUrl = ref('')
const uploadRef = useTemplateRef<UploadInstance>('uploadRef')
const handleExceed = (files: any[]) => {
  if (dataFinal.value.limitNum == 1) {
    uploadRef.value!.clearFiles()
    const file = files[0] as UploadRawFile
    file.uid = Date.now()
    uploadRef.value!.handleStart(file)
    if (dataFinal.value.autoUpload) uploadRef.value?.submit()
  }
}
// 类型守卫函数
function isFileObject(value: any): value is modelValueObjectType {
  return (
    typeof value === 'object' && value !== null && 'url' in value && typeof value.url === 'string'
  )
}

function isStringArray(value: any): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isFileObjectArray(value: any): value is modelValueObjectType[] {
  return Array.isArray(value) && value.every((item) => isFileObject(item))
}

// 核心转换函数
const normalizeModelValue = (modelValue: typeof props.modelValue): UploadUserFile[] => {
  // 1. 空值处理
  if (modelValue == null || modelValue === '') {
    return []
  }

  // 2. 处理字符串数组
  if (isStringArray(modelValue)) {
    return modelValue.map((url, index) => ({
      uid: Date.now() + index + Math.random(),
      url: url,
      name: url.split('/').pop() || '未命名',
    }))
  }

  // 3. 处理对象数组
  if (isFileObjectArray(modelValue)) {
    return modelValue.map((item, index) => ({
      uid: Date.now() + index + Math.random(),
      url: item.url,
      name: item.name || item.url.split('/').pop() || '未命名',
    }))
  }

  // 4. 处理单个字符串
  if (typeof modelValue === 'string') {
    if (!modelValue) return []
    return [
      {
        uid: Date.now() + Math.random(),
        url: modelValue,
        name: modelValue.split('/').pop() || '未命名',
      },
    ]
  }

  // 5. 处理单个对象
  if (isFileObject(modelValue)) {
    if (!modelValue.url) return []
    return [
      {
        uid: Date.now() + Math.random(),
        url: modelValue.url,
        name: modelValue.name || modelValue.url.split('/').pop() || '未命名',
      },
    ]
  }
  return [modelValue]
}

const fileList = computed<UploadUserFile[]>({
  get() {
    return normalizeModelValue(props.modelValue)
  },
  set(val: UploadUserFile[]) {
    updateModelValue(val)
  },
})
const handleOnRemove = (file: any, uploadFiles: UploadUserFile[]) => {
  // console.log(file, uploadFiles, fileList.value);
  fileList.value = uploadFiles
  emits('remove', file)
  // updateModelValue()
}
// ============ 统一的更新函数（包含类型判断逻辑） ============
const updateModelValue = (files: UploadUserFile[]) => {
  // console.log('触发更新')
  if (!files || files.length === 0) {
    // 清空
    if (dataFinal.value.limitNum === 1) {
      emits('update:modelValue', '')
    } else {
      emits('update:modelValue', [])
    }
    return
  }

  const limitNum = dataFinal.value.limitNum
  const originalValue = props.modelValue
  // emits('update:modelValue', files[0])
  // return
  // 单个文件
  if (limitNum === 1) {
    const file = files[0]

    // 判断原始数据类型，保持类型一致性
    emits('update:modelValue', file.raw)
    return
  }
  emits('update:modelValue', files)
}
const handleChange: UploadProps['onChange'] = (
  uploadFile: UploadFile,
  uploadFiles: UploadFile[]
) => {
  console.log(uploadFile, uploadFiles)
  fileList.value = uploadFiles
}
const downloadInnerFun = (url: string | URL) => {
  request('GET', url, null, true).then((res) => {
    handleFileDownload(res)
  })
}
const downloadFun = computed(() => {
  return props.data.downLoad ?? props.dowm ?? downloadInnerFun
})
const proxyProps = ref<{ [key: string]: any }>({})
onMounted(() => {
  const internal = getCurrentInstance()
  const onEmit = (internal?.vnode.props || {}) as Record<string, any>
  for (const emit in onEmit) {
    proxyProps.value[emit] = typeof onEmit[emit] === 'function'
  }
})
const emits = defineEmits(['fileTypeError', 'fileSizeError', 'update:modelValue', 'remove'])
const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  let type: string[] | string = rawFile.name.split('.')
  type = '.' + type[type.length - 1]
  if (
    dataFinal.value.accept &&
    !dataFinal.value.accept.split(',').find((item) => item === (type as string))
  ) {
    emits('fileTypeError')
    if (!proxyProps.value['onFileTypeError']) {
      ElMessage({
        message: '文件类型错误',
        grouping: true,
        duration: 1500,
        type: 'error',
        showClose: true,
      })
    }
    return false
  } else if (
    (dataFinal.value.limitSize as number) > 0 &&
    rawFile.size / 1024 / 1024 > (dataFinal.value.limitSize as number)
  ) {
    emits('fileSizeError')
    if (!proxyProps.value['onFileSizeError']) {
      ElMessage({
        message: '文件大小超出限制',
        grouping: true,
        duration: 1500,
        type: 'error',
        showClose: true,
      })
    }
    return false
  }
  return true
}
const handleRemove = (file: any) => {
  // @ts-ignore
  uploadRef.value?.handleRemove(file)
}
const handleRequest = (options: UploadRequestOptions): any => {
  if (dataFinal.value.httpRequest) {
    dataFinal.value
      .httpRequest(options)
      .then((res: typeof props.modelValue) => {
        updateModelValue(normalizeModelValue(res))
      })
      .catch(() => handleRemove(options.file))
  }else{
    fileList.value.push(options.file)
  }
}
onDeactivated(() => {
  fileList.value = [];
});
</script>

<style scoped lang="scss">
.upload-demo {
  .avatar {
    height: 150px;
  }
  &.icon {
    :deep(.el-upload) {
      border: 1px dashed var(--el-border-color);
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: var(--el-transition-duration-fast);

      &:hover {
        border-color: var(--el-color-primary);
      }
    }
  }
  // :deep(.el-upload) {
  //   border: 1px dashed var(--el-border-color);
  //   border-radius: 6px;
  //   cursor: pointer;
  //   position: relative;
  //   overflow: hidden;
  //   transition: var(--el-transition-duration-fast);

  //   &:hover {
  //     border-color: var(--el-color-primary);
  //   }
  // }
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
</style>
