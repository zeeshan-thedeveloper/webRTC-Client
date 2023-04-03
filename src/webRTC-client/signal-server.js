import io from "socket.io-client";

const signalServer = () => {
  let signalServerUrl = null;
  let socket = null;
  const init = (signalServerUrl) => {
    signalServerUrl = signalServerUrl;
    console.log("signalServerUrl", signalServerUrl);
    socket = io(signalServerUrl, { transports: ["websocket"] });
    socket.on("message", (data) => {
      console.log("message from server : " + data);
    });

    socket.on("connect", () => {
      console.log("connected to server : ");
    });

    return socket;
  };

  const initiateCall = (userName, callId, offer) => {
    return new Promise((resolve, reject) => {
      const payload = { userName, callId, offer };
      socket.emit("initiate-call", payload, (callStatus) => {
        if (callStatus.success) {
          resolve(callStatus);
        } else {
          reject(new Error(callStatus.message));
        }
      });
    });
  };

  const joinCall = (callId) => {};
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

  return { init, initiateCall, joinCall, getCallId };
};

export default signalServer;
