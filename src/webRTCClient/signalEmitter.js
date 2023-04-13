const signalEmitter = () => {
  let socket = null;
  const init = (initializedSocket) => {
    socket = initializedSocket;
    return socket;
  };

  const startOneToOneCall = (callTitle, callDescription) => {
    return new Promise((resolve, reject) => {
      socket.emit("startOneToOneCall", {callTitle,callDescription,socketId:socket.id}, (callStatus) => {
        console.log(callStatus)
        if (callStatus.success) {
          resolve(callStatus);
        } else {
          reject("Failed to start call");
        }
      });
    });
  };

  const makeOneToOneCallJoiningRequest = (callId,candidateName) => {
    return new Promise((resolve, reject) => {
      socket.emit("makeOneToOneCallJoiningRequest", {callId,candidateName,socketId:socket.id}, (callStatus) => {
        console.log(callStatus)
        if (callStatus.success) {
          resolve(callStatus);
        } else {
          reject("Failed to start call");
        }
      });
    });
  };
  
  const NewGroupCall = (socket) => {};


  const Offer = (socket) => {};

  const Answer = (socket) => {};

  const IceCandidates = (socket) => {};

  return {
    init,
    startOneToOneCall,
    makeOneToOneCallJoiningRequest,
    Answer,
    
    IceCandidates,
    Offer,
  };
};

export default signalEmitter;
