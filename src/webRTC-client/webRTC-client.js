import signalServer from "./signal-server";

const webRTCClient = () => {
  let addedTracks = new Set();
  let signalSocket = null;
  let localStream = null;
  let remoteStream = null;
  let peerConnection = null;
  let socket = null;

  const init = (signalServerUrl) => {
    signalSocket = signalServer();
    console.log(signalSocket);
    socket = signalSocket.init(signalServerUrl);
    peerConnection = new RTCPeerConnection();
    
    peerConnection.ontrack = function (event) {
      console.log("remote track received:", event);
      remoteStream = event.streams[0];
    };

    peerConnection.onnegotiationneeded = async function (event) {
      console.log("onnegotiationneeded ", event);
      try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        signalSocket.getCallId("zee").then((callId)=>{
          signalSocket
          .initiateCall("zee", '0010', offer, signalSocket.getSocketId())
          .then((callStatus) => {
            console.log("Call initiated successfully:", callStatus);
          })
          .catch((error) => {
            console.error("Failed to initiate call:", error);
            
          });
        }).catch((e)=>{
          console.error(e)
        })
        
      } catch (error) {
        console.error("Error creating offer:", error);
        
      }
    };

    peerConnection.onicecandidate = function (event) {
      console.log("onicecandidate  ", event);
    };

    peerConnection.oniceconnectionstatechange = function (event) {
      console.log(
        "oniceconnectionstatechange ",
        peerConnection.iceConnectionState
      );
    };
    return signalSocket;
  };

  const startCall = async (userName, callId, socketId) => {
    try {
      await openLocalCameraAndStream();
      return new Promise((resolve, reject) => {
        signalSocket
          .initiateCall(userName, callId, null, socketId)
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
  // const init = (signalServerUrl) => {
  //   signalSocket = signalServer();
  //   console.log(signalSocket);
  //   socket = signalSocket.init(signalServerUrl);
  //   peerConnection = new RTCPeerConnection();

  //   peerConnection.ontrack = function (event) {
  //     console.log("remote track received:", event);
  //     remoteStream = event.streams[0];
  //   };

  //   peerConnection.onnegotiationneeded = function (event) {
  //     console.log("onnegotiationneeded ", event);
  //   };
  //   peerConnection.onicecandidate = function (event) {
  //     console.log("onicecandidate  ", event);
  //   };
  //   peerConnection.oniceconnectionstatechange = function(event) {
  //     console.log("oniceconnectionstatechange ", peerConnection.iceConnectionState);
  //   };
  //   return signalSocket;
  // };

  // const startCall = async (userName, callId, socketId) => {
  //   try {
  //     await openLocalCameraAndStream();
  //     const offer = await peerConnection.createOffer();
  //     await peerConnection.setLocalDescription(offer);
  //     return new Promise((resolve, reject) => {
  //       signalSocket
  //         .initiateCall(userName, callId, offer, socketId)
  //         .then((callStatus) => {
  //           console.log("Call initiated successfully:", callStatus);
  //           resolve(callStatus);
  //         })
  //         .catch((error) => {
  //           console.error("Failed to initiate call:", error);
  //           reject(error);
  //         });
  //     });
  //   } catch (error) {
  //     console.error("Error starting call:", error);
  //     return Promise.reject(error);
  //   }
  // };

  const joinCall = async (offer, socketId, callId, userName) => {
    try {
      openLocalCameraAndStream();

      const remoteOffer = new RTCSessionDescription(offer);
      await peerConnection.setRemoteDescription(remoteOffer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      // Wrap the joinCall request with a Promise
      const joinRequestPromise = new Promise((resolve, reject) => {
        signalSocket
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
  const createJoinRequest = (userName, callId, socketId) => {
    return new Promise((resolve, reject) => {
      console.log("calling makeJoinRequest webRTC");
      signalSocket
        .createJoinRequest(userName, callId, socketId)
        .then(async (requestResponse) => {
          console.log(requestResponse);
          await openLocalCameraAndStream();
          resolve(requestResponse);
        })
        .catch((error) => {
          console.log(error);
          reject(new Error(error.message));
        });
    });
  };

  const addUserInCall = async (userName, socketId, remoteOffer) => {
    try {
      const desc = new RTCSessionDescription(remoteOffer);
      await peerConnection.setRemoteDescription(desc);

      console.log("added user" + userName + " in call");
    } catch (e) {
      console.error("Error while adding user into call", e);
    }
  };
  const openLocalCameraAndStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    localStream = stream;
    localStream.getTracks().forEach((track) => {
      if (!addedTracks.has(track.id)) {
        // Check if the track has already been added
        peerConnection.addTrack(track, localStream);
        addedTracks.add(track.id); // Add the track ID to the addedTracks Set
      }
    });
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

  const getPeerConnection = () => {
    return peerConnection;
  };
  return {
    init,
    startCall,
    joinCall,
    stopCall,
    getLocalStream,
    getRemoteStream,
    openLocalCameraAndStream,
    addUserInCall,
    getPeerConnection,
    createJoinRequest,
  };
};

export default webRTCClient;
