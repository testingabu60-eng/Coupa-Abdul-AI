BYOA BoilerPlate Application

A comprehensive boilerplate application designed to showcase the capabilities of the Open Assistant Framework (OAF) and provide a complete foundation for building custom applications that integrate with the Coupa platform.

It serves as both a comprehensive learning tool and a robust starting point for custom OAF development.
What You'll Get

- Complete OAF Integration: Full-featured examples of all major OAF capabilities
- Modern React Architecture: Built with React 19, Vite, and Tailwind CSS
- Enterprise-Grade Patterns: Scalable, maintainable code structure
- Comprehensive Testing: Jest and React Testing Library setup

Key Capabilities

Feature Description
Form Operations Read/write Coupa form data seamlessly
Navigation Control Programmatic Coupa page navigation
Window Management dock, minimize, and maximize operations
Real-time Subscriptions Monitor data location changes in real-time
Context Access User and page context retrieval

Key Files to Know

File Purpose Description
src/features/oaf/useOaf.js Main OAF Hook Your primary interface to OAF operations
src/features/oaf/oafConfig.js Configuration Environment and connection settings
src/features/oaf/OafContext.jsx State Provider React context for state management
src/features/oaf/oafClient.js SDK Wrapper Low-level OAF SDK functions
src/app/App.jsx Root Component Application entry point

Technology Stack

Technology Purpose Version
React UI Framework 19.x
Vite Build Tool & Dev Server Latest
Tailwind CSS Utility-First CSS 3.x
Jest Testing Framework Latest
React Testing Library Component Testing Latest
@coupa/open-assistant-framework-client OAF SDK Latest

Get your OAF application running:

Prerequisites

- Node.js v18+
- NPM v9+ (included with Node.js)
- Coupa Platform Access with OAF permissions

Installation & Setup

# 1. Download the boilerplate from your Coupa instance/Clone from GitHub

# 2. Extract the ZIP file to your desired location

# 3. Navigate to the project directory

cd byoa-boilerplate

# 4. Install dependencies

npm install

# 5. Start development server

npm run dev

🎉 Your app will be available at http://localhost:5173

Before you begin, gather these details from your Coupa environment:

1. Coupa Instance URL

Format: https://[your-company].coupahost.com
Example: https://acme-corp.coupahost.com

2. appId - The ClientId you get when you create a floating Iframe on Coupa Enterprise

3. OAF Permissions

- Verify OAF feature is enabled for your instance
- Ensure your user has appropriate OAF permissions

{
  "properties": { 
  },
  "iframeProperties": {
      "initialDimensions": {
        "height": 300,
        "width": 350
      }
  },
  "permissions": {
    "global_actions": [
      "writeForm",
      "readForm",
      "navigateToPath",
      "listenToDataLocation",
      "openEasyForm",
      "resizeIframe",
      "moveToLocation",
      "getPageContext",
      "getUserContext",
      "moveAndResize"
    ],
    "location": {
      "supplier_information_form": {
        "general_fields": {
          "read": true,
          "write": true
        },
        "non_general_fields": {
          "read": [
            "display_name",
            "name",
            "supplier_owner",
            "custom_field_1",
            "custom_field_2"
          ],
          "write": [
            "display_name",
            "name",
            "supplier_owner",
            "custom_field_1",
            "custom_field_2"
          ]
        }
      }
    }
  }
}

Core Configuration Files
Primary Config: src/features/oaf/oafConfig.js

import { CONFIG_PROPS } from "./oafConstants";

const getCoupaHost = () => {
  if (!import.meta.env.PROD) {
   return CONFIG_PROPS.HOST_URLS.LOCALHOST;
 }
 const host = urlParams.get(CONFIG_PROPS.URL_PARAMS.COUPA_HOST);
 return host ? `${CONFIG_PROPS.HOST_URLS.HTTPS_PROTOCOL}${host}` : CONFIG_PROPS.HOST_URLS.DEFAULT_HOST;
};

const config = {
 appId: CONFIG_PROPS.APP_ID,
 coupahost: getCoupaHost(),
 iframeId: urlParams.get(CONFIG_PROPS.URL_PARAMS.IFRAME_ID),
};

Constants: src/features/oaf/oafConstants.js

export const CONFIG_PROPS = {
  APP_ID: '1231231',
  HOST_URLS: {
    LOCALHOST: 'http://localhost:46880',
    HTTPS_PROTOCOL: 'https://',
    DEFAULT_HOST: 'https://example.com',
  },
  URL_PARAMS: {
    COUPA_HOST: 'coupahost',
    IFRAME_ID: 'floating_iframe_id',
  }, 
};

