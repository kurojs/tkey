import { ShareStore } from "@tkey/common-types";
export declare const storeShareOnLocalStorage: (share: ShareStore) => Promise<void>;
export declare const getShareFromLocalStorage: (polyID: string) => Promise<ShareStore>;
export declare function areBrowsersEqual(oldBrowserUa: string, newBrowserUa: string): boolean;
