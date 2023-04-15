const signalEmitter = () => {
  let socket = null;
  const init = (initializedSocket) => {
    socket = initializedSocket;
    return socket;
  };

  const createCall = (callTitle, callDescription,callType) => {
    return new Promise((resolve, reject) => {
      socket.emit("createCall", {callTitle,callDescription,socketId:socket.id,callType}, (response) => {
        console.log(response)
        if (response.success) {
          resolve(response);
        } else {
          reject("Failed to start call");
        }
      });
    });
  }; 

  const makeJoinCallRequest = (callId,candidateName) => {
    return new Promise((resolve, reject) => {
      socket.emit("makeJoinCallRequest", {callId,candidateName,socketId:socket.id}, (response) => {
        console.log(response)
        if (response.success) {
          resolve(response);
        } else {
          reject("Failed to start call");
        }
      });
    });
  };
  const updateJoinCallRequestStatus = (requestId,status) => {
    return new Promise((resolve, reject) => {
      socket.emit("updateJoinCallRequestStatus", {requestId,status,socketId:socket.id}, (response) => {
        console.log(response)
        if (response.success) {
          resolve(response);
        } else {
          reject("Failed to update request status");
        }
      });
    });
  };
  
  return {
    init,
    createCall,
    makeJoinCallRequest,
    updateJoinCallRequestStatus
  };
};

export default signalEmitter;
