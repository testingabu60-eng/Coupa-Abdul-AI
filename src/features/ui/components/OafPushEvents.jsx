import { useState, useEffect } from "react";
import { useOaf } from "../../oaf/useOaf";
import { ACTION_STYLES } from "../styles/styles";

import { EVENT_TYPES } from "../constants/events";
import EXAMPLES from "../constants/examples";
import { ERROR_MESSAGES } from "../constants/messages";
// Component for subscribing to a oaf events using OAF
export const OafPushEvents = () => {
  const { oafSubscribeToEvents, oafAppEvents } = useOaf();
  const [oafEventText, setOafEventText] = useState("");
  const [oafEventSubscriptionResponse, setOafEventSubscriptionResponse] = useState(
    `${EXAMPLES.SUBSCRIBE_TO_OAF_EVENTS.DESCRIPTION}\nex. ${EXAMPLES.SUBSCRIBE_TO_OAF_EVENTS.SAMPLE}`
  );

  // Handle textarea input change
  const handleOnChange = (e) => {
    setOafEventText(e.target.value);
  };

  // Handle subscribe button click
  const handleAction = async () => {
    if (!oafEventText) {
      setOafEventSubscriptionResponse(ERROR_MESSAGES.EMPTY_SUBSCRIPTION_TEXT);
      return;
    }
    let subscriptionData;
    try {
      subscriptionData = JSON.parse(oafEventText);
    } catch (error) {
      setOafEventSubscriptionResponse(
        `${ERROR_MESSAGES.PARSING_ERROR}: ${error.message}`
      );
      return;
    }
    // Call OAF subscribe method with parsed JSON input
    const response = await oafSubscribeToEvents(subscriptionData);
    setOafEventSubscriptionResponse(response.message);
  };

  // Listen for 'oafEventTrigger' event from OAF and update response
  useEffect(() => {
    const handleEventsSubscriptionResponse = (event) => {
      setOafEventSubscriptionResponse(JSON.stringify(event, null, 2));
    };

    oafAppEvents.on(
      EVENT_TYPES.PUSH_OAF_EVENT_TRIGGER,
      handleEventsSubscriptionResponse
    );

    // Cleanup event listener on unmount
    return () => {
      oafAppEvents.off(
       EVENT_TYPES.PUSH_OAF_EVENT_TRIGGER,
        handleEventsSubscriptionResponse
      );
    };
  }, [oafAppEvents]);

  return (
    <div className={`${ACTION_STYLES.CONTAINER}`}>
      <h3 className={`${ACTION_STYLES.HEADER}`}>OAF Push Events Monitor</h3>

      {/* Input area for push events subscription data and subscribe button */}
      <div className={`${ACTION_STYLES.ROW}`}>
        <div className="flex-1">
          <textarea
            id="subscribe_to_oaf_event_input"
            className={`${ACTION_STYLES.TEXTAREA}`}
            placeholder="Events subscription request data"
            value={oafEventText}
            onChange={handleOnChange}
            rows={4}
          />
        </div>
        <div className="flex-none flex space-x-3">
          <button
            id="subscribe_to_oaf_event"
            className={`${ACTION_STYLES.CONTROL_BUTTON}`}
            onClick={handleAction}
          >
            Subscribe To Events
          </button>
        </div>
      </div>

      {/* Output area for oaf events subscription response */}
      <textarea
        id="oaf_event_subscribe_response"
        className={`${ACTION_STYLES.TEXTAREA}`}
        rows="6"
        placeholder="oaf event subscription response will be displayed here"
        value={oafEventSubscriptionResponse}
        readOnly
      />
    </div>
  );
};

export default OafPushEvents;
