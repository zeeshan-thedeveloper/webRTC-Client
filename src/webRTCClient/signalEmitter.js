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

  const updateJoinCallRequestStatus = (requestId,hostIceCandidates,offer,status) => {
    return new Promise((resolve, reject) => {
      socket.emit("updateJoinCallRequestStatus", {requestId,hostIceCandidates,offer,status,socketId:socket.id}, (response) => {
        console.log(response)
        if (response.success) {
          resolve(response);
        } else {
          reject("Failed to update request status");
        }
      });
    });
  };

  const updateRemoteClientIceCandidates=(remoteSocketId,requestId,answerOffer,localIceCandidates,callId)=>{
    return new Promise((resolve, reject) => {
      socket.emit("updateRemoteClientIceCandidates", {remoteSocketId,requestId,answerOffer,localIceCandidates,callId,socketId:socket.id}, (response) => {
        console.log(response)
        if (response.success) {
          resolve(response);
        } else {
          reject("Failed to update remote ice candidates");
        }
      });
    });
  }

  const confirmConnectionWithHost=(remoteClientSocket,callId,requestId,status)=>{
    return new Promise((resolve, reject) => {
      socket.emit("confirmConnectionWithHost", {remoteClientSocket,status,callId,requestId,socketId:socket.id}, (response) => {
        console.log(response)
        if (response.success) {
          resolve(response);
        } else {
          reject("Failed to confirmConnectionWithHost");
        }
      });
    });
  }

  //auto accept
  const sendAutoAcceptOffer = (requestId,hostIceCandidates,offer,remoteClientSocketId,callId,localName) => {
    return new Promise((resolve, reject) => {
      socket.emit("sendAutoAcceptOffer", {requestId,hostIceCandidates,offer,remoteClientSocketId,callId,hostName:localName,socketId:socket.id}, (response) => {
        console.log(response)
        if (response.success) {
          resolve(response);
        } else {
          reject("Failed to sendAutoAcceptOffer");
        }
      });
    });
  };
  
  
  const updateAutoRemoteClientIceCandidates=(remoteSocketId,requestId,answerOffer,localIceCandidates,callId,localName)=>{
    return new Promise((resolve, reject) => {
      socket.emit("updateAutoRemoteClientIceCandidates", {remoteSocketId,requestId,answerOffer,localIceCandidates,callId,candidateName:localName,socketId:socket.id}, (response) => {
        console.log(response)
        if (response.success) {
          resolve(response);
        } else {
          reject("Failed to update remote ice candidates");
        }
      });
    });
  }

  const confirmAutoConnectionWithHost=(remoteClientSocket,callId,requestId,status)=>{
    return new Promise((resolve, reject) => {
      socket.emit("confirmAutoConnectionWithHost", {remoteClientSocket,status,callId,requestId,socketId:socket.id}, (response) => {
        console.log(response)
        if (response.success) {
          resolve(response);
        } else {
          reject("Failed to auto confirmConnectionWithHost");
        }
      });
    });
  }
  return {
    init,
    createCall,
    makeJoinCallRequest,
    updateJoinCallRequestStatus,
    updateRemoteClientIceCandidates,
    confirmConnectionWithHost,
    sendAutoAcceptOffer,
    updateAutoRemoteClientIceCandidates,
    confirmAutoConnectionWithHost
  };
};

export default signalEmitter;
