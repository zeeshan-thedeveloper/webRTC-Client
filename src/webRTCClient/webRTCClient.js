import { io } from "socket.io-client";
import signalEmitter from "./signalEmitter";
import signalListener from "./signalListner";

const webRTCClient = () => {
  let socket = null;
  let signalEmitterHandel = null;
  const init = (socketUrl) => {
    socket = io(socketUrl, { transports: ["websocket"] });
    signalListener().init(socket);
    signalEmitterHandel = signalEmitter();
    signalEmitterHandel.init(socket);
    return socket;
  };

  const createCall = (callTitle, callDescription,callType) => {
    return new Promise((resolve, reject) => {
      signalEmitterHandel
        .createCall(callTitle, callDescription,callType)
        .then((response) => {
          // If the call was successfully started, resolve the promise
          resolve(response);
        })
        .catch((error) => {
          // If there was an error starting the call, reject the promise
          reject(error);
        });
    });
  };

  const joinCall = (candidateName,callId) => {
    return new Promise((resolve, reject) => {
      signalEmitterHandel
        .makeJoinCallRequest(callId, candidateName)
        .then((response) => {
          resolve(response);
        })
        .catch((e) => {
          reject(e);
        });
    });
  };
 
  const acceptCall = (requestId) => {
    return new Promise((resolve, reject) => {
      signalEmitterHandel
        .updateJoinCallRequestStatus(requestId,"admitted")
        .then((response) => {
          resolve(response);
        })
        .catch((e) => {
          reject(e);
        });
    });
  };

  const rejectCall = (requestId) => {
    return new Promise((resolve, reject) => {
      signalEmitterHandel
        .updateJoinCallRequestStatus(requestId,"declined")
        .then((response) => {
          resolve(response);
        })
        .catch((e) => {
          reject(e);
        });
    });
  };

  return {
    init,
    createCall,
    joinCall,
    acceptCall,
    rejectCall,
  };
};

export default webRTCClient;
