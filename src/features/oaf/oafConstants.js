/**
 * Shared constants for OAF feature.
 */

/**
 * Configuration properties for OAF initialization
 * @readonly
 * @typedef {Object}
 */
export const CONFIG_PROPS = {
  /** Unique application identifier for OAF registration */
  APP_ID: "123123", //update this with your app-id
  HOST_URLS: {
    LOCALHOST: "http://localhost:46880",
    HTTPS_PROTOCOL: "https://",
    DEFAULT_HOST: "https://example.com",
  },

  URL_PARAMS: {
    COUPA_HOST: "coupahost",
    IFRAME_ID: "floating_iframe_id",
  },
};

export const LAYOUT_POSITIONS = {
  DOCKED_LEFT: "docked-left",
  DOCKED_RIGHT: "docked-right",
};

export const LAYOUT_STATES = {
  MAXIMIZED: "maximized",
  MINIMIZED: "minimized",
  SIDE_PANEL: "side-panel",
  DEFAULT: "default",
};

export const LAYOUT_DIMENSIONS = {
  MAXIMIZE_HEIGHT_RATIO: 0.6, // 60% of viewport height
  MAXIMIZE_WIDTH_RATIO: 0.3,  // 30% of viewport width
  SIDE_PANEL_HEIGHT_RATIO: 0.95, // 95% of viewport height
  SIDE_PANEL_WIDTH_RATIO: 0.3,   // 30% of viewport width
  MINIMIZE_SIZE: 200, // 200px x 200px for minimized state
};

export const DISPATCH_ACTIONS = {
  SET_ERROR: "SET_ERROR",
  SET_RESPONSE: "SET_RESPONSE",
  SET_LAYOUT_POSITION: "SET_LAYOUT_POSITION",
  SET_LAYOUT_STATE: "SET_LAYOUT_STATE",
};

export const STATUSES = {
  SUCCESS: "success",
  ERROR: "failure",
};

export const ERROR_MESSAGES = {
  GENERIC: "An error occurred",
  PAGE_CONTEXT: "Failed to get page context",
  RESIZE: "Failed to resize the window",
  UNKNOWN: "An unknown error occurred",
  USE_OAF: "useOaf must be used within an OafProvider",
};

export const SUCCESS_MESSAGES = {
  GENERIC: "Operation completed successfully",
  RESIZE: (height, width) =>
    `Window resized successfully to ${height}x${width}`,
};

