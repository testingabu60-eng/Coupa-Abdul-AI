import React from "react";
import { useOaf } from "../../oaf/useOaf";
import { APP_TITLE } from "../constants/labels";

const MinimisedView = () => {
  const { expandApp } = useOaf();

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <button onClick={expandApp} className="byoa-circle">
        {APP_TITLE}
      </button>
    </div>
  );
};

export default React.memo(MinimisedView);
