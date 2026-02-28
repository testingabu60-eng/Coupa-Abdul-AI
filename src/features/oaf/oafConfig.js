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
 * Determines the Coupa host URL based on environment, URL parameters and env vars.
 * Priority (prod): URL ?coupahost=... or ?host=...  -> Vercel env VITE_COUPA_HOST -> DEFAULT_HOST
 * In dev (vite), LOCALHOST is used for the local bridge.
 */
const getCoupaHost = () => {
  // When running locally (vite dev), use the local OAF bridge by default
  if (!import.meta.env.PROD) {
    return CONFIG_PROPS.HOST_URLS.LOCALHOST;
  }

  // In production builds (Vercel):
  const fromUrl = normalizeHost(getParam(CONFIG_PROPS.URL_PARAMS.COUPA_HOST, "host"));
  const fromEnv = normalizeHost(import.meta.env.VITE_COUPA_HOST); // optional fallback
  const chosen = fromUrl || fromEnv || CONFIG_PROPS.HOST_URLS.DEFAULT_HOST;

  if (!fromUrl) {
    console.warn(
      "[OAF] No coupahost in URL; using",
      fromEnv ? "Vercel env VITE_COUPA_HOST" : "CONFIG_PROPS.HOST_URLS.DEFAULT_HOST",
      "=>",
      chosen
    );
  }
  return chosen;
};

/**
 * Get an iframe id compatible with Coupa & standalone runs.
 * Accept multiple common variants, and fallback to a generated standalone id.
 */
const getIframeId = () => {
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
  appId: CONFIG_PROPS.APP_ID,
  coupahost: getCoupaHost(),
  iframeId: getIframeId(),
};

/**
 * Validate critical fields (don’t hard-fail if iframeId is a fallback;
 * that’s expected in standalone/preview mode).
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