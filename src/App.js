import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import JoinCall from "./pages/JoinCall";
import HostScreen from "./pages/HostScreen";
import Authenticator from "./pages/Authenticator";
import StartCall from "./pages/StartCall";
import { useEffect, useState } from "react";
import CandidateScreen from "./pages/CandidateScreen";

function App({ webRtcClient, signalSocket }) {
  
  const [callId, setCallId] = useState("");
  const [callStatus, setCallStatus] = useState("");
  const [userName, setUserName] = useState("");
  const [joiningCallId,setJoiningCallId]=useState("");
  const [isJoinCallScreenOpen, setIsJoinCallScreenOpen] = useState(false);
  const [isStartCallScreenOpen, setIsStartCallScreenOpen] = useState(true);
  const [isHostScreenOpen, setIsHostScreenOpen] = useState(false);
  const [isCandidateScreenOpen, setIsCandidateScreenOpen] = useState(false);
  
  const handelScreenSwitch = (screenName) => {
    switch (screenName) {
      case "joincall":
        setIsHostScreenOpen(false);
        setIsJoinCallScreenOpen(true);
        setIsStartCallScreenOpen(false);
        setIsCandidateScreenOpen(false)
        break;
      case "startcall":
        setIsHostScreenOpen(false);
        setIsJoinCallScreenOpen(false);
        setIsStartCallScreenOpen(true);
        setIsCandidateScreenOpen(false)
        break;
        case "hostscreen":
        setIsHostScreenOpen(true);
        setIsJoinCallScreenOpen(false);
        setIsStartCallScreenOpen(false);
        setIsCandidateScreenOpen(false)
        break;
        case "candidatescreen":
          setIsHostScreenOpen(false);
          setIsJoinCallScreenOpen(false);
          setIsCandidateScreenOpen(true)
          setIsStartCallScreenOpen(false);
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
            callId={callId}
            callStatus={callStatus}
            userName={userName}
            setCallId={setCallId}
            setCallStatus={setCallStatus}
            setUserName={setUserName}
            handelScreenSwitch={handelScreenSwitch}
          />
        </div>
      )}
      {isJoinCallScreenOpen == true && (
        <div>
          <JoinCall
            callId={callId}
            callStatus={callStatus}
            userName={userName}
            webRtcClient={webRtcClient}
            signalSocket={signalSocket}
            setCallId={setCallId}
            setCallStatus={setCallStatus}
            setUserName={setUserName}
            handelScreenSwitch={handelScreenSwitch}
          />
        </div>
      )}
      {isHostScreenOpen == true && (
        <div>
          <HostScreen
            callId={callId}
            callStatus={callStatus}
            userName={userName}
            webRtcClient={webRtcClient}
            signalSocket={signalSocket}
            setCallId={setCallId}
            setCallStatus={setCallStatus}
            setUserName={setUserName}
            handelScreenSwitch={handelScreenSwitch}
          />
        </div>
      )}
      {isCandidateScreenOpen == true && (
        <div>
          <CandidateScreen
            callId={callId}
            callStatus={callStatus}
            userName={userName}
            webRtcClient={webRtcClient}
            signalSocket={signalSocket}
            setCallId={setCallId}
            setCallStatus={setCallStatus}
            setUserName={setUserName}
            handelScreenSwitch={handelScreenSwitch}
          />
        </div>
      )}
    </div>
  );
}

export default App;
