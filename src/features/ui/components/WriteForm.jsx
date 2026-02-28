import { useState } from "react";
import { useOaf } from "../../oaf/useOaf";
import { EXAMPLES, STYLES, MESSAGES, LABELS } from "../constants";

const { ACTION_STYLES } = STYLES;
const { WRITE_FORM_LABELS } = LABELS;
const { ERROR_MESSAGES } = MESSAGES;

// WriteForm component allows users to input JSON and write it to a form using oafWriteForm
const WriteForm = () => {
  const { oafWriteForm } = useOaf();

  const [writeContent, setWriteContent] = useState("");
  const [writeFormResponse, setWriteFormResponse] = useState(
    `${EXAMPLES.WRITE_FORM_EXAMPLES.DESCRIPTION}${EXAMPLES.WRITE_FORM_EXAMPLES.SAMPLE}`
  );

  // Handle textarea value change
  const handleOnChange = (e) => {
    setWriteContent(e.target.value);
  };

  // Handle button click to write data to form
  const handleAction = async () => {
    if (!writeContent) {
      setWriteFormResponse(ERROR_MESSAGES.INVALID_WRITE_FORM_DATA);
      return;
    }
    let parsedData;
    try {
      parsedData = JSON.parse(writeContent); // Parse input as JSON
    } catch (error) {
      setWriteFormResponse(`${ERROR_MESSAGES.INVALID_JSON}: ${error.message}`);
      return;
    }
    // Wrap the parsed data inside formMetaData
    const writeData = {
      formMetaData: parsedData,
    };
    const response = await oafWriteForm(writeData); // Call API
    setWriteFormResponse(response.message); // Store response
  };

  return (
    <div>
      {/* Input section: textarea for JSON and button to submit */}
      <div className={`${ACTION_STYLES.ROW}`}>
        <div className="flex-1">
          {/* Textarea for user to enter JSON */}
          <textarea
            id={WRITE_FORM_LABELS.INPUT_ID}
            className={`${ACTION_STYLES.TEXTAREA}`}
            placeholder={WRITE_FORM_LABELS.INPUT_PLACEHOLDER}
            value={writeContent}
            onChange={handleOnChange}
            rows={4}
          />
        </div>
        <div className="flex-none">
          {/* Button to trigger write action */}
          <button
            id={WRITE_FORM_LABELS.BUTTON_ID}
            className={`${ACTION_STYLES.CONTROL_BUTTON}`}
            onClick={handleAction}
          >
            {WRITE_FORM_LABELS.BUTTON_TEXT}
          </button>
        </div>
      </div>

      {/* Response textarea: displays result of write action */}
      <textarea
        id={WRITE_FORM_LABELS.RESPONSE_ID}
        className={`${ACTION_STYLES.TEXTAREA}`}
        rows="6"
        value={writeFormResponse}
        readOnly
      />
    </div>
  );
};

export default WriteForm;
