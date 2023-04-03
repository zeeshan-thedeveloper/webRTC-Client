import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/startcall.css";

const StartCall = ({ webRtcClient, signalSocket, ...props }) => {
  const [name, setName] = useState("");
  const [callId, setCallId] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`Starting call with name: ${name}`);
    console.log("signalSocket [going to use ]", signalSocket);
    signalSocket
      .getCallId(name)
      .then((callId) => {
        console.log("Caller Id : ", callId);
        setCallId(callId);
        webRtcClient
          .startCall(name, callId)
          .then(() => {
            console.log("Call initiated successfully");
            
          })
          .catch((error) => {
            console.error("Failed to initiate call:", error);
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
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <button type="submit">Start call</button>
      </form>
      <p>
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
