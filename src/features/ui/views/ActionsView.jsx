import React from "react";
import NavigatePath from "../components/NavigatePath";
import EasyForm from "../components/EasyForm";
import ReadForm from "../components/ReadForm";
import WriteForm from "../components/WriteForm";
import SubscribeToLocation from "../components/SubscribeToLocation";
import PageContext from "../components/PageContext";
import GetElementMeta from "../components/GetElementMeta";
import { ACTION_STYLES } from "../styles/styles";
import OafPushEvents from "../components/OafPushEvents";
import UiButtonClickProcessLauncher from "../components/UiButtonClickProcessLauncher";
import { ACTIONS_VIEW_LABELS } from "../constants/labels";

const ActionsView = () => {
  return (
    <div className="flex flex-col h-full">
      <main className="flex-grow p-4 bg-gray-50 overflow-y-auto" role="main">
        <div
          id="ActionsView"
          className="space-y-6"
          aria-label="Actions demonstration view"
        >
          <header className="text-center">
            <h1 className="text-xl font-bold text-gray-700 p-3 bg-gray-100 rounded-xl">
              {ACTIONS_VIEW_LABELS.CLIENT_DEMO}
            </h1>
          </header>

          <NavigatePath />
          <EasyForm />

          <section
            className={`${ACTION_STYLES.CONTAINER}`}
            aria-labelledby="form-operations-heading"
          >
            <h3
              id="form-operations-heading"
              className={`${ACTION_STYLES.HEADER}`}
            >
              {ACTIONS_VIEW_LABELS.READ_WRITE_FORM}
            </h3>
            <ReadForm />
            <div className="border-b pb-2" role="separator"></div>
            <WriteForm />
          </section>

          <GetElementMeta />
          <SubscribeToLocation />
          <OafPushEvents />
          <PageContext />
          <UiButtonClickProcessLauncher />
        </div>
      </main>
    </div>
  );
};

export default React.memo(ActionsView);
