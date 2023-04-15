import store from "../redux/store/store";

const RTCPeerConnectionManager = () => {
  const peerConnections = {};
  let signalListener = null;
  let signalEmitter = null;
  let addedTracks = new Set();
  const init = () => {};

  const createNewPeerConnection = (
    connectionId,
    hostName,
    clientName,
    remoteSocketId
  ) => {
    return new Promise((resolve, reject) => {
      // Create a new RTCPeerConnection object
      let localSocketId = store.getState().socketId;
      let callId = store.getState().callId;
      let localStream = store.getState().localStream;

      const peerConnection = new RTCPeerConnection();

      // Store the RTCPeerConnection object in the peerConnections object
      peerConnections[connectionId] = {
        connection: peerConnection,
        hostName,
        clientName,
        remoteSocketId,
        localSocketId,
        callId,
        localStream: localStream,
        remoteStream: null,
        remoteIceCandidates: [],
        localIceCandidates: [],
        offer: null,
        remoteOffer: null,
        answer: null,
        listeners: {
          onicecandidate: (event) => {
            console.log(`onicecandidate event for connection ${connectionId}`);

            if (event.candidate != null) {
              peerConnections[connectionId].localIceCandidates.push(
                event.candidate
              );
              console.log(
                `Updating new ICE candidate of connection ${connectionId} candidate : ${event.candidate.candidate}`
              );
            } else {
              // All ICE candidates have been gathered

              console.log(
                `All ICE candidates have been gathered for connection ${connectionId}`
              );

              const localIceCandidates =
                peerConnections[connectionId].localIceCandidates;
              const remoteIceCandidates =
                peerConnections[connectionId].remoteIceCandidates;
              const offer = peerConnections[connectionId].offer;
              const answerOffer = peerConnections[connectionId].answer;
              const remoteSocketId =
                peerConnections[connectionId].remoteSocketId;
              const callId = peerConnections[connectionId].callId;
              let webRTC = store.getState().webRTC;

              if (localIceCandidates.length > 0) {
                //TODO:NEED TO EMIT EVENT TO UPDATE ICE CANDIDATES FOR GIVEN CLIENT SOCKET ID

                //We need to check first if remote host ice candidates are stored or not? if yes then we need to emit updateRemoteClientIceCandidates
                if (remoteIceCandidates.length == 0) {
                  console.log(
                    `Sending request accepted request to signal server for request id : ${connectionId}`
                  );
                  webRTC
                    .getSignalEmitterHandel()
                    .updateJoinCallRequestStatus(
                      connectionId,
                      localIceCandidates,
                      offer,
                      "admitted"
                    )
                    .then((response) => {
                      console.log(response);
                    })
                    .catch((e) => {
                      console.error(e);
                    });
                } else {
                  //emit : updateRemoteClientIceCandidates
                  console.log("updateRemoteClientIceCandidates");
                  webRTC
                    .getSignalEmitterHandel()
                    .updateRemoteClientIceCandidates(
                      remoteSocketId,
                      connectionId,
                      answerOffer,
                      localIceCandidates,
                      callId
                    )
                    .then((response) => {
                      console.log(response)
                    })
                    .catch((e) => {
                      console.log(e);
                    });
                }
              } else {
                // emitting event to accept join request.
              }
            }
          },
          ontrack: (event) => {
            console.log(`ontrack event for connection ${connectionId}`, event);
            peerConnections[connectionId].remoteStream = event.streams[0];
            console.log("Stored remote stream");
          },
          onconnectionstatechange: (event) => {
            console.log(
              `onconnectionstatechange event for connection ${connectionId}`,
              event
            );
          },
        },
      };

      // Attach listeners to the RTCPeerConnection object
      peerConnection.addEventListener(
        "icecandidate",
        peerConnections[connectionId].listeners.onicecandidate
      );
      peerConnection.addEventListener(
        "track",
        peerConnections[connectionId].listeners.ontrack
      );
      peerConnection.addEventListener(
        "connectionstatechange",
        peerConnections[connectionId].listeners.onconnectionstatechange
      );

      // Resolve the promise with the new RTCPeerConnection object
      resolve(peerConnection);
    });
  };

  
  const addLocalStreamIntoConnection = (connectionId, localStream) => {
    return new Promise((resolve, reject) => {
      let connection = peerConnections[connectionId].connection;
      peerConnections[connectionId].localStream = localStream;
      const tracks = localStream.getTracks();
      let promises = [];

      tracks.forEach((track) => {
        if (!addedTracks.has(track.id)) {
          // Check if the track has already been added
          promises.push(connection.addTrack(track, localStream));
          addedTracks.add(track.id); // Add the track ID to the addedTracks Set
        }
      });

      Promise.all(promises)
        .then(() => {
          resolve(connection);
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  //remoteOffer will be sent from server when host/manager will accept join request.
  const createOffer = (connectionId) => {
    return new Promise((resolve, reject) => {
      //get peer connection by using connection id
      const connection = peerConnections[connectionId].connection;
      connection
        .createOffer()
        .then((offer) => {
          // Set local description
          connection.setLocalDescription(offer);
          resolve(offer);
        })
        .catch((error) => {
          console.log("error creating offer:", error);
          reject(error);
        });
    });
  };

  const storeOfferInConnection = (offer, connectionId) => {
    peerConnections[connectionId].offer = offer;
  };
  const storeRemoteOfferInConnection = (offer, connectionId) => {
    peerConnections[connectionId].remoteOffer = offer;
  };

  const createOfferAnswer = (connectionId) => {
    //get peer connection by using connection id
    return new Promise((resolve, reject) => {
      const connection = peerConnections[connectionId].connection;
      connection
        .createAnswer()
        .then((answer) => {
          connection
            .setLocalDescription(answer)
            .then(() => {
              peerConnections[connectionId].answer = answer;
              console.log("generated answer and stored in connection ");
              resolve(answer);
            })
            .catch((e) => {
              console.error(e);
              reject(e);
            });
        })
        .catch((e) => {
          console.error(e);
        });
    });
  };

  const storeRemoteIceCandidates = (iceCandidates, connectionId) => {
    peerConnections[connectionId].remoteIceCandidates = iceCandidates;
    console.log(
      "peerConnections[connectionId].remoteIceCandidates",
      peerConnections[connectionId].remoteIceCandidates
    );
  };

  // const updateRemoteIceCandidates = async (connectionId) => {
  //   try {
  //     const connection = peerConnections[connectionId].connection;
  //     if (!connection) {
  //       throw new Error(`Connection with ID ${connectionId} not found`);
  //     }
  //     if (!peerConnections[connectionId].remoteIceCandidates) {
  //       throw new Error(
  //         `No remote ICE candidates found for connection ${connectionId}`
  //       );
  //     }
  //     for (const candidateObj of peerConnections[connectionId]
  //       .remoteIceCandidates) {
  //       const candidate = new RTCIceCandidate(candidateObj);
  //       await connection.addIceCandidate(candidate);
  //       console.log(
  //         `ICE candidate added successfully for connection ${connectionId}`
  //       );
  //     }
  //   } catch (error) {
  //     console.error(
  //       `Error adding ICE candidate for connection ${connectionId}:`,
  //       error
  //     );
  //   }
  // };

  const updateRemoteIceCandidates = (connectionId) => {
    return new Promise((resolve, reject) => {
      const connection = peerConnections[connectionId].connection;
      if (!connection) {
        reject(new Error(`Connection with ID ${connectionId} not found`));
      }
      if (!peerConnections[connectionId].remoteIceCandidates) {
        reject(
          new Error(
            `No remote ICE candidates found for connection ${connectionId}`
          )
        );
      }
      const candidatesToAdd = peerConnections[
        connectionId
      ].remoteIceCandidates.map(
        (candidateObj) => new RTCIceCandidate(candidateObj)
      );
      Promise.all(
        candidatesToAdd.map((candidate) =>
          connection.addIceCandidate(candidate)
        )
      )
        .then(() => {
          console.log(
            `All ICE candidates added successfully for connection ${connectionId}`
          );
          resolve();
        })
        .catch((error) => {
          console.error(
            `Error adding ICE candidates for connection ${connectionId}:`,
            error
          );
          reject(error);
        });
    });
  };

  const storeLocalIceCandidates = (iceCandidates, connectionId) => {
    peerConnections[connectionId].localIceCandidates = iceCandidates;
  };

  const setRemoteDescription = (connectionId, remoteOffer) => {
    const desc = new RTCSessionDescription(remoteOffer);

    return new Promise((resolve, reject) => {
      peerConnections[connectionId].connection
        .setRemoteDescription(desc)
        .then(() => {
          console.log("Remote description set successfully for connection : ",connectionId);
          resolve();
        })
        .catch((error) => {
          console.log("Error setting remote description:", error);
          reject(error); // reject the error to the calling function
        });
    });
  };

  const getRemoteStream = (connectionId) => {
    const connection = peerConnections[connectionId];
    if (!connection) {
      throw new Error(`Connection with ID ${connectionId} does not exist.`);
    }
    if (!connection.remoteStream) {
      throw new Error(
        `No remote stream found for connection with ID ${connectionId}.`
      );
    }
    return connection.remoteStream;
  };

  const getPeerConnectionByConnectionId = (connectionId) => {
    return peerConnections[connectionId];
  };

  return {
    init,
    addLocalStreamIntoConnection,
    createNewPeerConnection,
    createOffer,
    createOfferAnswer,
    storeRemoteIceCandidates,
    storeLocalIceCandidates,
    updateRemoteIceCandidates,
    setRemoteDescription,
    getRemoteStream,
    storeOfferInConnection,
    storeRemoteOfferInConnection,
    getPeerConnectionByConnectionId,
  };
};

export default RTCPeerConnectionManager;
