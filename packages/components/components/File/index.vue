<template>
  <el-upload
    ref="uploadRef"
    v-model:file-list="fileList"
    :before-upload="beforeAvatarUpload"
    class="upload-demo"
    :on-change="handleChange"
    :drag="dataFinal.drag"
    :accept="dataFinal.accept"
    :auto-upload="dataFinal.autoUpload"
    :http-request="handleRequest"
    :limit="dataFinal.limitNum"
    :on-remove="handleOnRemove"
  >
    <el-button type="primary">点击上传</el-button>
    <template #tip>
      <div class="el-upload__tip">
        <span v-if="dataFinal.accept">请上传{{ dataFinal.accept }}格式的文件&nbsp;</span>
        <span v-if="dataFinal.limitSize">文件大小不超过{{ dataFinal.limitSize }}MB&nbsp;</span>
        <span v-if="dataFinal.limitNum">只能上传{{ dataFinal.limitNum }}个</span>
      </div>
      <div class="el-upload__tip">
        <span v-if="dataFinal.hasTemplate"
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
import { computed, getCurrentInstance, onMounted, type PropType, ref, useTemplateRef } from 'vue'
import {
  ElMessage,
  UploadProps,
  UploadRequestOptions,
  UploadStatus,
  UploadUserFile,
} from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { fileInnerType } from '../form/types'
import { handleFileDownload, request } from '@/components/js'

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
    type: [String, Object],
    default: '',
  },
  dowm: {
    type: Function,
    default: undefined,
  },
})
const dataFinal = computed<fileInnerType>(() => {
  const data = { ...props.data }
  data.drag = data.drag ?? false
  data.autoUpload = data.autoUpload ?? true
  data.accept = data.accept ?? undefined
  data.limitSize = data.limitSize ?? 2
  data.limitNum = data.limitNum ?? 1
  data.hasTemplate = data.hasTemplate ?? undefined
  return data
})
const uploadRef = useTemplateRef('uploadRef')
const fileList = ref<UploadUserFile[]>([])
const handleOnRemove = (file: any, uploadFiles: UploadUserFile[]) => {
  // console.log(file, uploadFiles, fileList.value);
  fileList.value = uploadFiles
  updateModelValue()
}
const updateModelValue = (file?:UploadUserFile[]|UploadUserFile|string[]|string) => {
  let files:UploadUserFile[]|UploadUserFile|string[]|string = file ?? fileList.value.map((item) => item.raw)
  if (dataFinal.value.limitNum == 1 && Array.isArray(files) && files.length > 0) {
    files = files[0]
  }
  emits('update:modelValue', files)
}
const handleChange: UploadProps['onChange'] = (uploadFile, uploadFiles) => {
  // console.log(uploadFile, uploadFiles);
  fileList.value = uploadFiles
  updateModelValue()
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
const emits = defineEmits(['fileTypeError', 'fileSizeError', 'update:modelValue'])
const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  let type: string[] | string = rawFile.name.split('.')
  type = '.' + type[type.length - 1]
  if (
    dataFinal.value.accept &&
    !dataFinal.value.accept.split(',').find((item) => item === (type as string))
  ) {
    emits('fileTypeError')
    if (proxyProps.value['onFileTypeError']) {
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

const handleRequest = (options: UploadRequestOptions): any => {
  if (dataFinal.value.httpRequest) {
    dataFinal.value.httpRequest(options).then((res: any) => {
      updateModelValue(res)
    })
  } else {
    updateModelValue()
  }
}
</script>
