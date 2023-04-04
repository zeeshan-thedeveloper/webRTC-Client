import signalServer from "./signal-server";

const webRTCClient = () => {
  let signalSocket = null;
  let localStream = null;
  let remoteStream = null;
  let peerConnection = null;
  let socket = null;
  const init = (signalServerUrl) => {
    signalSocket = signalServer();
    console.log(signalSocket);
    socket = signalSocket.init(signalServerUrl);
    console.log(socket);
    return signalSocket;
  };

  const startCall = async (userName, callId, socketId) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      localStream = stream;

      peerConnection = new RTCPeerConnection();

      localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
      });

      peerConnection.ontrack = (event) => {
        console.log("Remote stream received : ", event.streams);
        remoteStream = event.streams[0];
      };

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      return new Promise((resolve, reject) => {
        signalSocket
          .initiateCall(userName, callId, offer, socketId)
          .then((callStatus) => {
            console.log("Call initiated successfully:", callStatus);
            resolve(callStatus);
          })
          .catch((error) => {
            console.error("Failed to initiate call:", error);
            reject(error);
          });
      });
    } catch (error) {
      console.error("Error starting call:", error);
      return Promise.reject(error);
    }
  };

  const joinCall = async (offer, socketId, callId, userName) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      localStream = stream;
      peerConnection = new RTCPeerConnection();
      localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
      });

      peerConnection.ontrack = (event) => {
        remoteStream = event.streams[0];
      };
      const remoteOffer = new RTCSessionDescription(offer);
      await peerConnection.setRemoteDescription(remoteOffer);

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      // Wrap the joinCall request with a Promise
      const joinRequestPromise = new Promise((resolve, reject) => {
        signalServer
          .joinCall(userName, callId, socketId, answer)
          .then((requestResponse) => {
            resolve(requestResponse);
          })
          .catch((error) => {
            reject(error);
          });
      });

      // Return the joinRequestPromise
      return joinRequestPromise;
    } catch (error) {
      console.error("Error joining call:", error);
    }
  };

  const stopCall = () => {
    localStream.getTracks().forEach((track) => {
      track.stop();
    });
    localStream = null;
    peerConnection.close();
    peerConnection = null;
  };

  const getLocalStream = () => {
    return localStream;
  };

  const getRemoteStream = () => {
    return remoteStream;
  };
  return {
    init,
    startCall,
    joinCall,
    stopCall,
    getLocalStream,
    getRemoteStream,
  };
};

export default webRTCClient;
