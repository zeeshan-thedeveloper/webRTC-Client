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

  const createOneToOneCall = (callTitle, callDescription) => {
    return new Promise((resolve, reject) => {
      signalEmitterHandel
        .startOneToOneCall(callTitle, callDescription)
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

  const createGroupCall = (callTitle, callDescription) => {
    // this will be only storing an object on signal server which will be having all details of call. For example candidates and their information
  };

  const joinOneToOneCall = (candidateName,callId) => {
    return new Promise((resolve, reject) => {
      signalEmitterHandel
        .makeOneToOneCallJoiningRequest(callId, candidateName)
        .then((response) => {
          resolve(response);
        })
        .catch((e) => {
          reject(e);
        });
    });
  };

  const joinGroupCall = (callId) => {
    //this will only emit an message containing socket id and call id. After that signal server will add this request in joinRequests cache and by searching
    //in calls cache signal server will try to find socket id of host and then will notify it about this join request.
  };

  const acceptOneToOneCall = (requestId) => {};

  const acceptGroupCall = (requestId) => {};

  const rejectOneToOneCall = (requestId) => {};

  const rejectGroupCall = (requestId) => {};
  return {
    init,
    createOneToOneCall,
    createGroupCall,
    joinGroupCall,
    joinOneToOneCall,
    acceptGroupCall,
    acceptOneToOneCall,
    rejectGroupCall,
    rejectOneToOneCall,
  };
};

export default webRTCClient;
