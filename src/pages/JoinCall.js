import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/joincall.css";

const JoinCall = ({
  callId,
  callStatus,
  userName,
  webRtcClient,
  signalSocket,
  setCallId,
  setCallStatus,
  setUserName,
  ...props
}) => {

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`Joining with name: ${userName} and meetingId: ${callId}`);
    webRtcClient
      .createJoinRequest(userName, callId, signalSocket.getSocketId())
      .then(async(requestResponse) => {
        console.log(requestResponse)
        if(requestResponse.success){
          setCallStatus(requestResponse.message)
          props.handelScreenSwitch("candidatescreen")
        }
      })
      .catch((error) => {
        console.log(error);
      });

  };
  
  return (
    <div className="Join">
      <h2>Join the call</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="meetingId">Meeting ID:</label>
          <input
            type="text"
            id="meetingId"
            value={callId}
            onChange={(e) => setCallId(e.target.value)}
          />
        </div>
        <button type="submit">Join</button>
      </form>
      <p>
        Want to start a new call?{" "}
        <button
          onClick={() => {
            props.handelScreenSwitch("startcall");
          }}
        >
          Start a call
        </button>
      </p>
    </div>
  );
};

export default JoinCall;
