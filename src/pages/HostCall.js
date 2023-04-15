import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "../styles/host-call.css";
import { setLocalStream } from "../redux/actions/actions";
function HostCall() {
  //states
  const [callTitle, setCallTitle] = useState("");
  const [callDescription, setCallDescription] = useState("");
  const [callStatus, setCallStatus] = useState("");

  //video ref
  const localVideoHolderRef = useRef(null);

  //selectors
  const socketId = useSelector((state) => state.socketId);
  const listOfJoinRequests = useSelector((state) => state.listOfJoinRequests);
  const localStream = useSelector((state)=>state.localStream);
  //dispatch
  const dispatch = useDispatch();

  //webRTC
  const webRTC = useSelector((state) => state.webRTC);

  //handlers
  const handleCreateCall = () => {
    // Do something with callTitle and callDescription, e.g. send a POST request to a server
    console.log(
      `Creating call with title: ${callTitle} and description: ${callDescription}`
    );
    webRTC
      .createCall(callTitle, callDescription,"privateCall")
      .then((resp) => {
        console.log(resp);
        setCallStatus(resp);
      })
      .catch((e) => {
        console.error(e);
      });
  };

  const handleAdmit = (request) => {
    console.log(request);
    webRTC.acceptCall(request.requestId).then((response)=>{
      console.log(response)
    }).catch((e)=>{
      console.log(e)
    })
  };
  const handleDecline = (request) => {
    console.log(request);
  };

  //useEffects
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        // set the stream in redux
        dispatch(setLocalStream(stream));
      })
      .catch((error) => {
        console.error("Error accessing media stream: ", error);
      });
  }, []);

  useEffect(()=>{
    if(localStream!=null){
      console.log("local stream",localStream)
      localVideoHolderRef.current.srcObject =localStream
    }
  },[localStream])

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
      <div style={{ display: "flex", alignItems: "center" }}>
        <div className="callInfoContainer" style={{ marginRight: "20px" }}>
          <h4>Socket Id : {socketId}</h4>
          <h4>Call Id : {callStatus.callId}</h4>
          <h4>Call Status : {callStatus.message}</h4>
        </div>
        <div className="joinRequestContainer">
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {listOfJoinRequests.map((item) => (
              <li
                key={item.requestPayload.requesterName}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px",
                  padding: "10px",
                  border: "1px solid #ccc",
                }}
              >
                <div>Request from {item.requestPayload.requesterName}</div>
                <div>
                  <button
                    style={{ marginRight: "10px" }}
                    onClick={() => handleAdmit(item)}
                  >
                    Admit
                  </button>
                  <button onClick={() => handleDecline(item)}>Decline</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="videoSection">
        <div className="localVideoSection">
          <video  style={{ height: "350px", width: "350px" }} ref={localVideoHolderRef} autoPlay muted />
        </div>
        <div className="remoteVideosSection"></div>
      </div>
    </div>
  );
}

export default HostCall;
