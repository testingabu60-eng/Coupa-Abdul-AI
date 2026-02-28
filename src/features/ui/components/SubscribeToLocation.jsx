import { useState, useEffect } from "react";
import { useOaf } from "../../oaf/useOaf";

import { EXAMPLES, STYLES, EVENT_TYPES, STATUSES, MESSAGES, LABELS } from "../constants";

const { ACTION_STYLES } = STYLES;
const { SUBSCRIBE_TO_LOCATION_LABELS } = LABELS;
const { ERROR_MESSAGES } = MESSAGES;

// Component for subscribing to a location using OAF
export const SubscribeToLocation = () => {
  const { oafSubscribeToLocation, oafAppEvents } = useOaf();
  const [subscriptionText, setSubscriptionText] = useState("");
  const [subscriptionResponse, setSubscriptionResponse] = useState(
    `${EXAMPLES.SUBSCRIBE_TO_LOCATION_EXAMPLES.DESCRIPTION}${EXAMPLES.SUBSCRIBE_TO_LOCATION_EXAMPLES.SAMPLE}`
  );

  // Handle textarea input change
  const handleOnChange = (e) => {
    setSubscriptionText(e.target.value);
  };

  // Handle subscribe button click
  const handleAction = async () => {
    if (!subscriptionText) {
      setSubscriptionResponse(ERROR_MESSAGES.EMPTY_SUBSCRIPTION_TEXT);
      return;
    }
    let subscriptionData;
    try {
      subscriptionData = JSON.parse(subscriptionText);
    } catch (error) {
      setSubscriptionResponse(
        `${ERROR_MESSAGES.PARSING_ERROR}: ${error.message}`
      );
      return;
    }
    // Call OAF subscribe method with parsed JSON input
    const response = await oafSubscribeToLocation(subscriptionData);
    if (response.status === STATUSES.ERROR) {
      setSubscriptionResponse(ERROR_MESSAGES.INVALID_LOCATION_TO_SUBSCRIBE);
    } else {
      setSubscriptionResponse(response.message);
    }
  };

  // Listen for 'subscribedAttributeResponse' event from OAF and update response
  useEffect(() => {
    const handleSubscribedAttributeResponse = (event) => {
      setSubscriptionResponse(JSON.stringify(event, null, 2));
    };

    oafAppEvents.on(
      EVENT_TYPES.SUBSCRIBED_ATTRIBUTE_RESPONSE,
      handleSubscribedAttributeResponse
    );

    oafAppEvents.on(
      EVENT_TYPES.SUBSCRIBED_LOCATION_RESPONSE,
      handleSubscribedAttributeResponse
    );

    oafAppEvents.on(
      EVENT_TYPES.SUBSCRIBED_LOCATION_EXIT,
      handleSubscribedAttributeResponse
    );

    // Cleanup event listener on unmount
    return () => {
      oafAppEvents.off(
        EVENT_TYPES.SUBSCRIBED_ATTRIBUTE_RESPONSE,
        handleSubscribedAttributeResponse
      );

      oafAppEvents.off(
        EVENT_TYPES.SUBSCRIBED_LOCATION_RESPONSE,
        handleSubscribedAttributeResponse
      );

      oafAppEvents.off(
        EVENT_TYPES.SUBSCRIBED_LOCATION_EXIT,
        handleSubscribedAttributeResponse
      );
    };
  }, [oafAppEvents]);

  return (
    <div className={`${ACTION_STYLES.CONTAINER}`}>
      <h3 className={`${ACTION_STYLES.HEADER}`}>{SUBSCRIBE_TO_LOCATION_LABELS.HEADER}</h3>

      {/* Input area for subscription data and subscribe button */}
      <div className={`${ACTION_STYLES.ROW}`}>
        <div className="flex-1">
          <textarea
            id={SUBSCRIBE_TO_LOCATION_LABELS.INPUT_ID}
            className={`${ACTION_STYLES.TEXTAREA}`}
            placeholder={SUBSCRIBE_TO_LOCATION_LABELS.INPUT_PLACEHOLDER}
            value={subscriptionText}
            onChange={handleOnChange}
            rows={4}
          />
        </div>
        <div className="flex-none flex space-x-3">
          <button
            id={SUBSCRIBE_TO_LOCATION_LABELS.BUTTON_ID}
            className={`${ACTION_STYLES.CONTROL_BUTTON}`}
            onClick={handleAction}
          >
            {SUBSCRIBE_TO_LOCATION_LABELS.BUTTON_TEXT}
          </button>
        </div>
      </div>

      {/* Output area for subscription response */}
      <textarea
        id={SUBSCRIBE_TO_LOCATION_LABELS.RESPONSE_ID}
        className={`${ACTION_STYLES.TEXTAREA}`}
        rows="6"
        placeholder={SUBSCRIBE_TO_LOCATION_LABELS.RESPONSE_PLACEHOLDER}
        value={subscriptionResponse}
        readOnly
      />
    </div>
  );
};

export default SubscribeToLocation;
