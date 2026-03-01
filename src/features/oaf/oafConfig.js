// src/features/oaf/oafConfig.js
import { CONFIG_PROPS } from "./oafConstants";

// Parse current URL params (Coupa app appends these when launching the floating iFrame)
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
 * Determine the Coupa host.
 * - In PROD: prefer the URL param (?coupahost=...), else fall back to your tenant default.
 * - In DEV: use local bridge.
 */
const getCoupaHost = () => {
  if (!import.meta.env.PROD) {
    return CONFIG_PROPS.HOST_URLS.LOCALHOST;
  }

  const fromUrl = normalizeHost(getParam(CONFIG_PROPS.URL_PARAMS.COUPA_HOST)); // "coupahost"
  return fromUrl || CONFIG_PROPS.HOST_URLS.DEFAULT_HOST; // https://ey-in-demo.coupacloud.com
};

/**
 * Get the runtime floating iFrame id.
 * IMPORTANT: Never hard-code this in PROD. Coupa generates a new id each launch and passes it as ?floating_iframe_id=...
 */
const getIframeId = () => {
  const id =
    getParam(
      CONFIG_PROPS.URL_PARAMS.IFRAME_ID, // "floating_iframe_id"
      "iframeId",
      "iframe-id",
      "iframe_id"
    );

  if (id) return id;

  // If Coupa didn't pass it (e.g., you opened Vercel URL directly), generate a fallback
  const fallback = `standalone-${(crypto?.randomUUID?.() || Math.random().toString(36).slice(2))}`;
  if (import.meta.env.PROD) {
    console.warn("[OAF] No floating_iframe_id in URL; using fallback:", fallback);
  }
  return fallback;
};

/**
 * Final OAF config object used by the SDK.
 */
const config = {
  appId: "1234567890",        // Your Coupa iFrame "Client ID"
  coupahost: getCoupaHost(),  // Prefer URL param in PROD
  iframeId: getIframeId(),    // Must be taken from URL; do NOT hard-code
};

/**
 * Validate critical fields.
 */
const validateConfig = (cfg) => {
  if (!cfg.appId) throw new Error("App ID is required for OAF configuration");
  if (!cfg.coupahost) throw new Error("Coupa host is required for OAF configuration");
  if (import.meta.env.PROD && cfg.iframeId.startsWith("standalone-")) {
    console.warn("[OAF] Using standalone iframeId in PROD (app not launched from Coupa?):", cfg.iframeId);
  }
};

validateConfig(config);

export default config;