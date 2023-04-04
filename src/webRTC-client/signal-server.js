import io from "socket.io-client";

const signalServer = () => {
  let signalServerUrl = null;
  let socket = null;
  let socketId = null;
  const init = (signalServerUrl) => {
    signalServerUrl = signalServerUrl;
    console.log("signalServerUrl", signalServerUrl);
    socket = io(signalServerUrl, { transports: ["websocket"] });
    socket.on("message", (data) => {
      console.log("message from server : " + data);
    });

    socket.on("connect", (data) => {
      console.log("connected to server : ");
    });

    // TODO:we need to replace socket id with device id mechanism

    socket.on("socketId",(id)=>{
      socketId=id
      console.log("Storing socket id : "+id)
    })

    return socket;
  };

  const initiateCall = (userName, callId, offer,socketId) => {
    return new Promise((resolve, reject) => {
      const payload = { userName, callId, offer,socketId };
      socket.emit("initiate-call", payload, (callStatus) => {
        if (callStatus.success) {
          resolve(callStatus);
        } else {
          reject(new Error(callStatus.message));
        }
      });
    });
  };

  const joinCall = (userName, callId, socketId, joinOffer) => {
    return new Promise((resolve, reject) => {
      const payload = { userName, callId, joinOffer,socketId };
      socket.emit("joinCall", payload, (joinStatus) => {
        if (joinStatus.success) {
          resolve(joinStatus);
        } else {
          reject(new Error(joinStatus.message));
        }
      });
    });
  };
  const createJoinRequest = (userName, callId, socketId) => {
    return new Promise((resolve, reject) => {
      const payload = { userName, callId ,socketId };
      socket.emit("makeJoinRequest", payload, (joinStatus) => {
        if (joinStatus.success) {
          resolve(joinStatus);
        } else {
          reject(new Error(joinStatus.message));
        }
      });
    });
  };
  
  const sendAcceptJoinRequest=(callId,socketId)=>{
    return new Promise((resolve, reject) => {
      const payload = { callId ,socketId };
      socket.emit("sendAcceptJoinRequest", payload, (joinStatus) => {
        if (joinStatus.success) {
          resolve(joinStatus);
        } else {
          reject(new Error(joinStatus.message));
        }
      });
    });
  }

  const getCallId = (userName) => {
    return new Promise((resolve, reject) => {
      socket.emit("getCallId", userName);
      socket.on("sentCallId", (callId) => {
        resolve(callId);
      });
      socket.on("error", (error) => {
        reject(error);
      });
    });
  };
  
  const getSocketId=()=>{
    return socketId;
  }
  const getSocket=()=>{
    return socket;
  }
  return { init, initiateCall, joinCall, getCallId,getSocketId,getSocket,createJoinRequest,sendAcceptJoinRequest};
};

export default signalServer;
