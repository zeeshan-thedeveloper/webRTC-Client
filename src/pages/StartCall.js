import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/startcall.css";

const StartCall = ({
  webRtcClient,
  signalSocket,
  callId,
  callStatus,
  userName,
  setCallId,
  setCallStatus,
  setUserName,
  ...props
}) => {
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`Starting call with name: ${userName}`);
    console.log("Stored socket id : "+signalSocket.getSocketId())
    signalSocket
      .getCallId(userName)
      .then((callId) => {
        console.log("Caller Id : ", callId);
        setCallId(callId);
        webRtcClient
          .startCall(userName, callId.callId,signalSocket.getSocketId())
          .then(() => {
            console.log("Call initiated successfully");
            setCallStatus("Call initiated successfully");
            props.handelScreenSwitch("hostscreen")
          })
          .catch((error) => {
            console.error("Failed to initiate call:", error);
            setCallStatus("Failed to initiate call:" + error);
          });
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div className="StartCall">
      <h2>Start a call</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">userName:</label>
          <input
            type="text"
            id="name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>
        <div style={{ textAlign: "center" }}>
          <button type="submit">Start call</button>
          {/* <div className="callId">
            {callId != null && (
              <div> 
                {" "}
                Call id : {callId.callId} : Status : {callStatus}{" "}
              </div>
            )}
          </div> */}
        </div>
      </form>
      <p style={{ textAlign: "center" }}>
        Want to join a call?{" "}
        <button
          onClick={() => {
            props.handelScreenSwitch("joincall");
          }}
        >
          Join a call
        </button>
      </p>
    </div>
  );
};

export default StartCall;
