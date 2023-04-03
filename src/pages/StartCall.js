import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/startcall.css";

const StartCall = () => {
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`Starting call with name: ${name}`);
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
        Want to join a  call? <Link to="/join-call">Join a call</Link>
      </p>
    </div>
  );
};

export default StartCall;
