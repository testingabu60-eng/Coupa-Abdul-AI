import {
  dockLeftCalculator,
  dockRightCalculator,
  maximizeCalculator,
  sidePanelCalculator,
  minimizeCalculator,
  closeCalculator,
  oafExecuteAction,
  handleOAFResizeOperation,
} from '../../../src/features/oaf/oafUtils.js';
import {
  LAYOUT_POSITIONS,
  LAYOUT_DIMENSIONS,
  LAYOUT_STATES,
  STATUSES,
  DISPATCH_ACTIONS,
  ERROR_MESSAGES,
} from '../../../src/features/oaf/oafConstants.js';

// Mock the oafClient module
jest.mock('../../../src/features/oaf/oafClient.js', () => ({
  moveAndResize: jest.fn(),
  getPageContext: jest.fn(),
}));

import { moveAndResize, getPageContext } from '../../../src/features/oaf/oafClient.js';

// Test fixture constants for viewport and window dimensions
const TEST_VIEWPORT = {
  FULL_HD: { viewPortHeight: 1080, viewPortWidth: 1920 },
  STANDARD: { viewPortHeight: 1000, viewPortWidth: 2000 },
  SMALL: { viewPortHeight: 800, viewPortWidth: 1200 },
};

const TEST_WINDOW = {
  DEFAULT: { windowHeight: 500, windowWidth: 400 },
  MEDIUM: { windowHeight: 500, windowWidth: 300 },
  LARGE: { windowHeight: 800, windowWidth: 600 },
};

// Expected position constant
const LEFT_EDGE_POSITION = 0;
const CLOSED_DIMENSION = 0;

