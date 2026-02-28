import { moveAndResize, getPageContext } from "./oafClient";
import {
  LAYOUT_POSITIONS,
  DISPATCH_ACTIONS,
  STATUSES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  LAYOUT_DIMENSIONS,
} from "./oafConstants";

/**
 * Handles the resize operation for the app window by calculating new dimensions,
 * moving and resizing the window, and updating layout state and position.
 *
 * @async
 * @function handleOAFResizeOperation
 * @param {Function} dispatch - Function to update state.
 * @param {Function} dimensionCalculator - Function to calculate new dimensions. Receives viewport, window dimensions.
 * @param {Object} newLayoutPosition - New layout position to be set after resizing.
 * @param {Object} newLayoutState - New layout state to be set after resizing.
 * @returns {Promise<void>} Resolves when the resize operation is complete.
 */
const handleOAFResizeOperation = async (
  dispatch,
  dimensionCalculator,
  newLayoutPosition,
  newLayoutState
) => {
  try {
    // 1. Fetch Page Context
    const pageContext = await getPageContext();
    if (!pageContext || pageContext.status !== STATUSES.SUCCESS) {
      dispatch({
        type: DISPATCH_ACTIONS.SET_ERROR,
        payload: ERROR_MESSAGES.PAGE_CONTEXT,
      });
      return;
    }

    // Extract viewport and window dimensions
    const viewPortHeight = pageContext.data.pageDetails.viewPortHeight;
    const viewPortWidth = pageContext.data.pageDetails.viewPortWidth;
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;

    // 2. Calculate new dimensions using provided calculator
    const { top, left, height, width } = dimensionCalculator(
      {
        viewPortHeight,
        viewPortWidth,
      },
      {
        windowHeight,
        windowWidth,
      },
      newLayoutPosition
    );

    // 3. Move and resize the app window
    const resp = await moveAndResize(top, left, height, width, false);

    if (resp.status === STATUSES.SUCCESS) {
      // Dispatch success response
      dispatch({
        type: DISPATCH_ACTIONS.SET_RESPONSE,
        payload: {
          message: SUCCESS_MESSAGES.RESIZE(height, width),
        },
      });

      // 4. Optionally update the layout
      if (newLayoutPosition) {
        dispatch({
          type: DISPATCH_ACTIONS.SET_LAYOUT_POSITION,
          payload: newLayoutPosition,
        });
      }

      if (newLayoutState) {
        dispatch({
          type: DISPATCH_ACTIONS.SET_LAYOUT_STATE,
          payload: newLayoutState,
        });
      }
    } else {
      // Dispatch error response
      dispatch({
        type: DISPATCH_ACTIONS.SET_ERROR,
        payload: resp.message,
      });
    }
  } catch (error) {
    // Dispatch error for exceptions
    dispatch({
      type: DISPATCH_ACTIONS.SET_ERROR,
      payload: error.message,
    });
  }
};

/**
 * Calculates dimensions for docking the App fully to the left.
 * @returns {Object} {top, left, height, width}
 */
const dockLeftCalculator = (
  { viewPortHeight },
  { windowHeight, windowWidth }
) => {
  const height = windowHeight;
  const width = windowWidth;
  const top = Math.round(viewPortHeight - height);
  const left = 0;
  return { top, left, height, width };
};

/**
 * Calculates dimensions for docking the App fully to the right.
 * @returns {Object} {top, left, height, width}
 */
const dockRightCalculator = (
  { viewPortHeight, viewPortWidth },
  { windowHeight, windowWidth }
) => {
  const height = windowHeight;
  const width = windowWidth;
  const top = Math.round(viewPortHeight - height);
  const left = Math.round(viewPortWidth - width);
  return { top, left, height, width };
};

/**
 * Calculates dimensions for a maximized/default layout.
 * Standard: 60% height, 30% width of viewport.
 * @returns {Object} {top, left, height, width}
 */
