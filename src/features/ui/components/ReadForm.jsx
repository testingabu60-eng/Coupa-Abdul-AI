import { useState } from "react";
import { useOaf } from "../../oaf/useOaf";
import { STYLES, MESSAGES, EXAMPLES, LABELS } from "../constants";
import { STATUSES } from "../../oaf/oafConstants";

const { ACTION_STYLES } = STYLES;
const { READ_FORM_LABELS } = LABELS;
const { ERROR_MESSAGES } = MESSAGES;

// ReadForm component allows reading form data using oafReadForm
const ReadForm = () => {
  const { oafReadForm } = useOaf();
  const [readContent, setReadContent] = useState("");
  const [readFormResponse, setReadFormResponse] = useState(
    `${EXAMPLES.READ_FORM_EXAMPLES.DESCRIPTION}${EXAMPLES.READ_FORM_EXAMPLES.SAMPLE}`
  );

  // Handle textarea input change
  const handleOnChange = (e) => {
    setReadContent(e.target.value);
  };

  // Handle button click to read form data
  const handleAction = async () => {
    if (!readContent) {
      setReadFormResponse(ERROR_MESSAGES.INVALID_READ_FORM_METADATA);
      return;
    }
    let readMetaData;
    // Parse input and extract formMetaData
    try {
      readMetaData = JSON.parse(readContent);
    } catch (error) {
      setReadFormResponse(`${ERROR_MESSAGES.PARSING_ERROR}: ${error.message}`);
      return;
    }
    const response = await oafReadForm(readMetaData);
    if (response.status === STATUSES.ERROR) {
      setReadFormResponse(response.message);
    } else {
      setReadFormResponse(JSON.stringify(response.data, null, 2));
    }
  };

  return (
    <div>
      {/* Input section for form metadata */}
      <div className={`${ACTION_STYLES.ROW}`}>
        <div className="flex-1">
          {/* Textarea for user to input form metadata */}
          <textarea
            id={READ_FORM_LABELS.INPUT_ID}
            className={`${ACTION_STYLES.TEXTAREA}`}
            placeholder={READ_FORM_LABELS.INPUT_PLACEHOLDER}
            value={readContent}
            onChange={handleOnChange}
            rows={4}
          />
        </div>
        <div className="flex-none">
          {/* Button to trigger reading from form */}
          <button
            id={READ_FORM_LABELS.BUTTON_ID}
            className={`${ACTION_STYLES.CONTROL_BUTTON}`}
            onClick={handleAction}
          >
            {READ_FORM_LABELS.BUTTON_TEXT}
          </button>
        </div>
      </div>

      {/* Output section for displaying response */}
      <textarea
        id={READ_FORM_LABELS.RESPONSE_ID}
        className={`${ACTION_STYLES.TEXTAREA}`}
        rows={6}
        value={readFormResponse}
        placeholder={READ_FORM_LABELS.RESPONSE_PLACEHOLDER}
        readOnly
      />
    </div>
  );
};

export default ReadForm;
