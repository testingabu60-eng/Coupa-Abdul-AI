import { useState, useEffect } from "react";
import { useOaf } from "../../oaf/useOaf";

import { EXAMPLES, STYLES, EVENT_TYPES, STATUSES, MESSAGES, LABELS } from "../constants";

const { ACTION_STYLES } = STYLES;
const { GET_ELEMENT_META_LABELS } = LABELS;
const { ERROR_MESSAGES } = MESSAGES;

// Component for getting metadata from forms or elements using OAF
export const GetElementMeta = () => {
  const { oafGetElementMeta, oafAppEvents } = useOaf();
  const [metadataText, setMetadataText] = useState("");
  const [metadataResponse, setMetadataResponse] = useState(
    `${EXAMPLES.GET_ELEMENT_META_EXAMPLES.DESCRIPTION}${EXAMPLES.GET_ELEMENT_META_EXAMPLES.SAMPLE}`
  );

  // Handle textarea input change
  const handleOnChange = (e) => {
    setMetadataText(e.target.value);
  };

  // Handle get metadata button click
  const handleAction = async () => {
    if (!metadataText) {
      setMetadataResponse(ERROR_MESSAGES.EMPTY_METADATA_TEXT);
      return;
    }
    let formStructure;
    try {
      formStructure = JSON.parse(metadataText);
    } catch (error) {
      setMetadataResponse(
        `${ERROR_MESSAGES.PARSING_ERROR}: ${error.message}`
      );
      return;
    }
    // Call OAF GetElementMeta method with parsed JSON input
    const response = await oafGetElementMeta(formStructure);
    if (response.status === STATUSES.ERROR) {
      setMetadataResponse(JSON.stringify(response, null, 2));
    } else {
      // Display only the rawResponse to avoid duplication
      // (rawResponse contains the original host response without wrapper fields)
      setMetadataResponse(JSON.stringify(response.rawResponse, null, 2));
    }
  };

  // Listen for 'GetElementMetaResponse' event from OAF and update response
  useEffect(() => {
    const handleGetElementMetaResponse = (event) => {
      setMetadataResponse(JSON.stringify(event, null, 2));
    };

    oafAppEvents.on(
      EVENT_TYPES.GET_ELEMENT_META_RESPONSE,
      handleGetElementMetaResponse
    );

    // Cleanup event listener on unmount
    return () => {
      oafAppEvents.off(
        EVENT_TYPES.GET_ELEMENT_META_RESPONSE,
        handleGetElementMetaResponse
      );
    };
  }, [oafAppEvents]);

  return (
    <div className={`${ACTION_STYLES.CONTAINER}`}>
      <h3 className={`${ACTION_STYLES.HEADER}`}>{GET_ELEMENT_META_LABELS.HEADER}</h3>

      {/* Input area for metadata request and get button */}
      <div className={`${ACTION_STYLES.ROW}`}>
        <div className="flex-1">
          <textarea
            id={GET_ELEMENT_META_LABELS.INPUT_ID}
            className={`${ACTION_STYLES.TEXTAREA}`}
            placeholder={GET_ELEMENT_META_LABELS.INPUT_PLACEHOLDER}
            value={metadataText}
            onChange={handleOnChange}
            rows={4}
          />
        </div>
        <div className="flex-none flex space-x-3">
          <button
            id={GET_ELEMENT_META_LABELS.BUTTON_ID}
            className={`${ACTION_STYLES.CONTROL_BUTTON}`}
            onClick={handleAction}
          >
            {GET_ELEMENT_META_LABELS.BUTTON_TEXT}
          </button>
        </div>
      </div>

      {/* Output area for metadata response */}
      <textarea
        id={GET_ELEMENT_META_LABELS.RESPONSE_ID}
        className={`${ACTION_STYLES.TEXTAREA}`}
        rows="10"
        placeholder={GET_ELEMENT_META_LABELS.RESPONSE_PLACEHOLDER}
        value={metadataResponse}
        readOnly
      />
    </div>
  );
};

export default GetElementMeta;