Available Operations📝

Form Operations

const { oafReadForm, oafWriteForm, state } = useOaf();

let readMetaData = { 
    "formLocation": "supplier_information_form",
    "formId": "99",
    "inputFields": [
      {
        "inputId": "text_field_1"
      }
    ]
}
// Read form
await oafReadForm(readMetaData);

let writeFormData = { 
    "formLocation": "supplier_information_form",
    "formId": "99",
    "inputFields": [
      {
        "inputId": "text_field_1",
  "value" : "oafWrite"
      }
    ]
}
// Write form data
await oafWriteForm(writeFormData);

🧭 Navigation Operations

const { oafNavigatePath } = useOaf();

// Navigate to different pages
await oafNavigatePath("/purchase-orders");
await oafNavigatePath("/suppliers/new");
await oafNavigatePath("/invoices?status=pending");

Subscribe to Location

import { useOaf } from '../../oaf/useOaf';

// Component for subscribing to a location using OAF
export const SubscribeToLocation = () => {
  const { oafSubscribeToLocation, oafAppEvents } = useOaf();

const subscriptionText = [
  {
    "location": "supplier_information_form",
    "inputs": [
      "text_field_1"
    ]
  }
]

// Handle subscribe button click
  const handleAction = async () => {
    // Call OAF subscribe method with parsed JSON input
    const response = await oafSubscribeToLocation(subscriptionText);
    setSubscriptionResponse(response);
  };
  // Listen for 'subscribedAttributeResponse' event from OAF and update response
  useEffect(() => {
    const handleSubscribedAttributeResponse = event => {
      setSubscriptionResponse(JSON.stringify(event, null, 2));
    };
    oafAppEvents.on(
      "subscribedAttributeResponse"
,
      handleSubscribedAttributeResponse
    );
    // Cleanup event listener on unmount
    return () => {
      oafAppEvents.off(
        "subscribedAttributeResponse",
        handleSubscribedAttributeResponse
      );
    };
  }, [oafAppEvents]);

🪟 Window Management

const { dockAppToLeft,dockAppToRight, expandApp, minimiseApp, maximiseApp, makeAppSidepanel} = useOaf();

// Dock positioning
await dockAppToLeft;
await dockAppToRight;

// Window states 
await maximiseApp(); 
await makeAppSidepanel();
await expandApp();

Extending Functionality
Adding New OAF Operations

Follow this pattern to add custom OAF operations:

1. Implement in oafClient.js

export const moveAppToLocation = async (top, left, resetToDock) => {
  return oafApp.moveToLocation({
    top,
    left,
    resetToDock,
  });
};

2. Add to State Management if applicable

const oafState = {
  currLayoutPosition: LAYOUT_POSITIONS.DOCKED_RIGHT,
  currLayoutState: LAYOUT_STATES.DEFAULT,
  prevLayoutState: null,
  response: null,
  error: null, 
};

3. Expose via useOaf Hook

import { moveAppToLocation } from './oafClient'

const oafMoveToLocation = async() => {
 // your custom Logic
 await moveAppToLocation(0, 0, false)
// your custom Logic
}

// return the custom method
return {
...state,
 oafMoveToLocation
}

-

4. Use In Your Component

// 1. Import the hook
import { useOaf } from "./features/oaf/useOaf";

// 2. Use in component
function MyComponent() {
  const { oafMoveToLocation, state} = useOaf();

// 3. Call OAF operations
  const handleAction = async () => {
    try {
      const result = await oafMoveToLocation();
      console.log("Moved App to Location");
    } catch (err) {
      console.error("OAF error:", err);
    }
  };

return <button onClick={handleAction}>Move App to Location</button>;
}

Getting Started Checklist

Ready to build your OAF application? Follow this step-by-step checklist:

✅ Setup (5 minutes)

- Install Node.js 18+
- Download and extract the boilerplate
- Run npm install
- Start with npm run dev
  ✅ Configuration (10 minutes)
- Get Coupa instance URL
- Obtain App ID from Coupa admin
- Update oafConfig.js with your details
- Test connection in browser
  ✅ Development (30 minutes)
- Explore example components
- Try OAF operations in Coupa environment
- Copy/modify components for your needs
- Test your changes thoroughly
