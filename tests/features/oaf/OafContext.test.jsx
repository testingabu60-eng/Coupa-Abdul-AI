/**
 * Tests for OafContext.jsx - Context Provider and Reducer
 *
 * Tests the React Context setup, reducer logic, and provider functionality
 * for OAF state management.
 */

import React from 'react';
import { render, screen, renderHook, act  } from '@testing-library/react';
import { useContext } from 'react';
import { OafProvider } from '../../../src/features/oaf/OafContext.jsx';
import { OafContext } from '../../../src/features/oaf/OafContext.jsx';
import {
  LAYOUT_POSITIONS,
  LAYOUT_STATES,
  DISPATCH_ACTIONS,
} from '../../../src/features/oaf/oafConstants.js';

// Test constants for placeholder values
const NULL_PLACEHOLDER = 'null';
const TEST_MESSAGES = {
  TEST_RESPONSE: 'Test response',
  OPERATION_SUCCESSFUL: 'Operation successful',
  SOMETHING_WENT_WRONG: 'Something went wrong',
  TEST_ERROR: 'Test error',
  SUCCESS: 'Success',
  ALL_OPERATIONS_COMPLETE: 'All operations complete',
  TEST: 'Test',
};

// Test component to access context
const TestComponent = () => {
  const context = useContext(OafContext);

  if (!context) {
    return <div data-testid="no-context">No context</div>;
  }

  const { state, dispatch } = context;

  return (
    <div>
      <div data-testid="layout-position">{state.currLayoutPosition}</div>
      <div data-testid="layout-state">{state.currLayoutState || NULL_PLACEHOLDER}</div>
      <div data-testid="prev-layout-state">
        {state.prevLayoutState || NULL_PLACEHOLDER}
      </div>
      <div data-testid="response">{state.response?.message || NULL_PLACEHOLDER}</div>
      <div data-testid="error">{state.error || NULL_PLACEHOLDER}</div>
      <button
        data-testid="dispatch-button"
        onClick={() =>
          dispatch({
            type: DISPATCH_ACTIONS.SET_RESPONSE,
            payload: { message: TEST_MESSAGES.TEST_RESPONSE },
          })
        }
      >
        Dispatch Action
      </button>
    </div>
  );
};

// Helper function to render hook with context
const renderHookWithContext = () => {
  const wrapper = ({ children }) => <OafProvider>{children}</OafProvider>;

  return renderHook(
    () => {
      const context = useContext(OafContext);
      return context;
    },
    { wrapper }
  );
};

