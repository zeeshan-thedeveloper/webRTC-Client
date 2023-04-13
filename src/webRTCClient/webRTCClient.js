import { io } from "socket.io-client";
import signalEmitter from "./signalEmitter";

const webRTCClient = () => {
  let socket = null;
//   let signalEmitter = null;
  const init = (socketUrl) => {
    socket = io(socketUrl, { transports: ["websocket"] });
    return { socket };
  };

  const createOneToOneCall = (callTitle, callDescription) => {
    // this will be only storing an object on signal server which will be having all details of call. For example candidates and their information
  };

  const createGroupCall = (callTitle, callDescription) => {
    // this will be only storing an object on signal server which will be having all details of call. For example candidates and their information
  };

  const joinOneToOneCall = (callId) => {
    //this will only emit an message containing socket id and call id. After that signal server will add this request in joinRequests cache and by searching 
    //in calls cache signal server will try to find socket id of host and then will notify it about this join request.
  };

  const joinGroupCall = (callId) => {
     //this will only emit an message containing socket id and call id. After that signal server will add this request in joinRequests cache and by searching 
     //in calls cache signal server will try to find socket id of host and then will notify it about this join request.
  };

  const acceptOneToOneCall=(requestId)=>{

  }

  const acceptGroupCall=(requestId)=>{

  }

  const rejectOneToOneCall=(requestId)=>{

  }
  
  const rejectGroupCall=(requestId)=>{

  }
  return {
    init,
    createOneToOneCall,
    createGroupCall,
    joinGroupCall,
    joinOneToOneCall,
    acceptGroupCall,
    acceptOneToOneCall,
    rejectGroupCall,
    rejectOneToOneCall
  };
};

export default webRTCClient;
