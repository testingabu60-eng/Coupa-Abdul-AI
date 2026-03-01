// src/features/oaf/oafClient.js
import { initOAFInstance } from "@coupa/open-assistant-framework-client";
import config from "./oafConfig";
import { STATUSES } from "./oafConstants";

// --- safe event emitter for standalone mode ---
const createNoopEmitter = () => ({
  on: () => {},
  off: () => {},
  emit: () => {},
});

let oafApp = null;
try {
  oafApp = initOAFInstance(config);
} catch {
  oafApp = null;
}

const failure = (message, rawError) => ({
  status: STATUSES.ERROR,
  message,
  ...(rawError ? { rawError } : {}),
});

const noOafMsg = (op) =>
  `OAF is not connected (${op} unavailable in standalone). Open the app from within Coupa.`;

const callOaf = async (factory, opName) => {
  if (!oafApp) return failure(noOafMsg(opName));
  try {
    const resp = await factory();
    if (resp == null) {
      // IMPORTANT: Do NOT treat void as success for navigate calls.
      return failure(`No response from OAF for ${opName}`);
    }
    return resp;
  } catch (err) {
    return failure(`OAF ${opName} failed`, err);
  }
};

const normalizePath = (p) => {
  if (!p) return "";
  try {
    const u = new URL(p);
    p = u.pathname + (u.search || "");
  } catch {}
  p = p.trim();
  if (!p.startsWith("/")) p = "/" + p;
  return p.replace(/\/{2,}/g, "/");
};



export const getUserContext = async () =>
  callOaf(() => oafApp.getUserContext(), "getUserContext");

export const getPageContext = async () =>
  callOaf(() => oafApp.getPageContext(), "getPageContext");

export const navigatePath = async (path) =>
  callOaf(() => {
    const normalized = normalizePath(path);
    return oafApp.navigateToPath({ path: normalized }); // object signature only
  }, "navigateToPath");

export const setSize = async (h, w) =>
  callOaf(() => oafApp.setSize({ height: h, width: w }), "setSize");

export const moveAppToLocation = async (top, left, resetToDock) =>
  callOaf(() => oafApp.moveToLocation({ top, left, resetToDock }), "moveToLocation");

export const moveAndResize = async (top, left, height, width, resetToDock) =>
  callOaf(() => oafApp.moveAndResize({ top, left, height, width, resetToDock }), "moveAndResize");

export const openEasyForm = async (formId) => {
  if (!oafApp || !oafApp.enterprise) return failure(noOafMsg("openEasyForm"));
  return callOaf(() => oafApp.enterprise.openEasyForm(formId), "openEasyForm");
};

export const readForm = async (readMetaData) =>
  callOaf(() => oafApp.readForm({ formMetaData: readMetaData }), "readForm");

export const writeForm = async (writeData) =>
  callOaf(() => oafApp.writeForm(writeData), "writeForm");

export const subscribeToLocation = async (subscriptionData) =>
  callOaf(() => oafApp.listenToDataLocation(subscriptionData), "listenToDataLocation");

export const subscribeToEvents = async (eventsSubscriptionData) =>
  callOaf(() => oafApp.listenToOafEvents(eventsSubscriptionData), "listenToOafEvents");

export const oafEvents = () => (oafApp?.events ? oafApp.events : createNoopEmitter());
export const getElementMeta = async (formStructure) =>
  callOaf(() => oafApp.getElementMeta(formStructure), "getElementMeta");

export const launchUiButtonClickProcess = async (processId) => {
  if (!oafApp || !oafApp.enterprise) return failure(noOafMsg("launchUiButtonClickProcess"));
  return callOaf(() => oafApp.enterprise.launchUiButtonClickProcess(processId), "launchUiButtonClickProcess");
};