export interface scrollParams {
  scrollTop: number
  startIndex: number
  endIndex: number
  totalCount: number
}
export interface virtualConfig {
  isVirtual?: boolean // 启用虚拟滚动
  count?: number // 可视区域显示20行（固定值）
  bufferSize?: number // 缓冲区5行
  rowHeight?: number // 默认行高40px
  originData?: any[]
  isDebug?:Boolean;
  // 滚动回调
  onScroll: (info: scrollParams) => void
  onInit?: (callback: (data: any[]) => void) => void | Promise<any[]>
  interceptorsMap?: interceptorsMapType
}
export interface interceptorsMapType {
  [key: string]: (...args: any) => void | boolean | null | undefined | Array<any> | Object
}
