import { useState } from 'react';
import { useOaf } from '../../oaf/useOaf';
import { ACTION_STYLES } from "../styles/styles";
import EXAMPLES from "../constants/examples";
import { ERROR_MESSAGES } from '../constants/messages';
import { UI_BUTTON_CLICK_PROCESS_LABELS } from '../constants/labels';

/**
 * UiButtonClickProcessLauncher Component
 * A demo component that allows testing the launchUiButtonClickProcess functionality.
 * Users can input a process ID and launch UI button click processes.
 */
const UiButtonClickProcessLauncher = () => {
  const { oafLaunchUiButtonClickProcess } = useOaf();
  const [processId, setProcessId] = useState('');
  const [response, setResponse] = useState(EXAMPLES.UI_BUTTON_CLICK_PROCESS_EXAMPLES.DESCRIPTION);

  const handleOnChange = (e) => {
    setProcessId(e.target.value);
  };

  const handleAction = async () => {
    // Clear previous results
    setResponse('');

    // Validate input
    const id = parseInt(processId, 10);
    if (isNaN(id) || id <= 0) {
      setResponse(ERROR_MESSAGES.INVALID_UI_BUTTON_CLICK_PROCESS_ID);
      return;
    }

    // Check if the method exists
    if (!oafLaunchUiButtonClickProcess || typeof oafLaunchUiButtonClickProcess !== 'function') {
      setResponse(ERROR_MESSAGES.UI_BUTTON_CLICK_PROCESS_NOT_AVAILABLE);
      return;
    }
    
    try {
      const result = await oafLaunchUiButtonClickProcess(id);
      
      // Simplify the response by using rawResponse if available, otherwise use result
      const displayData = result.rawResponse || result;
      
      // Display the entire response object
      setResponse(JSON.stringify(displayData, null, 2));
    } catch (err) {
      const displayErr = err.rawResponse || err;
      setResponse(JSON.stringify(displayErr, null, 2));
    }
  };

  return (
    <div>
      <div className={`${ACTION_STYLES.CONTAINER}`}>
        <h3 className={`${ACTION_STYLES.HEADER}`}>{UI_BUTTON_CLICK_PROCESS_LABELS.HEADER}</h3>
        <div className={`${ACTION_STYLES.ROW}`}>
          <div className="flex-1">
            <input
              id={UI_BUTTON_CLICK_PROCESS_LABELS.INPUT_ID}
              type="number"
              className={`${ACTION_STYLES.INPUT}`}
              placeholder={UI_BUTTON_CLICK_PROCESS_LABELS.INPUT_PLACEHOLDER}
              value={processId}
              onChange={handleOnChange}
              min="1"
            />
          </div>
          <div className="flex-none">
            <button
              id={UI_BUTTON_CLICK_PROCESS_LABELS.BUTTON_ID}
              className={`${ACTION_STYLES.CONTROL_BUTTON}`}
              onClick={handleAction}
            >
              {UI_BUTTON_CLICK_PROCESS_LABELS.BUTTON_TEXT}
            </button>
          </div>
        </div>
        <textarea
          id={UI_BUTTON_CLICK_PROCESS_LABELS.RESPONSE_ID}
          className={`${ACTION_STYLES.TEXTAREA}`}
          rows="6"
          placeholder={UI_BUTTON_CLICK_PROCESS_LABELS.RESPONSE_PLACEHOLDER}
          value={response}
          readOnly
        />
      </div>
    </div>
  );
};

export default UiButtonClickProcessLauncher;
