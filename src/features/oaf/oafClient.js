// oafClient.js
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
 * opts.allowVoidSuccess: treat undefined/void responses as success (for fire-and-forget OAF calls)
 */
const callOaf = async (factory, opName, opts = {}) => {
  const { allowVoidSuccess = false } = opts;

  if (!oafApp) return failure(noOafMsg(opName));

  try {
    const resp = await factory();

    // Some enterprise APIs are imperative and return no payload.
    if (resp == null) {
      if (allowVoidSuccess) {
        return {
          status: STATUSES.SUCCESS,
          message: `${opName} requested`,
        };
      }
      return failure(`No response from OAF for ${opName}`);
    }

    return resp;
  } catch (err) {
    return failure(`OAF ${opName} failed`, err);
  }
};

/**
 * Sets the size of the OAF application window.
 */
export const setSize = async (height, width) =>
  callOaf(() => oafApp.setSize({ height, width }), "setSize", { allowVoidSuccess: true });

/**
 * Moves the OAF application window to a specific location.
 */
export const moveAppToLocation = async (top, left, resetToDock) =>
  callOaf(
    () => oafApp.moveToLocation({ top, left, resetToDock }),
    "moveToLocation",
    { allowVoidSuccess: true }
  );

/**
 * Retrieves the current page context using OAF.
 * Fallback: return viewport details from the browser so layout math still works.
 */
export const getPageContext = async () => {
  if (!oafApp) {
    // Fallback success payload to keep resize calculators working
    return {
      status: STATUSES.SUCCESS,
      data: {
        pageDetails: {
          viewPortHeight: window?.innerHeight || 800,
          viewPortWidth: window?.innerWidth || 1200,
        },
      },
      message: "Standalone fallback page context",
    };
  }
  return callOaf(() => oafApp.getPageContext(), "getPageContext");
};

/**
 * Moves and resizes the OAF application window.
 */
export const moveAndResize = async (top, left, height, width, resetToDock) =>
  callOaf(
    () => oafApp.moveAndResize({ top, left, height, width, resetToDock }),
    "moveAndResize",
    { allowVoidSuccess: true }
  );

/**
 * Navigates the user to a specific path using OAF.
 */
export const navigatePath = async (path) =>
  callOaf(() => oafApp.navigateToPath(path), "navigateToPath", { allowVoidSuccess: true });

/**
 * Opens an EasyForm using the OAF application.
 * Many tenants return no body — accept void as success.
 */
export const openEasyForm = async (formId) => {
  if (!oafApp || !oafApp.enterprise) {
    return failure(noOafMsg("openEasyForm"));
  }
  return callOaf(
    () => oafApp.enterprise.openEasyForm(formId),
    "openEasyForm",
    { allowVoidSuccess: true }
  );
};

/**
 * Reads form data using the OAF application.
 */
export const readForm = async (readMetaData) =>
  callOaf(() => oafApp.readForm({ formMetaData: readMetaData }), "readForm");

/**
 * Writes data to a form using the OAF application.
 */
export const writeForm = async (writeData) =>
  callOaf(() => oafApp.writeForm(writeData), "writeForm");

/**
 * Subscribes to data location changes using the OAF application.
 */
export const subscribeToLocation = async (subscriptionData) =>
  callOaf(() => oafApp.listenToDataLocation(subscriptionData), "listenToDataLocation");

/**
 * Subscribes to oaf events using the OAF application.
 */
export const subscribeToEvents = async (eventsSubscriptionData) =>
  callOaf(() => oafApp.listenToOafEvents(eventsSubscriptionData), "listenToOafEvents");

/**
 * Returns the OAF application's event emitter for subscribing to events.
 * Fallback to a safe no-op emitter in standalone mode.
 */
export const oafEvents = () => (oafApp?.events ? oafApp.events : createNoopEmitter());

/**
 * Retrieves metadata from a form or HTML element using OAF.
 */
export const getElementMeta = async (formStructure) =>
  callOaf(() => oafApp.getElementMeta(formStructure), "getElementMeta");

/**
 * Executes a workflow process by its ID.
 */
export const launchUiButtonClickProcess = async (processId) => {
  if (!oafApp || !oafApp.enterprise) {
    return failure(noOafMsg("launchUiButtonClickProcess"));
  }
  return callOaf(
    () => oafApp.enterprise.launchUiButtonClickProcess(processId),
    "launchUiButtonClickProcess",
    { allowVoidSuccess: true }
  );
};