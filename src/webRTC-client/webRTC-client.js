import signalServer from "./signal-server";

const webRTCClient = () => {
  let addedTracks = new Set();
  let signalSocket = null;
  let localStream = null;
  let remoteStream = null;
  let peerConnection = null;
  let socket = null;
  let iceCandidates = [];
  let remoteIceCandidates = [];

  const init = (signalServerUrl) => {
    signalSocket = signalServer();
    console.log(signalSocket);
    socket = signalSocket.init(signalServerUrl);

    console.log("initializing RTCPeerConnection()");
    peerConnection = new RTCPeerConnection();
    // Create a dummy data channel to trigger ICE candidate gathering.

    peerConnection.ontrack = function (event) {
      console.log("remote track received:", event);
      remoteStream = event.streams[0];
    };

    peerConnection.onnegotiationneeded = async function (event) {
      console.log("onnegotiationneeded ", event);
    };

    peerConnection.onicecandidate = function (event) {
      //collect all candidates and send them to signal server

      if (event.candidate) {
        console.log(event.candidate);
        iceCandidates.push(event.candidate);
      }
    };

    peerConnection.onicegatheringstatechange = function (event) {
      console.log(
        "ICE gathering state changed to: " + peerConnection.iceGatheringState
      );
      if (peerConnection.iceGatheringState === "complete") {
        // All ICE candidates have been gathered, can proceed with ICE negotiation
        signalSocket.sendNewIceCandidate(
          signalSocket.getSocketId(),
          iceCandidates
        );
      }
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
        peerConnection
          .createOffer()
          .then((offer) => {
            return peerConnection.setLocalDescription(offer);
          })
          .then(() => {
            signalSocket
              .initiateCall(
                userName,
                callId,
                peerConnection.localDescription,
                socketId
              )
              .then((callStatus) => {
                console.log("Call initiated successfully:", callStatus);
                resolve(callStatus);
              })
              .catch((error) => {
                console.error("Failed to initiate call:", error);
                reject(error);
              });
          })
          .catch((error) => {
            reject(error);
            console.error("Error creating an offer.", error);
          });
      });
    } catch (error) {
      console.error("Error starting call:", error);
      return Promise.reject(error);
    }
  };

  const joinCall = async (offer, socketId, callId, userName) => {
    try {
      openLocalCameraAndStream();

      const remoteOffer = new RTCSessionDescription(offer);
      await peerConnection.setRemoteDescription(remoteOffer);

      try {
        const iceCandidates = await getRemoteICEClientsByCallId(callId);
        console.log("iceCandidates", iceCandidates);
        iceCandidates.forEach((candidateObj) => {
          const candidate = new RTCIceCandidate(candidateObj);
          peerConnection
            .addIceCandidate(candidate)
            .then(() => {
              console.log("ICE candidate added successfully");
            })
            .catch((error) => {
              console.error("Error adding ICE candidate:", error);
            });
        });
        // Process the received ICE candidates
      } catch (error) {
        console.error("Error getting remote ICE candidates:", error);
      }

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      let localIceCandidates = null;
      // Wrap the joinCall request with a Promise
      try {
        localIceCandidates = await getRemoteICEClientsByCallId(callId);
        console.log("localIceCandidates", localIceCandidates);
      } catch (e) {
        console.error(e);
      }

      const joinRequestPromise = new Promise((resolve, reject) => {
        signalSocket
          .joinCall(userName, callId, socketId, answer, localIceCandidates)
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
      console.log("making JoinRequest");
      signalSocket
        .createJoinRequest(userName, callId, socketId)
        .then(async (requestResponse) => {
          console.log(requestResponse);
          remoteIceCandidates.push({
            callId,
            remoteIceCandidates:
              requestResponse.hostIceCandidates.iceCandidates,
          });
          console.log("remoteIceCandidates :", remoteIceCandidates);
          await openLocalCameraAndStream();
          resolve(requestResponse);
        })
        .catch((error) => {
          console.log(error);
          reject(new Error(error.message));
        });
    });
  };

  const addUserInCall = async (
    userName,
    socketId,
    remoteOffer,
    remoteICECandidates
  ) => {
    try {
      const desc = new RTCSessionDescription(remoteOffer);
      await peerConnection.setRemoteDescription(desc);
      try {
        console.log(
          "setting up remote ice candidates on host : ",
          remoteICECandidates
        );
        remoteICECandidates.forEach((candidateObj) => {
          const candidate = new RTCIceCandidate(candidateObj);
          peerConnection
            .addIceCandidate(candidate)
            .then(() => {
              console.log("ICE candidate added successfully");
            })
            .catch((error) => {
              console.error("Error adding ICE candidate:", error);
            });
        });
        // Process the received ICE candidates
      } catch (error) {
        console.error("Error getting remote ICE candidates:", error);
      }
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

// Pause video sharing
function stopSharingVideo() {
  const localStreams = peerConnection.getLocalStreams();

  localStreams.forEach((stream) => {
    stream.getVideoTracks().forEach((videoTrack) => {
      videoTrack.enabled = false; // Pause the video
    });
  });
}

// Resume video sharing
function resumeSharingVideo() {
  const localStreams = peerConnection.getLocalStreams();

  localStreams.forEach((stream) => {
    stream.getVideoTracks().forEach((videoTrack) => {
      videoTrack.enabled = true; // Resume the video
    });
  });
}

// Mute audio sharing
function stopSharingAudio() {
  const localStreams = peerConnection.getLocalStreams();

  localStreams.forEach((stream) => {
    stream.getAudioTracks().forEach((audioTrack) => {
      audioTrack.enabled = false; // Mute the audio
    });
  });
}

// Unmute audio sharing
function resumeSharingAudio() {
  const localStreams = peerConnection.getLocalStreams();

  localStreams.forEach((stream) => {
    stream.getAudioTracks().forEach((audioTrack) => {
      audioTrack.enabled = true; // Unmute the audio
    });
  });
}


  
  const getLocalStream = () => {
    return localStream;
  };

  const getRemoteStream = () => {
    return remoteStream;
  };

  const getPeerConnection = () => {
    return peerConnection;
  };

  const getRemoteICEClientsByCallId = (callId) => {
    return new Promise((resolve, reject) => {
      let iceCandidates = null;
      remoteIceCandidates.forEach((remoteCand) => {
        console.log("Looking for remote ice candidates: ", remoteCand);
        if (remoteCand.callId === callId) {
          console.log("Found candidates: ", remoteCand);
          iceCandidates = remoteCand.remoteIceCandidates;
        }
      });

      if (iceCandidates) {
        resolve(iceCandidates);
      } else {
        reject(
          new Error("No remote ICE candidates found for the given call ID.")
        );
      }
    });
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
    getRemoteICEClientsByCallId,
    stopSharingAudio,
    stopSharingVideo,
    resumeSharingAudio,
    resumeSharingVideo,
  };
};

export default webRTCClient;
