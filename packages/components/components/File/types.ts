export interface fileType {
    drag?: boolean;
    autoUpload?: boolean;
    accept?: string;
    limitSize?: number;
    limitNum?: number;
    hasTemplate?: string;
    downLoad?: Function;
    httpRequest?: Function;
}
