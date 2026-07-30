import { UploadRawFile } from 'element-plus'

export interface fileType {
  drag?: boolean
  autoUpload?: boolean
  accept?: string
  limitSize?: number
  limitNum?: number
  hasTemplate?: string
  downLoad?: Function
  httpRequest?: Function
  fileSizeError?: Function
  fileTypeError?: Function
  remove?: Function
  multiple?: boolean
  aliases?: string
  showFileList?: boolean
  uploadType?: 'button' | 'icon'
  listType?: 'text' | 'picture' | 'picture-card'
}
export interface modelValueObjectType {
  raw?: UploadRawFile
  url: string
  name?: string
}
