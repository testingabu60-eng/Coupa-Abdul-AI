import { useState } from "react";
import { useOaf } from "../../oaf/useOaf";
import { EXAMPLES, MESSAGES, STYLES, LABELS } from "../constants";

const { ACTION_STYLES } = STYLES;
const { NAVIGATE_TO_PATH_LABELS } = LABELS;
const { ERROR_MESSAGES } = MESSAGES;

const NavigatePath = () => {
  const { oafNavigatePath } = useOaf();

  const [navigatePath, setNavigatePath] = useState("");
  const [navigateResponse, setNavigateResponse] = useState( 
    `${EXAMPLES.NAVIGATE_PATH_EXAMPLES.DESCRIPTION}\n${EXAMPLES.NAVIGATE_PATH_EXAMPLES.PATHS.map((path) => `• ${path}`).join("\n")}`
  );

  // Update the path state when input changes
  const handleOnChange = (e) => {
    setNavigatePath(e.target.value);
  };

  // Trigger navigation and update response state
  const handleAction = async () => {
    if (!navigatePath) {
      setNavigateResponse(ERROR_MESSAGES.INVALID_NAVIGATE_PATH);
      return;
    }
    const response = await oafNavigatePath(navigatePath);
    setNavigateResponse(response.message);
  };

  return (
    <div>
      {/* Container for navigation UI */}
      <div className={`${ACTION_STYLES.CONTAINER}`}>
        <h3 className={`${ACTION_STYLES.HEADER}`}>{NAVIGATE_TO_PATH_LABELS.HEADER}</h3>
        {/* Input and button row */}
        <div className={`${ACTION_STYLES.ROW}`}>
          {/* Path input */}
          <div className="flex-1">
            <input
              id={NAVIGATE_TO_PATH_LABELS.INPUT_ID}
              type="text"
              className={`${ACTION_STYLES.INPUT}`}
              placeholder={NAVIGATE_TO_PATH_LABELS.INPUT_PLACEHOLDER}
              value={navigatePath}
              onChange={handleOnChange}
            />
          </div>
          {/* Navigate button */}
          <div className="flex-none">
            <button
              id={NAVIGATE_TO_PATH_LABELS.BUTTON_ID}
              className={`${ACTION_STYLES.CONTROL_BUTTON}`}
              onClick={handleAction}
            >
              {NAVIGATE_TO_PATH_LABELS.BUTTON_TEXT}
            </button>
          </div>
        </div>
        {/* Response display */}
        <textarea
          id={NAVIGATE_TO_PATH_LABELS.RESPONSE_ID}
          className={`${ACTION_STYLES.TEXTAREA}`}
          rows="6"
          placeholder={NAVIGATE_TO_PATH_LABELS.RESPONSE_PLACEHOLDER}
          value={navigateResponse}
          readOnly
        />
      </div>
    </div>
  );
};

export default NavigatePath;
