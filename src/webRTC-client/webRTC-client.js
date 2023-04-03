import signalServer from "./signal-server";

const webRTCClient = () => {
  const localVideo = document.getElementById("localVideo");
  const remoteVideo = document.getElementById("remoteVideo");
  let signalSocket = null;
  let localStream = null;
  let peerConnection = null;
  let socket = null;
  const init = (signalServerUrl) => {
    signalSocket = signalServer();
    console.log(signalSocket);
    socket = signalSocket.init(signalServerUrl);
    console.log(socket);
    return signalSocket;
  };

  const startCall = async (userName, callId) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      localStream = stream;
      //localVideo.srcObject = localStream;
      //remoteVideo.autoplay = true;

      peerConnection = new RTCPeerConnection();

      localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
      });

      peerConnection.ontrack = (event) => {
        console.log("Remote stream recieved : ",event.streams)
        //remoteVideo.srcObject = event.streams[0];
      };

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      // TODO: Send offer to remote peer
      // ...

      return new Promise((resolve, reject) => {
        signalSocket
          .initiateCall(userName, callId, offer)
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

  const joinCall = async (offer) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      localStream = stream;
      localVideo.srcObject = localStream;
      remoteVideo.autoplay = true;

      // TODO: Implement WebRTC signaling
      // ...

      peerConnection = new RTCPeerConnection();
      localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
      });
      peerConnection.ontrack = (event) => {
        remoteVideo.srcObject = event.streams[0];
      };

      await peerConnection.setRemoteDescription(offer);

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      //getting call id :

      // TODO: Send answer to remote peer
      // ...
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

  return {
    init,
    startCall,
    joinCall,
    stopCall,
    localVideo,
    remoteVideo,
  };
};

export default webRTCClient;
