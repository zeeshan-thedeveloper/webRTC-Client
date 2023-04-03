import { useState } from "react";
import "../styles/dashboard.css";

const Dashboard = () => {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);

  return (
    <div className="Dashboard">
      <h2>Call with John</h2>
      <div className="video-container">
        <video id="remoteVideo" className="video" autoPlay></video>
        <video id="localVideo" className="local-video" autoPlay muted></video>
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

export default Dashboard;
