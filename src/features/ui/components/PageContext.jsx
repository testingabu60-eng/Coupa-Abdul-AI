import { useState } from "react";
import { useOaf } from "../../oaf/useOaf";
import { STYLES, LABELS } from "../constants";

const { ACTION_STYLES } = STYLES;
const { PAGE_CONTEXT_LABELS } = LABELS;

// Component for managing page context using OAF
export const PageContext = () => {
  const { oafGetPageContext } = useOaf();
  const [contextResponse, setContextResponse] = useState("");

  // Handle get context button click
  const handleAction = async () => {
    // Call OAF page context method
    const response = await oafGetPageContext();
    setContextResponse(JSON.stringify(response.data, null, 2));
  };

  return (
    <div className={`${ACTION_STYLES.CONTAINER}`}>
      <h3 className={`${ACTION_STYLES.HEADER}`}>{PAGE_CONTEXT_LABELS.HEADER}</h3>

      {/* Input area for context data and get context button */}
      <div className={`${ACTION_STYLES.ROW}`}>
        <div className="flex-none flex space-x-3">
          <button
            id={PAGE_CONTEXT_LABELS.BUTTON_ID}
            className={`${ACTION_STYLES.CONTROL_BUTTON}`}
            onClick={handleAction}
          >
            {PAGE_CONTEXT_LABELS.BUTTON_TEXT}
          </button>
        </div>
      </div>

      {/* Output area for context response */}
      <textarea
        id={PAGE_CONTEXT_LABELS.RESPONSE_ID}
        className={`${ACTION_STYLES.TEXTAREA}`}
        rows="6"
        placeholder={PAGE_CONTEXT_LABELS.RESPONSE_PLACEHOLDER}
        value={contextResponse}
        readOnly
      />
    </div>
  );
};

export default PageContext;
