import React, { useState } from 'react';
import { useOaf } from '../../oaf/useOaf';
import { MESSAGES, EXAMPLES, STYLES, LABELS } from '../constants';

const { ACTION_STYLES } = STYLES;
const { EASY_FORM_LABELS } = LABELS;
const { ERROR_MESSAGES } = MESSAGES;

// EasyForm component allows users to open an Easy Form by ID and view the response
const EasyForm = () => {
  // Hook to access OAF actions
  const { oafOpenEasyForm } = useOaf();

  const [easyFormId, setEasyFormId] = useState('');
  const [easyFormResponse, setEasyFormResponse] = useState(
    EXAMPLES.EASY_FORM_EXAMPLES.DESCRIPTION
  );

  // Handles changes to the Easy Form ID input field
  const handleOnChange = e => {
    setEasyFormId(e.target.value);
  };

  // Calls the OAF action to open the Easy Form and sets the response
  const handleAction = async () => {
    if (!easyFormId || easyFormId <= 0) {
      setEasyFormResponse(ERROR_MESSAGES.INVALID_EASY_FORM_ID);
      return;
    }
    const response = await oafOpenEasyForm(easyFormId);
    setEasyFormResponse(response.message);
  };

  return (
    <div>
      {/* Open Easy Form Section */}
      <div className={`${ACTION_STYLES.CONTAINER}`}>
        <h3 className={`${ACTION_STYLES.HEADER}`}>{EASY_FORM_LABELS.HEADER}</h3>
        <div className={`${ACTION_STYLES.ROW}`}>
          <div className="flex-1">
            {/* Input for Easy Form ID */}
            <input
              id={EASY_FORM_LABELS.INPUT_ID}
              type="number"
              className={`${ACTION_STYLES.INPUT}`}
              placeholder={EASY_FORM_LABELS.INPUT_PLACEHOLDER}
              value={easyFormId}
              onChange={handleOnChange}
            />
          </div>
          <div className="flex-none">
            {/* Button to trigger opening the Easy Form */}
            <button
              id={EASY_FORM_LABELS.BUTTON_ID}
              className={`${ACTION_STYLES.CONTROL_BUTTON}`}
              onClick={handleAction}
            >
              {EASY_FORM_LABELS.BUTTON_TEXT}
            </button>
          </div>
        </div>
        {/* Displays the response from opening the Easy Form */}
        <textarea
          id={EASY_FORM_LABELS.RESPONSE_ID}
          className={`${ACTION_STYLES.TEXTAREA}`}
          rows="6"
          value={easyFormResponse}
          readOnly
        />
      </div>
    </div>
  );
};

export default EasyForm;
