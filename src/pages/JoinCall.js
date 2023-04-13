import React, { useState } from 'react';
import { useSelector } from 'react-redux';

function JoinCall() {
  const [candidateName, setCandidateName] = useState("");
  const [callId, setCallId] = useState("");
  const [callStatus, setCallStatus] = useState("");
  const socketId = useSelector((state) => state.socketId);
  const webRTC = useSelector((state) => state.webRTC);

  const handleJoin = () => {
    // Do something with candidateName and callId, e.g. send a POST request to a server
    console.log(
      `Creating call with title: ${candidateName} and description: ${callId}`
    );
    webRTC
      .joinOneToOneCall(candidateName, callId)
      .then((resp) => {
        console.log(resp);
        setCallStatus(resp);
      })
      .catch((e) => {
        console.error(e);
      });
  };

  return (
    <div className="container">
      <div className="pageTitle">
        <h1 className="inlineHeading">Join Call</h1>
        <div className="inlineHeading createCallContainer">
          <label className="inlineLabel">Candidate Name</label>
          <input
            className="inlineInput"
            type="text"
            id="candidateName"
            name="candidateName"
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
          />
          <label className="inlineLabel">Call Id</label>
          <input
            className="inlineInput"
            type="text"
            id="callId"
            name="callId"
            value={callId}
            onChange={(e) => setCallId(e.target.value)}
          />
          <button className="inlineButton" onClick={handleJoin}>
            Join Call
          </button>
        </div>
      </div>
      <div className="callInfoContainer">
        <h4>Socket Id : {socketId}</h4>
        <h4>Call Id : {callStatus.requestId}</h4>
        <h4>Call Status : {callStatus.message}</h4>
      </div>
      
    </div>
  );
}

export default JoinCall;