const maximizeCalculator = (
  { viewPortHeight, viewPortWidth },
  _,
  newLayoutPosition
) => {
  const height = Math.round(
    viewPortHeight * LAYOUT_DIMENSIONS.MAXIMIZE_HEIGHT_RATIO
  );
  const width = Math.round(
    viewPortWidth * LAYOUT_DIMENSIONS.MAXIMIZE_WIDTH_RATIO
  );
  const top = Math.round(viewPortHeight - height);

  // Align left if previously docked left, else right
  let left = Math.round(viewPortWidth - width);
  if (newLayoutPosition === LAYOUT_POSITIONS.DOCKED_LEFT) {
    left = 0;
  }
  return { top, left, height, width };
};

/**
 * Calculates dimensions for a side panel (95% height, 30% width).
 * Aligns left if previously docked left, else right.
 * @returns {Object} {top, left, height, width}
 */
const sidePanelCalculator = (
  { viewPortHeight, viewPortWidth },
  _,
  newLayoutPosition
) => {
  const height = Math.round(
    viewPortHeight * LAYOUT_DIMENSIONS.SIDE_PANEL_HEIGHT_RATIO
  );
  const width = Math.round(
    viewPortWidth * LAYOUT_DIMENSIONS.SIDE_PANEL_WIDTH_RATIO
  );
  const top = Math.round(viewPortHeight - height);
  let left = Math.round(viewPortWidth - width);
  if (newLayoutPosition === LAYOUT_POSITIONS.DOCKED_LEFT) {
    left = 0;
  }
  return { top, left, height, width };
};

/**
 * Calculates dimensions for minimizing the OAF.
 * Fixed size: 200x200.
 * @returns {Object} {top, left, height, width}
 */
const minimizeCalculator = ({ viewPortHeight, viewPortWidth }) => {
  const height = LAYOUT_DIMENSIONS.MINIMIZE_SIZE;
  const width = LAYOUT_DIMENSIONS.MINIMIZE_SIZE;
  const top = Math.round(viewPortHeight - height);
  const left = Math.round(viewPortWidth - width);
  return { top, left, height, width };
};

/**
 * Calculates dimensions for closing the OAF (size 0x0).
 * @returns {Object} {top, left, height, width}
 */
const closeCalculator = ({ viewPortHeight, viewPortWidth }) => {
  const height = 0;
  const width = 0;
  const top = Math.round(viewPortHeight - height);
  const left = Math.round(viewPortWidth - width);
  return { top, left, height, width };
};

/**
 * Executes an OAF action and returns a result object with multiple values.
 * @param {Function} action - Async function to execute
 * @returns {Promise<Object>} Result object with message, status, and additional fields based on response
 */
const oafExecuteAction = async (action) => {
  try {
    const resp = await action();
    let message = resp.message;
    const status = resp.status;

    if (status === STATUSES.SUCCESS) {
      const result = {
        message,
        status,
        ...(resp.data && { data: resp.data }), // Include data only if it exists
        rawResponse: resp,
      };
      return result;
    } else if (status === STATUSES.ERROR) {
      // Aggregate error messages if available
      if (Array.isArray(resp.error_data)) {
        message = resp.error_data
          .map((errorItem) => `${errorItem.error_key || STATUSES.ERROR} : ${errorItem.error_attribute || errorItem.error_message }`)
          .join("\n");
      } else {
        message = message || ERROR_MESSAGES.UNKNOWN;
      }

      // Create result object for error case
      const result = {
        message,
        status,
        error_action: resp.action,
        error_data: resp.error_data,
        rawResponse: resp,
      };
      return result;
    } else {
      // Unexpected status
      message = message || ERROR_MESSAGES.UNKNOWN;
      const result = {
        message,
        status,
        rawResponse: resp,
      };
      return result;
    }
  } catch (error) {
    // Handle exceptions
    const result = {
      message: error.message,
      status: STATUSES.ERROR,
      error_data: null,
      error_action: null,
      rawResponse: null,
      error: error,
    };
    return result;
  }
};

export {
  handleOAFResizeOperation,
  dockLeftCalculator,
  dockRightCalculator,
  maximizeCalculator,
  sidePanelCalculator,
  minimizeCalculator,
  closeCalculator,
  oafExecuteAction,
};