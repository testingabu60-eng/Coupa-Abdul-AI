// oafClient.js
// This module provides wrapper functions for interacting with the Open Assistant Framework (OAF) API.
// It initializes the OAF instance and exposes utility functions for window management, navigation, form operations, and event handling.

import { initOAFInstance } from "@coupa/open-assistant-framework-client";
import config from "./oafConfig";

// Initialize the OAF application instance using configuration.
export const oafApp = initOAFInstance(config);

/**
 * Sets the size of the OAF application window.
 * @param {number} height - Desired window height in pixels.
 * @param {number} width - Desired window width in pixels.
 * @returns {Promise<any>} Resolves when the size is set.
 */
export const setSize = async (height, width) => {
  return oafApp.setSize({
    height,
    width,
  });
};

/**
 * Moves the OAF application window to a specific location.
 * @param {number} top - Top position in pixels.
 * @param {number} left - Left position in pixels.
 * @param {boolean} resetToDock - Whether to reset to docked position.
 * @returns {Promise<any>} Resolves when the window is moved.
 */
export const moveAppToLocation = async (top, left, resetToDock) => {
  return oafApp.moveToLocation({
    top,
    left,
    resetToDock,
  });
};

/**
 * Retrieves the current page context using OAF.
 * @returns {Promise<any>} Resolves with page context data.
 */
export const getPageContext = async () => oafApp.getPageContext();

/**
 * Moves and resizes the OAF application window.
 * @param {number} top - Top position in pixels.
 * @param {number} left - Left position in pixels.
 * @param {number} height - Window height in pixels.
 * @param {number} width - Window width in pixels.
 * @param {boolean} resetToDock - Whether to reset to docked position.
 * @returns {Promise<any>} Resolves when operation completes.
 */
export const moveAndResize = async (top, left, height, width, resetToDock) => {
  return oafApp.moveAndResize({
    top,
    left,
    height,
    width,
    resetToDock,
  });
};

/**
 * Navigates the user to a specific path using OAF.
 * @param {string} path - The navigation path.
 * @returns {Promise<any>} Resolves when navigation completes.
 */
export const navigatePath = async (path) => oafApp.navigateToPath(path);

/**
 * Opens an EasyForm using the OAF application.
 * @param {string} formId - The ID of the form to open.
 * @returns {Promise<any>} Resolves when the form is opened.
 */
export const openEasyForm = async (formId) =>
  oafApp.enterprise.openEasyForm(formId);

/**
 * Reads form data using the OAF application.
 * @param {object} readMetaData - Metadata for the form to read.
 * @returns {Promise<any>} Resolves with the form data.
 */
export const readForm = async (readMetaData) =>
  oafApp.readForm({ formMetaData: readMetaData });

/**
 * Writes data to a form using the OAF application.
 * @param {object} writeData - Data to write to the form.
 * @returns {Promise<any>} Resolves when the data is written.
 */
export const writeForm = async (writeData) => oafApp.writeForm(writeData);

/**
 * Subscribes to data location changes using the OAF application.
 * @param {object} subscriptionData - Subscription parameters.
 * @returns {Promise<any>} Resolves when subscription is active.
 */
export const subscribeToLocation = async (subscriptionData) =>
  oafApp.listenToDataLocation(subscriptionData);

/**
 * Subscribes to oaf events using the OAF application.
 * @param {object} eventsSubscriptionData - Subscription parameters.
 * @returns {Promise<any>} Resolves when subscription is active.
 */
export const subscribeToEvents = async (eventsSubscriptionData) =>
  oafApp.listenToOafEvents(eventsSubscriptionData);

/**
 * Returns the OAF application's event emitter for subscribing to events.
 * @returns {object} OAF event emitter.
 */
export const oafEvents = () => oafApp.events;

/**
 * Retrieves metadata from a form or HTML element using OAF.
 * @param {object} formStructure - The form structure containing formLocation, formId, and optional inputFields.
 * @returns {Promise<any>} Resolves with the metadata.
 */
export const getElementMeta = async (formStructure) =>
  oafApp.getElementMeta(formStructure);

/**
 * Executes a workflow process by its ID.
 * @param {number} processId - The ID of the workflow process to execute.
 * @returns {Promise<any>} Resolves when the workflow process execution completes.
 */
export const launchUiButtonClickProcess = async (processId) =>
  oafApp.enterprise.launchUiButtonClickProcess(processId);