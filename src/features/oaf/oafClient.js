// src/features/oaf/oafClient.js
// Wrapper functions for interacting with the Open Assistant Framework (OAF) API.
// This version uses OafApp (constructor) and logs runtime config to help verify IDs/host.

import { OafApp } from "@coupa/open-assistant-framework-client";
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
  oafApp = new OafApp({
    appId: config.appId,
    coupahost: config.coupahost,
    iframeId: config.iframeId,
  });

  // DEBUG: log config & current URL to confirm the iframe id came from the query string
  console.log("[OAF CONFIG AT RUNTIME]", config);
  console.log("[LOCATION HREF]", window.location.href);
} catch (_e) {
  oafApp = null;
}

const failure = (message, rawError) => ({
  status: STATUSES.ERROR,
  message,
  ...(rawError ? { rawError } : {}),
});

const noOafMsg = (op) =>
  `OAF is not connected (${op} unavailable in standalone). Open the app from within Coupa.`;

/**
 * Safely execute an OAF call. Returns normalized result or a failure object.
 */
const callOaf = async (factory, opName) => {
  if (!oafApp) return failure(noOafMsg(opName));
  try {
    const resp = await factory();
    if (resp == null) {
      return failure(`No response from OAF for ${opName}`);
    }
    return resp;
  } catch (err) {
    return failure(`OAF ${opName} failed`, err);
  }
};

// --- helpers ---
const normalizePath = (p) => {
  if (!p) return "";
  // Strip any stray bullet characters / unusual whitespace
  p = p.replace(/\u2022/g, "").trim();
  // If a full URL was pasted, strip origin
  try {
    const u = new URL(p);
    p = u.pathname + (u.search || "");
  } catch { /* not a full URL */ }
  if (!p.startsWith("/")) p = "/" + p;
  return p.replace(/\/{2,}/g, "/");
};

// ====== BASIC CONTEXT CALLS (prove we are connected) ======
export const getUserContext = async () =>
  callOaf(() => oafApp.getUserContext(), "getUserContext");

export const getPageContext = async () =>
  callOaf(() => oafApp.getPageContext(), "getPageContext");

// ====== NAVIGATION (dual-signature, resilient) ======
export const navigatePath = async (path) =>
  callOaf(async () => {
    const normalized = normalizePath(path);

    // Try { path } signature first
    try {
      const r = await oafApp.navigateToPath({ path: normalized });
      if (r != null) return r;
      const r2 = await oafApp.navigateToPath(normalized); // fallback to string
      return r2 ?? { status: "noop", message: "Host returned no body (string signature)" };
    } catch (eObj) {
      try {
        const r2 = await oafApp.navigateToPath(normalized);
        return r2 ?? { status: "noop", message: "Host returned no body (string signature)" };
      } catch (eStr) {
        throw { objectSignatureError: eObj, stringSignatureError: eStr, sentPath: normalized };
      }
    }
  }, "navigateToPath");

// ====== WINDOW MANAGEMENT (prove permissions) ======
export const setSize = async (height, width) =>
  callOaf(() => oafApp.setSize({ height, width }), "setSize");

export const moveAppToLocation = async (top, left, resetToDock) =>
  callOaf(() => oafApp.moveToLocation({ top, left, resetToDock }), "moveToLocation");

export const moveAndResize = async (top, left, height, width, resetToDock) =>
  callOaf(() => oafApp.moveAndResize({ top, left, height, width, resetToDock }), "moveAndResize");

// ====== ENTERPRISE / FORMS ======
export const openEasyForm = async (formId) => {
  if (!oafApp || !oafApp.enterprise) return failure(noOafMsg("openEasyForm"));
  return callOaf(() => oafApp.enterprise.openEasyForm(formId), "openEasyForm");
};

export const readForm = async (readMetaData) =>
  callOaf(() => oafApp.readForm({ formMetaData: readMetaData }), "readForm");

export const writeForm = async (writeData) =>
  callOaf(() => oafApp.writeForm(writeData), "writeForm");

// ====== SUBSCRIPTIONS / EVENTS ======
export const subscribeToLocation = async (subscriptionData) =>
  callOaf(() => oafApp.listenToDataLocation(subscriptionData), "listenToDataLocation");

export const subscribeToEvents = async (eventsSubscriptionData) =>
  callOaf(() => oafApp.listenToOafEvents(eventsSubscriptionData), "listenToOafEvents");

export const oafEvents = () => (oafApp?.events ? oafApp.events : createNoopEmitter());

// ====== METADATA / PROCESSES ======
export const getElementMeta = async (formStructure) =>
  callOaf(() => oafApp.getElementMeta(formStructure), "getElementMeta");

export const launchUiButtonClickProcess = async (processId) => {
  if (!oafApp || !oafApp.enterprise) return failure(noOafMsg("launchUiButtonClickProcess"));
  return callOaf(
    () => oafApp.enterprise.launchUiButtonClickProcess(processId),
    "launchUiButtonClickProcess"
  );
};