describe('OafContext', () => {
  describe('OafProvider', () => {
    test('provides initial state correctly', () => {
      render(
        <OafProvider>
          <TestComponent />
        </OafProvider>
      );

      expect(screen.getByTestId('layout-position')).toHaveTextContent(
        LAYOUT_POSITIONS.DOCKED_RIGHT
      );
      expect(screen.getByTestId('layout-state')).toHaveTextContent(LAYOUT_STATES.DEFAULT);
      expect(screen.getByTestId('prev-layout-state')).toHaveTextContent(NULL_PLACEHOLDER);
      expect(screen.getByTestId('response')).toHaveTextContent(NULL_PLACEHOLDER);
      expect(screen.getByTestId('error')).toHaveTextContent(NULL_PLACEHOLDER);
    });

    test('allows children to access dispatch function', () => {
      render(
        <OafProvider>
          <TestComponent />
        </OafProvider>
      );

      const button = screen.getByTestId('dispatch-button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('OAF Reducer', () => {
    test('SET_RESPONSE action updates response and clears error', () => {
      const { result } = renderHookWithContext();

      act(() => {
        result.current.dispatch({
          type: DISPATCH_ACTIONS.SET_RESPONSE,
          payload: { message: TEST_MESSAGES.OPERATION_SUCCESSFUL },
        });
      });

      expect(result.current.state.response).toEqual({
        message: TEST_MESSAGES.OPERATION_SUCCESSFUL,
      });
      expect(result.current.state.error).toBeNull();
    });

    test('SET_LAYOUT_POSITION action updates layout position', () => {
      const { result } = renderHookWithContext();

      act(() => {
        result.current.dispatch({
          type: DISPATCH_ACTIONS.SET_LAYOUT_POSITION,
          payload: LAYOUT_POSITIONS.DOCKED_LEFT,
        });
      });

      expect(result.current.state.currLayoutPosition).toBe(LAYOUT_POSITIONS.DOCKED_LEFT);
    });

    test('SET_ERROR action updates error state', () => {
      const { result } = renderHookWithContext();

      act(() => {
        result.current.dispatch({
          type: DISPATCH_ACTIONS.SET_ERROR,
          payload: TEST_MESSAGES.SOMETHING_WENT_WRONG,
        });
      });

      expect(result.current.state.error).toBe(TEST_MESSAGES.SOMETHING_WENT_WRONG);
    });

    test('CLEAR_ERROR action clears error state', () => {
      const { result } = renderHookWithContext();

      // Set an error first
      act(() => {
        result.current.dispatch({
          type: DISPATCH_ACTIONS.SET_ERROR,
          payload: TEST_MESSAGES.TEST_ERROR,
        });
      });

      expect(result.current.state.error).toBe(TEST_MESSAGES.TEST_ERROR);

      // Clear the error by setting a response (which clears error)
      act(() => {
        result.current.dispatch({
          type: DISPATCH_ACTIONS.SET_RESPONSE,
          payload: { message: TEST_MESSAGES.SUCCESS },
        });
      });

      expect(result.current.state.error).toBeNull();
    });

    test('SET_LAYOUT_STATE action updates current and previous layout states', () => {
      const { result } = renderHookWithContext();

      // Set initial layout state
      act(() => {
        result.current.dispatch({
          type: DISPATCH_ACTIONS.SET_LAYOUT_STATE,
          payload: LAYOUT_STATES.MAXIMIZED,
        });
      });

      expect(result.current.state.currLayoutState).toBe(LAYOUT_STATES.MAXIMIZED);
      expect(result.current.state.prevLayoutState).toBe(LAYOUT_STATES.DEFAULT);

      // Change layout state again
      act(() => {
        result.current.dispatch({
          type: DISPATCH_ACTIONS.SET_LAYOUT_STATE,
          payload: LAYOUT_STATES.MINIMIZED,
        });
      });

      expect(result.current.state.currLayoutState).toBe(LAYOUT_STATES.MINIMIZED);
      expect(result.current.state.prevLayoutState).toBe(LAYOUT_STATES.MAXIMIZED);
    });

    test('unknown action type returns unchanged state', () => {
      const { result } = renderHookWithContext();
      const initialState = { ...result.current.state };
      const UNKNOWN_ACTION = 'UNKNOWN_ACTION';

      act(() => {
        result.current.dispatch({
          type: UNKNOWN_ACTION,
          payload: 'test',
        });
      });

      expect(result.current.state).toEqual(initialState);
    });

    test('multiple actions work correctly in sequence', () => {
      const { result } = renderHookWithContext();

      // Set position, then state, then response
      act(() => {
        result.current.dispatch({
          type: DISPATCH_ACTIONS.SET_LAYOUT_POSITION,
          payload: LAYOUT_POSITIONS.DOCKED_LEFT,
        });
        result.current.dispatch({
          type: DISPATCH_ACTIONS.SET_LAYOUT_STATE,
          payload: LAYOUT_STATES.MAXIMIZED,
        });
        result.current.dispatch({
          type: DISPATCH_ACTIONS.SET_RESPONSE,
          payload: { message: TEST_MESSAGES.ALL_OPERATIONS_COMPLETE },
        });
      });

      expect(result.current.state.currLayoutPosition).toBe(LAYOUT_POSITIONS.DOCKED_LEFT);
      expect(result.current.state.currLayoutState).toBe(LAYOUT_STATES.MAXIMIZED);
      expect(result.current.state.response).toEqual({
        message: TEST_MESSAGES.ALL_OPERATIONS_COMPLETE,
      });
      expect(result.current.state.error).toBeNull();
    });
  });

  describe('Context Integration', () => {
    test('context value structure is correct', () => {
      const TestComponent = () => {
        const context = useContext(OafContext);
        return (
          <div data-testid="context-data">
            {JSON.stringify(context?.state || {})}
          </div>
        );
      };

      render(
        <OafProvider>
          <TestComponent />
        </OafProvider>
      );

      const contextElement = screen.getByTestId('context-data');
      const contextData = JSON.parse(contextElement.textContent);

      expect(contextData).toHaveProperty('currLayoutPosition');
      expect(contextData).toHaveProperty('currLayoutState');
      expect(contextData).toHaveProperty('prevLayoutState');
      expect(contextData).toHaveProperty('response');
      expect(contextData).toHaveProperty('error');
    });

    test('context is null when used outside provider', () => {
      const TestComponent = () => {
        const context = useContext(OafContext);
        return (
          <div data-testid="context-result">
            {context ? 'has-context' : 'no-context'}
          </div>
        );
      };

      render(<TestComponent />);

      const result = screen.getByTestId('context-result');
      expect(result.textContent).toBe('no-context');
    });
  });

  describe('State Immutability', () => {
    test('reducer returns new state object on each action', () => {
      const { result } = renderHookWithContext();

      const initialState = result.current.state;

      act(() => {
        result.current.dispatch({
          type: DISPATCH_ACTIONS.SET_RESPONSE,
          payload: { message: TEST_MESSAGES.TEST },
        });
      });

      const newState = result.current.state;

      // State reference should be different (immutable update)
      expect(newState).not.toBe(initialState);
      // But unaffected properties should maintain their values
      expect(newState.currLayoutPosition).toBe(initialState.currLayoutPosition);
    });
  });

  describe('Error Handling', () => {
    test('handles malformed action payloads gracefully', () => {
      const { result } = renderHookWithContext();

      // Should not throw with undefined payload
      expect(() => {
        act(() => {
          result.current.dispatch({
            type: DISPATCH_ACTIONS.SET_RESPONSE,
            payload: undefined,
          });
        });
      }).not.toThrow();

      expect(result.current.state.response).toBeUndefined();
    });
  });
});
