import { useState, useEffect, useRef } from "react";
import "../styles/candidatescreen.css";

const CandidateScreen = ({
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

  useEffect(() => {
    const localVideo = localVideoRef.current;

    if (isVideoOn) {
      webRtcClient.resumeSharingVideo(localVideo);
    } else {
      webRtcClient.stopSharingVideo(localVideo);
    }

    if (isMicOn) {
      webRtcClient.resumeSharingAudio(localVideo);
    } else {
      webRtcClient.stopSharingAudio(localVideo);
    }
  }, [isMicOn, isVideoOn]);

  useEffect(() => {
    const remoteVideo = remoteVideoRef.current;
    const localVideo = localVideoRef.current;

    if (remoteVideo && localVideo) {
      remoteVideo.srcObject = webRtcClient.getRemoteStream();
      localVideo.srcObject = webRtcClient.getLocalStream();
      console.log("localstream", webRtcClient.getLocalStream());
    }
    let lastUserId = 0;
    signalSocket.getSocket().on("requestStatus", (data) => {
      console.log(
        "message from server : ",
        data.remoteOffer + " count " + lastUserId
      );
      webRtcClient
        .joinCall(
          JSON.parse(data.remoteOffer),
          signalSocket.getSocketId(),
          callId,
          userName
        )
        .then((requestResponse) => {
          console.log(requestResponse);
          remoteVideo.srcObject = webRtcClient.getRemoteStream();
        })
        .catch((error) => {
          console.error(error);
        });
    });
  }, [webRtcClient, signalSocket]);

  return (
    <div className="Dashboard">
      <h2>
        Joined Call Id {callId} | Status : {callStatus} |{" "}
      </h2>
      <h3>Connection Id : ${signalSocket.getSocketId()} </h3>
      <div style={{ fontSize: "1.5rem", paddingBottom: "2%" }}>
        Waiting for host to admit
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

export default CandidateScreen;
