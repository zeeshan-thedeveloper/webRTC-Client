import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/joincall.css";

const JoinCall = ({webRtcClient,...props}) => {
  const [name, setName] = useState("");
  const [meetingId, setMeetingId] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`Joining with name: ${name} and meetingId: ${meetingId}`);
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
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="meetingId">Meeting ID:</label>
          <input
            type="text"
            id="meetingId"
            value={meetingId}
            onChange={(e) => setMeetingId(e.target.value)}
          />
        </div>
        <button type="submit">Join</button>
      </form>
      <p>
        Want to start a new call? <button onClick={()=>{
              props.handelScreenSwitch("startcall")
        }}>Start a call</button>
      </p>
    </div>
  );
};

export default JoinCall;
