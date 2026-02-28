export default {
  NAVIGATE_PATH_EXAMPLES: {
    DESCRIPTION: "Input the path to navigate to here.\nSample inputs:",
    PATHS: [
      "/requisition_headers",
      "/order_headers/1",
      "quotes/requests",
    ],
  },
  EASY_FORM_EXAMPLES: {
    DESCRIPTION: "Provide the Easy Form ID to initiate a response for here.",
    // Add more related constants here if needed
  },
  READ_FORM_EXAMPLES: {
    DESCRIPTION: "Input the content to read from the Form.\nSample input content to read from the Form",
    SAMPLE: `
    {
      "formLocation": "supplier_information_form",
      "formId": "99",
      "inputFields": [
        {
          "inputId": "text_field_1"
        }
      ]
    }`,
  },
  WRITE_FORM_EXAMPLES: {
    DESCRIPTION: "Sample input content to write to the Form response",
    SAMPLE: `
    {
      "formLocation": "supplier_information_form",
      "formId": "99",
      "inputFields": [
        {
          "inputId": "text_field_1",
          "value": "Sample text"
        }
      ]
    }`,
  },
  SUBSCRIBE_TO_LOCATION_EXAMPLES: {
    DESCRIPTION: "Input the location to subscribe to here. Note: “inputs” should be empty “[ ]” when subscribing only to a location, and should be populated only when subscribing to fields on a given location open on the UI",
    SAMPLE: `
    [
      {
        "location": "supplier_information_form",
        "inputs": [
          "text_field_1"
        ]
      }
    ]`,
  },
  GET_ELEMENT_META_EXAMPLES: {
    DESCRIPTION: "Sample input to get metadata from a form or element.\nScenario 1: Get full form metadata\nScenario 2: Get specific element metadata (only inputId is required)",
    SAMPLE: `
    {
      "formLocation": "supplier_information_form",
      "formId": "86"
    }

    OR for specific element (all fields):

    {
      "inputFields": [{
        "inputId": "name_given",
        "inputLocation": "supplier_information_contact_form",
        "formId": "62",
        "widgetId": "primary_contact_easy_form_response_459_child_easy_form_widget_2"
      }]
    }

    OR for specific element (minimal - only inputId required):

    {
      "inputFields": [{
        "inputId": "name_given"
      }]
    }`,
  },
  SUBSCRIBE_TO_OAF_EVENTS: {
    DESCRIPTION: "Enter the push events to subscribe",
    SAMPLE: `["pageResize", "formUpdated"]`,
  },
  UI_BUTTON_CLICK_PROCESS_EXAMPLES: {
    DESCRIPTION: "Enter a workflow process ID and click \"Execute Workflow Process\" to test the functionality.\n\nNote: Make sure WorkflowProcessBuilder is available in your Coupa environment.",
  }
};
