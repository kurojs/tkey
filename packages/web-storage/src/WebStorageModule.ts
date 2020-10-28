import { IModule, ITKeyApi, prettyPrintError, ShareStore } from "@tkey/common-types";
import BN from "bn.js";

import { getShareFromFileStorage, storeShareOnFileStorage } from "./FileStorageHelpers";
import { areBrowsersEqual, getShareFromLocalStorage, storeShareOnLocalStorage } from "./LocalStorageHelpers";

export const WEB_STORAGE_MODULE_NAME = "webStorage";

class WebStorageModule implements IModule {
  moduleName: string;

  tbSDK: ITKeyApi;

  canUseFileStorage: boolean;

  constructor(canUseFileStorage = true) {
    this.moduleName = WEB_STORAGE_MODULE_NAME;
    this.canUseFileStorage = canUseFileStorage;
  }

  setModuleReferences(tbSDK: ITKeyApi): void {
    this.tbSDK = tbSDK;
    this.tbSDK.setDeviceStorage(this.storeDeviceShare.bind(this));
  }

  // eslint-disable-next-line
  async initialize(): Promise<void> {}

  async storeDeviceShare(deviceShareStore: ShareStore): Promise<void> {
    await storeShareOnLocalStorage(deviceShareStore);
    await this.tbSDK.addShareDescription(
      deviceShareStore.share.shareIndex.toString("hex"),
      JSON.stringify({ module: this.moduleName, userAgent: window.navigator.userAgent, dateAdded: Date.now(), savedOnFileStorage: false }),
      true
    );
  }

  async storeDeviceShareOnFileStorage(shareIndex: string): Promise<void> {
    const currentShareDescription = this.getShareDescription(shareIndex);
    if (!currentShareDescription) throw new Error("Invalid Share Description");
    await this.tbSDK.deleteShareDescription(shareIndex, currentShareDescription, false);
    await this.tbSDK.addShareDescription(
      shareIndex,
      JSON.stringify({ module: this.moduleName, userAgent: window.navigator.userAgent, dateAdded: Date.now(), savedOnFileStorage: true }),
      true
    );
    const shareStore = this.tbSDK.outputShareStore(new BN(shareIndex));
    return storeShareOnFileStorage(shareStore);
  }

  private getShareDescription(shareIndex: string) {
    const metadata = this.tbSDK.getMetadata();
    const shareDescriptionMap = metadata.getShareDescription();
    const currentShareDescription = shareDescriptionMap[shareIndex].reduce((acc, x) => {
      const parsed = JSON.parse(x);
      let finalAcc = acc;
      if (areBrowsersEqual(parsed.userAgent, window.navigator.userAgent) && parsed.module === this.moduleName) finalAcc = x;
      return finalAcc;
    }, "");
    return currentShareDescription;
  }

  async getDeviceShare(): Promise<ShareStore> {
    const metadata = this.tbSDK.getMetadata();
    const polyID = metadata.getLatestPublicPolynomial().getPolynomialID();
    let shareStore: ShareStore;
    try {
      shareStore = await getShareFromLocalStorage(polyID);
    } catch (localErr) {
      if (this.canUseFileStorage) {
        try {
          shareStore = await getShareFromFileStorage(polyID);
        } catch (fileErr) {
          if (fileErr?.message?.includes("storage quota")) {
            // User has denied access to storage. stop asking for every share
            this.canUseFileStorage = false;
          }
          throw new Error(`Error inputShareFromWebStorage: ${prettyPrintError(localErr)} and ${prettyPrintError(fileErr)}`);
        }
      }
      throw new Error(`Error inputShareFromWebStorage: ${prettyPrintError(localErr)}`);
    }
    return shareStore;
  }

  async inputShareFromWebStorage(): Promise<void> {
    const shareStore = await this.getDeviceShare();
    const latestShareDetails = await this.tbSDK.catchupToLatestShare(shareStore);
    if (shareStore.polynomialID !== latestShareDetails.latestShare.polynomialID) this.storeDeviceShare(latestShareDetails.latestShare);
    this.tbSDK.inputShareStore(latestShareDetails.latestShare);
  }

  setFileStorageAccess(access: boolean): void {
    this.canUseFileStorage = access;
  }
}

export default WebStorageModule;