describe('oafUtils', () => {
  describe('dockLeftCalculator', () => {
    test('calculates correct dimensions for docking left', () => {
      const viewport = { viewPortHeight: TEST_VIEWPORT.FULL_HD.viewPortHeight };
      const windowDims = TEST_WINDOW.DEFAULT;

      const result = dockLeftCalculator(viewport, windowDims);

      //preserves window dimensions when docking left
      expect(result.height).toBe(windowDims.windowHeight);
      expect(result.width).toBe(windowDims.windowWidth);
      expect(result.left).toBe(LEFT_EDGE_POSITION); //left edge of viewport 0
      expect(result.top).toBe(Math.round(viewport.viewPortHeight - windowDims.windowHeight));
    });
  });

  describe('dockRightCalculator', () => {
    test('calculates correct dimensions for docking right', () => {
      const viewport = TEST_VIEWPORT.FULL_HD;
      const windowDims = TEST_WINDOW.DEFAULT;

      const result = dockRightCalculator(viewport, windowDims);

      expect(result.height).toBe(windowDims.windowHeight);
      expect(result.width).toBe(windowDims.windowWidth);
      expect(result.left).toBe(Math.round(viewport.viewPortWidth - windowDims.windowWidth));
      expect(result.top).toBe(Math.round(viewport.viewPortHeight - windowDims.windowHeight));
    });
  });

  describe('maximizeCalculator', () => {
    test('calculates correct dimensions for maximized layout', () => {
      const viewport = TEST_VIEWPORT.STANDARD;

      const result = maximizeCalculator(viewport, {}, LAYOUT_POSITIONS.DOCKED_RIGHT);

      expect(result.height).toBe(Math.round(viewport.viewPortHeight * LAYOUT_DIMENSIONS.MAXIMIZE_HEIGHT_RATIO));
      expect(result.width).toBe(Math.round(viewport.viewPortWidth * LAYOUT_DIMENSIONS.MAXIMIZE_WIDTH_RATIO));
    });

    test('aligns left when previously docked left', () => {
      const viewport = TEST_VIEWPORT.STANDARD;

      const result = maximizeCalculator(viewport, {}, LAYOUT_POSITIONS.DOCKED_LEFT);

      expect(result.left).toBe(LEFT_EDGE_POSITION);
    });

    test('aligns right when previously docked right', () => {
      const viewport = TEST_VIEWPORT.STANDARD;
      const expectedWidth = Math.round(viewport.viewPortWidth * LAYOUT_DIMENSIONS.MAXIMIZE_WIDTH_RATIO);

      const result = maximizeCalculator(viewport, {}, LAYOUT_POSITIONS.DOCKED_RIGHT);

      expect(result.left).toBe(Math.round(viewport.viewPortWidth - expectedWidth));
    });
  });

  describe('sidePanelCalculator', () => {
    test('calculates correct dimensions for side panel', () => {
      const viewport = TEST_VIEWPORT.STANDARD;

      const result = sidePanelCalculator(viewport, {}, LAYOUT_POSITIONS.DOCKED_RIGHT);

      expect(result.height).toBe(Math.round(viewport.viewPortHeight * LAYOUT_DIMENSIONS.SIDE_PANEL_HEIGHT_RATIO));
      expect(result.width).toBe(Math.round(viewport.viewPortWidth * LAYOUT_DIMENSIONS.SIDE_PANEL_WIDTH_RATIO));
    });

    test('aligns left when previously docked left', () => {
      const viewport = TEST_VIEWPORT.STANDARD;

      const result = sidePanelCalculator(viewport, {}, LAYOUT_POSITIONS.DOCKED_LEFT);

      expect(result.left).toBe(LEFT_EDGE_POSITION);
    });

    test('aligns right when previously docked right', () => {
      const viewport = TEST_VIEWPORT.STANDARD;
      const expectedWidth = Math.round(viewport.viewPortWidth * LAYOUT_DIMENSIONS.SIDE_PANEL_WIDTH_RATIO);

      const result = sidePanelCalculator(viewport, {}, LAYOUT_POSITIONS.DOCKED_RIGHT);

      expect(result.left).toBe(Math.round(viewport.viewPortWidth - expectedWidth));
    });
  });

  describe('minimizeCalculator', () => {
    test('calculates fixed minimized dimensions', () => {
      const viewport = TEST_VIEWPORT.STANDARD;

      const result = minimizeCalculator(viewport);

      expect(result.height).toBe(LAYOUT_DIMENSIONS.MINIMIZE_SIZE);
      expect(result.width).toBe(LAYOUT_DIMENSIONS.MINIMIZE_SIZE);
      expect(result.top).toBe(Math.round(viewport.viewPortHeight - LAYOUT_DIMENSIONS.MINIMIZE_SIZE));
      expect(result.left).toBe(Math.round(viewport.viewPortWidth - LAYOUT_DIMENSIONS.MINIMIZE_SIZE));
    });
  });

  describe('closeCalculator', () => {
    test('calculates zero dimensions for closed state', () => {
      const viewport = TEST_VIEWPORT.STANDARD;

      const result = closeCalculator(viewport);

      expect(result.height).toBe(CLOSED_DIMENSION);
      expect(result.width).toBe(CLOSED_DIMENSION);
    });
  });

  describe('oafExecuteAction', () => {
    const TEST_MESSAGES = {
      OPERATION_SUCCESSFUL: 'Operation successful',
      OPERATION_FAILED: 'Operation failed',
      INVALID_INPUT: 'Invalid input',
      NETWORK_ERROR: 'Network error',
      MULTIPLE_ERRORS: 'Multiple errors',
      UNKNOWN_STATUS: 'Unknown status',
      SUCCESS: 'Success',
      ERROR_1: 'Error 1',
      ERROR_2: 'Error 2',
    };

    test('returns success result with data when action succeeds', async () => {
      const mockData = { field: 'value' };
      const mockAction = jest.fn().mockResolvedValue({
        status: STATUSES.SUCCESS,
        message: TEST_MESSAGES.OPERATION_SUCCESSFUL,
        data: mockData,
      });

      const result = await oafExecuteAction(mockAction);

      expect(result.status).toBe(STATUSES.SUCCESS);
      expect(result.message).toBe(TEST_MESSAGES.OPERATION_SUCCESSFUL);
      expect(result.data).toEqual(mockData);
      expect(result.rawResponse).toBeDefined();
    });

    test('returns error result when action fails', async () => {
      const mockAction = jest.fn().mockResolvedValue({
        status: STATUSES.ERROR,
        message: TEST_MESSAGES.OPERATION_FAILED,
        error_data: [{ error_message: TEST_MESSAGES.INVALID_INPUT }],
        action: 'testAction',
      });

      const result = await oafExecuteAction(mockAction);

      expect(result.status).toBe(STATUSES.ERROR);
      // oafUtils formats error_data as "${error_key || STATUSES.ERROR} : ${error_attribute || error_message}"
      expect(result.message).toBe(`${STATUSES.ERROR} : ${TEST_MESSAGES.INVALID_INPUT}`);
      expect(result.error_data).toBeDefined();
    });

    test('handles exception during action execution', async () => {
      const mockAction = jest.fn().mockRejectedValue(new Error(TEST_MESSAGES.NETWORK_ERROR));

      const result = await oafExecuteAction(mockAction);

      expect(result.status).toBe(STATUSES.ERROR);
      expect(result.message).toBe(TEST_MESSAGES.NETWORK_ERROR);
      expect(result.error).toBeDefined();
    });

    test('aggregates multiple error messages', async () => {
      const mockAction = jest.fn().mockResolvedValue({
        status: STATUSES.ERROR,
        message: TEST_MESSAGES.MULTIPLE_ERRORS,
        error_data: [
          { error_message: TEST_MESSAGES.ERROR_1 },
          { error_message: TEST_MESSAGES.ERROR_2 },
        ],
      });

      const result = await oafExecuteAction(mockAction);

      // oafUtils formats each item as "${error_key || STATUSES.ERROR} : ${error_attribute || error_message}"
      expect(result.message).toBe(
        `${STATUSES.ERROR} : ${TEST_MESSAGES.ERROR_1}\n${STATUSES.ERROR} : ${TEST_MESSAGES.ERROR_2}`
      );
    });

    test('handles unknown status', async () => {
      const UNKNOWN_STATUS = 'unknown';
      const mockAction = jest.fn().mockResolvedValue({
        status: UNKNOWN_STATUS,
        message: TEST_MESSAGES.UNKNOWN_STATUS,
      });

      const result = await oafExecuteAction(mockAction);

      expect(result.status).toBe(UNKNOWN_STATUS);
      expect(result.rawResponse).toBeDefined();
    });

    test('returns rawResponse for all cases', async () => {
      const mockResponse = {
        status: STATUSES.SUCCESS,
        message: TEST_MESSAGES.SUCCESS,
        data: { test: 'data' },
      };
      const mockAction = jest.fn().mockResolvedValue(mockResponse);

      const result = await oafExecuteAction(mockAction);

      expect(result.rawResponse).toEqual(mockResponse);
    });
  });

  describe('handleOAFResizeOperation', () => {
    const mockDispatch = jest.fn();
    const RESIZE_ERROR_MESSAGE = 'Resize failed';
    const NETWORK_ERROR_MESSAGE = 'Network error';

    beforeEach(() => {
      mockDispatch.mockReset();
      getPageContext.mockReset();
      moveAndResize.mockReset();

      // Mock window dimensions using test fixture values
      Object.defineProperty(window, 'innerHeight', { value: TEST_WINDOW.DEFAULT.windowHeight, writable: true });
      Object.defineProperty(window, 'innerWidth', { value: TEST_WINDOW.DEFAULT.windowWidth, writable: true });
    });

    test('dispatches error when page context fails', async () => {
      getPageContext.mockResolvedValue(null);

      await handleOAFResizeOperation(
        mockDispatch,
        dockLeftCalculator,
        LAYOUT_POSITIONS.DOCKED_LEFT,
        LAYOUT_STATES.MAXIMIZED
      );

      expect(mockDispatch).toHaveBeenCalledWith({
        type: DISPATCH_ACTIONS.SET_ERROR,
        payload: ERROR_MESSAGES.PAGE_CONTEXT,
      });
    });

    test('dispatches error when page context status is not success', async () => {
      getPageContext.mockResolvedValue({ status: STATUSES.ERROR });

      await handleOAFResizeOperation(
        mockDispatch,
        dockLeftCalculator,
        LAYOUT_POSITIONS.DOCKED_LEFT,
        LAYOUT_STATES.MAXIMIZED
      );

      expect(mockDispatch).toHaveBeenCalledWith({
        type: DISPATCH_ACTIONS.SET_ERROR,
        payload: ERROR_MESSAGES.PAGE_CONTEXT,
      });
    });

    test('calls moveAndResize with calculated dimensions on success', async () => {
      getPageContext.mockResolvedValue({
        status: STATUSES.SUCCESS,
        data: {
          pageDetails: {
            viewPortHeight: TEST_VIEWPORT.FULL_HD.viewPortHeight,
            viewPortWidth: TEST_VIEWPORT.FULL_HD.viewPortWidth,
          },
        },
      });
      moveAndResize.mockResolvedValue({ status: STATUSES.SUCCESS });

      await handleOAFResizeOperation(
        mockDispatch,
        dockLeftCalculator,
        LAYOUT_POSITIONS.DOCKED_LEFT,
        LAYOUT_STATES.MAXIMIZED
      );

      expect(moveAndResize).toHaveBeenCalled();
    });

    test('dispatches success response and layout updates on successful resize', async () => {
      getPageContext.mockResolvedValue({
        status: STATUSES.SUCCESS,
        data: {
          pageDetails: {
            viewPortHeight: TEST_VIEWPORT.FULL_HD.viewPortHeight,
            viewPortWidth: TEST_VIEWPORT.FULL_HD.viewPortWidth,
          },
        },
      });
      moveAndResize.mockResolvedValue({ status: STATUSES.SUCCESS });

      await handleOAFResizeOperation(
        mockDispatch,
        dockLeftCalculator,
        LAYOUT_POSITIONS.DOCKED_LEFT,
        LAYOUT_STATES.MAXIMIZED
      );

      // Check that SET_RESPONSE was dispatched
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: DISPATCH_ACTIONS.SET_RESPONSE,
        })
      );

      // Check that SET_LAYOUT_POSITION was dispatched
      expect(mockDispatch).toHaveBeenCalledWith({
        type: DISPATCH_ACTIONS.SET_LAYOUT_POSITION,
        payload: LAYOUT_POSITIONS.DOCKED_LEFT,
      });

      // Check that SET_LAYOUT_STATE was dispatched
      expect(mockDispatch).toHaveBeenCalledWith({
        type: DISPATCH_ACTIONS.SET_LAYOUT_STATE,
        payload: LAYOUT_STATES.MAXIMIZED,
      });
    });

    test('dispatches error when moveAndResize fails', async () => {
      getPageContext.mockResolvedValue({
        status: STATUSES.SUCCESS,
        data: {
          pageDetails: {
            viewPortHeight: TEST_VIEWPORT.FULL_HD.viewPortHeight,
            viewPortWidth: TEST_VIEWPORT.FULL_HD.viewPortWidth,
          },
        },
      });
      moveAndResize.mockResolvedValue({
        status: STATUSES.ERROR,
        message: RESIZE_ERROR_MESSAGE,
      });

      await handleOAFResizeOperation(
        mockDispatch,
        dockLeftCalculator,
        LAYOUT_POSITIONS.DOCKED_LEFT,
        LAYOUT_STATES.MAXIMIZED
      );

      expect(mockDispatch).toHaveBeenCalledWith({
        type: DISPATCH_ACTIONS.SET_ERROR,
        payload: RESIZE_ERROR_MESSAGE,
      });
    });

    test('dispatches error when exception is thrown', async () => {
      getPageContext.mockRejectedValue(new Error(NETWORK_ERROR_MESSAGE));

      await handleOAFResizeOperation(
        mockDispatch,
        dockLeftCalculator,
        LAYOUT_POSITIONS.DOCKED_LEFT,
        LAYOUT_STATES.MAXIMIZED
      );

      expect(mockDispatch).toHaveBeenCalledWith({
        type: DISPATCH_ACTIONS.SET_ERROR,
        payload: NETWORK_ERROR_MESSAGE,
      });
    });
  });
});
