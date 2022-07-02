export interface ISidebarState {
    mFileSize: Number;
    sFileSize: Number;
    mFileEndpointsNumber: Number;
    sFileEndpointsNumber: Number;
    sFileMissEndpointsNumber: Number;
    mFileMissEndpointsNumber: Number;
    sFileConfusedTypeNumber: Number;
}

export interface DiffObjest {
    type: string;
    path: string;
    before?: string;
    after?: string;
}

export interface DiffJson {
    // add: { 
    //     paths: { [key: string]: Array<DiffObjest> };
    //     [key: string]: any;
    // };
    // delete: {
    //     [key: string]: any;
    //     paths: { [key: string]: Array<DiffObjest> };
    // };
    replace: Array<DiffObjest>;
    add: Array<DiffObjest>;
    delete: Array<DiffObjest>;
}