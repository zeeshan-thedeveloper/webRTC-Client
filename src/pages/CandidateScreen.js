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
    const remoteVideo = remoteVideoRef.current;
    const localVideo = localVideoRef.current;

    if (remoteVideo && localVideo) {
      remoteVideo.srcObject = webRtcClient.getRemoteStream();
      localVideo.srcObject = webRtcClient.getLocalStream();
    }

    signalSocket.getSocket().on("requestStatus", (data) => {
      console.log("message from server : ", data.remoteOffer);
      if(data.isAccepted){
        //now let's join it
        console.log("joining call")
        webRtcClient.joinCall(userName,callId,signalSocket.getSocketId(),data.remoteOffer).then((requestResponse)=>{
          console.log(requestResponse)
        }).catch((error)=>{
          console.error(error)
        })
      }else{
        alert("Rejected")
      } 
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

export default CandidateScreen;
