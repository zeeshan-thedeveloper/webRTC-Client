import '../styles/callcard.css'
const CallCard= ({ callerName, socketId,...props }) => {
    return (
      <div className="cart">
        <div className="caller-info">
          <p>Caller Name: {callerName}</p>
          <p>Socket ID: {socketId}</p>
        </div>
        <div className="button-container">
          <button className="answer-button" onClick={()=>{
            props.answerCall(socketId)
          }}>Answer</button>
          <button className="reject-button"  onClick={()=>{
            props.rejectCall(socketId)
          }}>Reject</button>
        </div>  
      </div>
    );
  };

  export default CallCard