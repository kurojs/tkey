import { ShareStore } from "@tkey/common-types";
import bowser from "bowser";

function storageAvailable(type: string): boolean {
  let storage: Storage;
  try {
    storage = window[type];
    const x = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return (
      e instanceof DOMException &&
      // everything except Firefox
      (e.code === 22 ||
        // Firefox
        e.code === 1014 ||
        // test name field too, because code might not be present
        // everything except Firefox
        e.name === "QuotaExceededError" ||
        // Firefox
        e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
      // acknowledge QuotaExceededError only if there's something already stored
      storage &&
      storage.length !== 0
    );
  }
}

export const storeShareOnLocalStorage = async (share: ShareStore, key: string): Promise<void> => {
  const fileStr = JSON.stringify(share);
  if (!storageAvailable("localStorage")) {
    throw new Error("local storage isn't enabled");
  }
  localStorage.setItem(key, fileStr);
};

export const getShareFromLocalStorage = async (key: string): Promise<ShareStore> => {
  if (!storageAvailable("localStorage")) {
    throw new Error("local storage isn't enabled");
  }
  const foundFile = localStorage.getItem(key);
  if (!foundFile) throw new Error("No Share exists in localStorage");
  return ShareStore.fromJSON(JSON.parse(foundFile));
};

export function areBrowsersEqual(oldBrowserUa: string, newBrowserUa: string): boolean {
  const oldBrowser = bowser.parse(oldBrowserUa);
  const newBrowser = bowser.parse(newBrowserUa);
  return oldBrowser.browser.name === newBrowser.browser.name && oldBrowser.os.name === newBrowser.os.name;
}
