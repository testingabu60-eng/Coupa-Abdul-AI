// src/features/oaf/oafClient.js
// Wrapper functions for interacting with the Open Assistant Framework (OAF) API.
// Provides graceful fallbacks when not connected to OAF (e.g., standalone on Vercel).

import { initOAFInstance } from "@coupa/open-assistant-framework-client";
import config from "./oafConfig";
import { STATUSES } from "./oafConstants";

// --- safe event emitter for standalone mode ---
const createNoopEmitter = () => ({
  on: () => {},
  off: () => {},
  emit: () => {},
});

// --- try to initialize OAF; if it fails, keep null ---
let oafApp = null;
try {
  oafApp = initOAFInstance(config);

  // DEBUG: print the config the client is using at runtime
  // It should show:
  //   appId: "1234567890"
  //   coupahost: "https://ey-in-demo.coupacloud.com"
  //   iframeId: "69"
  // Remove or comment out once verified.
  console.log("[OAF CONFIG AT RUNTIME]", config);
} catch (_e) {
  oafApp = null;
}

// --- helpers to normalize responses ---
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
      // If host returned nothing, surface as a clear failure so we can see it.
      return failure(`No response from OAF for ${opName}`);
    }
    return resp;
  } catch (err) {
    return failure(`OAF ${opName} failed`, err);
  }
};

// --- utilities ---
const normalizePath = (p) => {
  if (!p) return "";
  // Remove any stray bullet (•) or weird whitespace a user may paste
  p = p.replace(/\u2022/g, "").trim();

  // If a full URL was pasted (https://ey-in-demo.coupacloud.com/xxx), strip origin
  try {
    const u = new URL(p);
    p = u.pathname + (u.search || "");
  } catch {
    // not a full URL
  }
  if (!p.startsWith("/")) p = "/" + p;
  // collapse accidental double slashes
  p = p.replace(/\/{2,}/g, "/");
  return p;
};

// ====== BASIC CONTEXT CALLS (prove we are connected) ======
export const getUserContext = async () =>
  callOaf(() => oafApp.getUserContext(), "getUserContext");

export const getPageContext = async () =>
  callOaf(() => oafApp.getPageContext(), "getPageContext");

// ====== NAVIGATION (dual-signature, resilient) ======
/**
 * Navigates the user to a specific path using OAF.
 * Tries the object signature first ({ path }), then falls back to plain string.
 */
export const navigatePath = async (path) =>
  callOaf(async () => {
    const normalized = normalizePath(path);

    // Try { path } signature
    try {
      const r = await oafApp.navigateToPath({ path: normalized });
      if (r != null) return r;
      // host returned void → try string
      const r2 = await oafApp.navigateToPath(normalized);
      return r2 ?? { status: "noop", message: "Host returned no body (string signature)" };
    } catch (eObj) {
      // object failed → try string
      try {
        const r2 = await oafApp.navigateToPath(normalized);
        return r2 ?? { status: "noop", message: "Host returned no body (string signature)" };
      } catch (eStr) {
        // Surface both errors so we can see which signature fails
        throw { objectSignatureError: eObj, stringSignatureError: eStr, sentPath: normalized };
      }
    }
  }, "navigateToPath");

// ====== WINDOW MANAGEMENT (to prove permissions work) ======
export const setSize = async (height, width) =>
  callOaf(() => oafApp.setSize({ height, width }), "setSize");

export const moveAppToLocation = async (top, left, resetToDock) =>
  callOaf(() => oafApp.moveToLocation({ top, left, resetToDock }), "moveToLocation");

export const moveAndResize = async (top, left, height, width, resetToDock) =>
  callOaf(() => oafApp.moveAndResize({ top, left, height, width, resetToDock }), "moveAndResize");

// ====== ENTERPRISE / FORMS ======
export const openEasyForm = async (formId) => {
  if (!oafApp || !oafApp.enterprise) {
    return failure(noOafMsg("openEasyForm"));
  }
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
  if (!oafApp || !oafApp.enterprise) {
    return failure(noOafMsg("launchUiButtonClickProcess"));
  }
  return callOaf(
    () => oafApp.enterprise.launchUiButtonClickProcess(processId),
    "launchUiButtonClickProcess"
  );
};