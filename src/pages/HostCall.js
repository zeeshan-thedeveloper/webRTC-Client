import React, { useState } from "react";
import { useSelector } from "react-redux";
import "../styles/host-call.css";
function HostCall() {
  const [callTitle, setCallTitle] = useState("");
  const [callDescription, setCallDescription] = useState("");
  const [callStatus, setCallStatus] = useState("");
  const socketId = useSelector((state) => state.socketId);

  const webRTC = useSelector((state) => state.webRTC);
  const listOfJoinRequests = useSelector((state)=>state.listOfJoinRequests);
  const handleCreateCall = () => {
    // Do something with callTitle and callDescription, e.g. send a POST request to a server
    console.log(
      `Creating call with title: ${callTitle} and description: ${callDescription}`
    );
    webRTC
      .createOneToOneCall(callTitle, callDescription)
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
        <h1 className="inlineHeading">Host Call</h1>
        <div className="inlineHeading createCallContainer">
          <label className="inlineLabel">Call Title</label>
          <input
            className="inlineInput"
            type="text"
            id="callTitle"
            name="callTitle"
            value={callTitle}
            onChange={(e) => setCallTitle(e.target.value)}
          />
          <label className="inlineLabel">Call Description</label>
          <input
            className="inlineInput"
            type="text"
            id="callDescription"
            name="callDescription"
            value={callDescription}
            onChange={(e) => setCallDescription(e.target.value)}
          />
          <button className="inlineButton" onClick={handleCreateCall}>
            Create Call
          </button>
        </div>
      </div>
      <div className="callInfoContainer">
        <h4>Socket Id : {socketId}</h4>
        <h4>Call Id : {callStatus.callId}</h4>
        <h4>Call Status : {callStatus.message}</h4>
      </div>
      <div>
        {
            listOfJoinRequests.map((item)=>{
                return <div>
                    request from {item.requesterName}
                </div>
            })
        }
      </div>
    </div>
  );
}

export default HostCall;
