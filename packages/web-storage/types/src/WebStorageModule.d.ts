import { IModule, ITKeyApi, ShareStore } from "@tkey/common-types";
export declare const WEB_STORAGE_MODULE_NAME = "webStorage";
declare class WebStorageModule implements IModule {
    moduleName: string;
    tbSDK: ITKeyApi;
    canUseFileStorage: boolean;
    constructor(canUseFileStorage?: boolean);
    setModuleReferences(tbSDK: ITKeyApi): void;
    initialize(): Promise<void>;
    storeDeviceShare(deviceShareStore: ShareStore): Promise<void>;
    storeDeviceShareOnFileStorage(shareIndex: string): Promise<void>;
    private getShareDescription;
    getDeviceShare(): Promise<ShareStore>;
    inputShareFromWebStorage(): Promise<void>;
    setFileStorageAccess(access: boolean): void;
}
export default WebStorageModule;
