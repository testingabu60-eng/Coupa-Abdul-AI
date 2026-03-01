// src/features/oaf/oafConfig.js
import { CONFIG_PROPS } from "./oafConstants";

// Always parse what’s in the URL right now
const urlParams = new URLSearchParams(window.location.search);

const getParam = (...names) => {
  for (const n of names) {
    const v = urlParams.get(n);
    if (v && v.trim()) return v.trim();
  }
  return null;
};

// If protocol is missing, prefix https://
const normalizeHost = (h) => {
  if (!h) return null;
  if (/^https?:\/\//i.test(h)) return h; // already has protocol
  return `${CONFIG_PROPS.HOST_URLS.HTTPS_PROTOCOL}${h}`;
};

/**
 * Determines the Coupa host URL based on environment.
 * In PROD we hard-force your tenant host.
 * In DEV we keep the local OAF bridge (so you can still dev locally).
 */
const getCoupaHost = () => {
  if (!import.meta.env.PROD) {
    return CONFIG_PROPS.HOST_URLS.LOCALHOST;
  }
  return "https://ey-in-demo.coupacloud.com"; // YOUR TENANT
};

/**
 * Get an iframe id compatible with Coupa & standalone runs.
 * For PROD we hard-force your floating iframe id.
 */
const getIframeId = () => {
  if (import.meta.env.PROD) {
    return "69"; // YOUR IFRAME ID
  }
  // In dev, accept various forms or generate a fallback
  const id =
    getParam(
      CONFIG_PROPS.URL_PARAMS.IFRAME_ID, // "floating_iframe_id" (Coupa)
      "iframeId",
      "iframe-id",
      "iframe_id"
    ) ||
    `standalone-${(crypto?.randomUUID?.() || Math.random().toString(36).slice(2))}`;

  return id;
};

/**
 * Configuration object for the OAF (Open Assistant Framework) feature.
 *
 * @typedef {Object} OafConfig
 * @property {string} appId
 * @property {string} coupahost
 * @property {string} iframeId
 */
const config = {
  appId: "1234567890",           // YOUR APP ID
  coupahost: getCoupaHost(),     // forced in PROD
  iframeId: getIframeId(),       // forced in PROD
};

/**
 * Validate critical fields.
 */
const validateConfig = (cfg) => {
  if (!cfg.appId) {
    throw new Error("App ID is required for OAF configuration");
  }
  if (!cfg.coupahost) {
    throw new Error("Coupa host is required for OAF configuration");
  }
  // Only warn for iframe id in prod if it looks like a fallback
  if (import.meta.env.PROD && cfg.iframeId.startsWith("standalone-")) {
    console.warn("[OAF] No floating_iframe_id in URL; using standalone fallback:", cfg.iframeId);
  }
};

validateConfig(config);

export default config;