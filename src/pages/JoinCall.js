import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setCallId,
  setLocalName,
  setLocalStream,
} from "../redux/actions/actions";

function JoinCall() {
  //states
  const [candidateName, setCandidateName] = useState("");
  const [callId, setCallID] = useState("");
  const [callStatus, setCallStatus] = useState("");
  const localStream = useSelector((state) => state.localStream);
  const listOfParticipants = useSelector((state) => state.listOfParticipants);

  //video ref
  const localVideoHolderRef = useRef(null);

  //dispatch
  let dispatch = useDispatch();

  //selectors
  const socketId = useSelector((state) => state.socketId);
  const webRTC = useSelector((state) => state.webRTC);

  //handlers
  const handleJoin = (event) => {
    event.preventDefault();
    // Do something with candidateName and callId, e.g. send a POST request to a server
    console.log(
      `Joining call with title: ${candidateName} and callId: ${callId}`
    );

    // dispatch(setCallId(callId))
    // dispatch(setLocalName(candidateName));
    webRTC
      .joinCall(candidateName, callId)
      .then((resp) => {
        console.log(resp);
        setCallStatus(resp);
        dispatch(setCallId(callId));
        dispatch(setLocalName(candidateName));
      })
      .catch((e) => {
        console.error(e);
      });
  };

  //useEffects

  useEffect(() => {
    const constraints = {
      video: {
        width: { max: 640 },
        height: { max: 480 },
        frameRate: { max: 30 },
      },
      audio: true,
    };
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        // set the stream in redux
        dispatch(setLocalStream(stream));
      })
      .catch((error) => {
        console.error("Error accessing media stream: ", error);
      });
  }, []);

  useEffect(() => {
    if (localStream != null) {
      console.log("local stream", localStream);
      localVideoHolderRef.current.srcObject = localStream;
    }
  }, [localStream]);

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
            onChange={(e) => setCallID(e.target.value)}
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

      <div className="videoSection">
        <div className="localVideoSection">
          <video
            style={{ height: "350px", width: "350px" }}
            ref={localVideoHolderRef}
            autoPlay
            
          />
        </div>
        <div className="remoteVideosSection">
          {listOfParticipants.map((video, index) => (
            <div key={index} className="remoteVideoContainer">
              <video
                className="remoteVideo"
                playsInline
                autoPlay
                
                ref={(videoRef) => {
                  if (videoRef && video.remoteStream) {
                    videoRef.srcObject = video.remoteStream;
                  }
                }}
              />
              <span className="remoteVideoName">{video.candidateName}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default JoinCall;
