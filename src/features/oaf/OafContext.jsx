import { createContext, useReducer, useMemo } from "react";
import {
  DISPATCH_ACTIONS,
  LAYOUT_POSITIONS,
  LAYOUT_STATES,
} from "./oafConstants";

// Create the context
export const OafContext = createContext();

// Initial state for OAF context
const oafState = {
  currLayoutPosition: LAYOUT_POSITIONS.DOCKED_RIGHT,
  currLayoutState: LAYOUT_STATES.DEFAULT,
  prevLayoutState: null,
  response: null,
  error: null,
};

// OAF reducer for state management
// Handles actions to update OAF context state
const oafReducer = (state, action) => {
  switch (action.type) {
    case DISPATCH_ACTIONS.SET_RESPONSE:
      return {
        ...state,
        response: action.payload,
        error: null,
      };
    case DISPATCH_ACTIONS.SET_LAYOUT_POSITION:
      return {
        ...state,
        currLayoutPosition: action.payload,
      };
    case DISPATCH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        response: null,
      };
    case DISPATCH_ACTIONS.SET_LAYOUT_STATE:
      return {
        ...state,
        prevLayoutState: state.currLayoutState,
        currLayoutState: action.payload,
      };
    default:
      // Returns current state for unknown actions
      return state;
  }
};

/**
 * OAF Context Provider
 * Provides OAF state and dispatch function to the entire app
 * Wrap your app with this provider to access OAF context
 */
export const OafProvider = ({ children }) => {
  // useReducer for OAF state management
  const [state, dispatch] = useReducer(oafReducer, oafState);

  // Memoized context value to prevent unnecessary re-renders
  const value = useMemo(() => ({ state, dispatch }), [state]);

  // Provide context to children components
  return <OafContext.Provider value={value}>{children}</OafContext.Provider>;
};
