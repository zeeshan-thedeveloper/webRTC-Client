import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import JoinCall from "./pages/JoinCall";
import Dashboard from "./pages/Dashboard";
import Authenticator from "./pages/Authenticator";
import StartCall from "./pages/StartCall";
import webRTCClient from "./webRTC-client/webRTC-client";
import { useEffect, useState } from "react";

function App({ webRtcClient,signalSocket }) {
  console.log("webRtcClient",webRtcClient)
  const [isJoinCallScreenOpen, setIsJoinCallScreenOpen] = useState(false);
  const [isStartCallScreenOpen, setIsStartCallScreenOpen] = useState(true);
  const [isDashboardScreenOpen, setIsDashboardScreenOpen] = useState(false);
  const handelScreenSwitch = (screenName) => {
    switch (screenName) {
      case "joincall":
        setIsDashboardScreenOpen(false)
        setIsJoinCallScreenOpen(true)
        setIsStartCallScreenOpen(false)
        break;
      case "startcall":
        setIsDashboardScreenOpen(false)
        setIsJoinCallScreenOpen(false)
        setIsStartCallScreenOpen(true)
        break;
      default:
        break;
    }
  };

  return (
    <div>
      {isStartCallScreenOpen == true && (
        <div>
          <StartCall
            webRtcClient={webRtcClient}
            signalSocket={signalSocket}
            handelScreenSwitch={handelScreenSwitch}
          />
        </div>
      )}
      {isJoinCallScreenOpen == true && (
        <div>
          <JoinCall
            webRtcClient={webRtcClient}
            signalSocket={signalSocket}
            handelScreenSwitch={handelScreenSwitch}
          />
        </div>
      )}
      {isDashboardScreenOpen == true && (
        <div>
          <Dashboard
            webRtcClient={webRtcClient}
            signalSocket={signalSocket}
            handelScreenSwitch={handelScreenSwitch}
          />
        </div>
      )}
    </div>
  );
}

export default App;
