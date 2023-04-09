import { useState, useEffect, useRef } from "react";
import "../styles/hostscreen.css";
import CallCard from "../components/CallCard";

const HostScreen = ({
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
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [incomingCall, setIncomingCall] = useState(null);
  const [remoteUser, setRemoteUser] = useState(null);
  useEffect(() => {
    const remoteVideo = remoteVideoRef.current;
    const localVideo = localVideoRef.current;
    let lastUserId = 0;
    if (remoteVideo && localVideo) {
      remoteVideo.srcObject = webRtcClient.getRemoteStream();
      // remoteVideo.srcObject =  webRtcClient.getLocalStream();
      localVideo.srcObject = webRtcClient.getLocalStream();
      console.log("localstream:",webRtcClient.getLocalStream())
    }
    let processedIds = [];

    signalSocket.getSocket().on("joinRequest", (request) => {
      if (!processedIds.includes(request.id)) {
        processedIds.push(request.id);
        console.log("got new join request : ", request);
        setIncomingCall(request);
      } else {
        console.log("duplicate join request ignored: ", request);
      }
    });

    signalSocket.getSocket().on("userToAddInCall", async (user) => {
      if (user.id != lastUserId) {
        console.log("adding new user in call : ", user);
        await webRtcClient.addUserInCall(
          user.userName,
          user.socketId,
          user.remoteOffer
        );
        setRemoteUser(user);
        lastUserId = user.id;
        remoteVideo.srcObject = webRtcClient.getRemoteStream();
        console.log("remoteStream-fetched",webRtcClient.getRemoteStream())
        console.log("webRtcClient.getRemoteStream().getVideoTracks()",webRtcClient.getRemoteStream().getVideoTracks())
        console.log("getPeerConnection",webRtcClient.getPeerConnection().iceConnectionState)
         
      }

    });
  }, [webRtcClient,signalSocket]);

  const answerCall = (socketId) => {
    signalSocket
      .sendAcceptJoinRequest(callId.callId, socketId)
      .then((requestResponse) => {
        console.log(requestResponse);
        setIncomingCall(null);
      })
      .catch((error) => {});
  };

  const rejectCall = (socketId) => {};

  return (
    <div className="Dashboard">
      <h2>
        Call Id {callId.callId} | Status : {callStatus} |{" "}
      </h2>
      <h3>Connection Id : ${signalSocket.getSocketId()} </h3>
      <div style={{ fontSize: "1.5rem", paddingBottom: "2%" }}>
        Waiting for someone to join
      </div>
      <div>
        {incomingCall != null && (
          <div>
            <CallCard
              callerName={incomingCall.userName}
              socketId={incomingCall.socketId}
              answerCall={answerCall}
              rejectCall={rejectCall}
            />
          </div>
        )}
      </div>
      <div className="video-container">
        <video
          ref={remoteVideoRef}
          id="remoteVideo"
          className="video"
          autoPlay
        ></video>
        <video
          ref={localVideoRef}
          id="localVideo"
          className="local-video"
          autoPlay
          muted
        ></video>
      </div>
      <div className="controls">
        <button onClick={() => setIsMicOn(!isMicOn)}>
          {isMicOn ? "🎤" : "🎤🔕"}
        </button>
        <button onClick={() => setIsVideoOn(!isVideoOn)}>
          {isVideoOn ? "🎥" : "🎥🔕"}
        </button>
      </div>
    </div>
  );
};

export default HostScreen;
