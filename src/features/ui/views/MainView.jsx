import React from "react";
import ExpandedView from "./ExpandedView";
import MinimisedView from "./MinimisedView";
import { useOaf } from "../../oaf/useOaf";
import { LAYOUT_STATES } from "../../oaf/oafConstants";

const MainView = () => {
  const { currLayoutState } = useOaf();

  return (
    <div>
      {currLayoutState === LAYOUT_STATES.MINIMIZED ? (
        <MinimisedView />
      ) : (
        <ExpandedView />
      )}
    </div>
  );
};

export default React.memo(MainView);
