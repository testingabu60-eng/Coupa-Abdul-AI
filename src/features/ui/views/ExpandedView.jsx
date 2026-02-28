import React from "react";
import ActionsView from "./ActionsView";
import Header from "../components/Header";

const ExpandedView = () => {
  return (
    <div className="expanded-view">
      <Header />
      <ActionsView />
    </div>
  );
};

export default React.memo(ExpandedView);
