import {
  addJoinRequest,
  addParticipant,
  setSocketId,
} from "../redux/actions/actions";
import store from "../redux/store/store";

const signalListener = () => {
  let socket = null;
  const init = (initializedSocket) => {
    socket = initializedSocket;
    attachSocketIdListener(socket);
    attachJoinRequestListener(socket);
    attachHostOfferListeners(socket);
    attachCandidateICECandidatesListeners(socket);
    attachConnectionConfirmationWithHostListener(socket);
    attachNewParticipantToAddListener(socket);
    attachAutoAcceptedOfferListener(socket);
    attachAutoCandidateICECandidatesListeners(socket);
    attachAutoConnectionConfirmationWithHostListener(socket);
    return socket;
  };

  const attachSocketIdListener = (socket) => {
    socket.on("recieveSocketId", (data) => {
      console.log("received socketId is ", data);
      store.dispatch(setSocketId(data));
    });
  };

  const attachJoinRequestListener = (socket) => {
    //we need redux events here, so that we update ui when ever new event is received
    socket.on("listenJoinRequest", (data) => {
      console.log("New joining request");
      store.dispatch(addJoinRequest(data));
    });
  };

  const attachHostOfferListeners = (socket) => {
    socket.on("listenHostOffer", async (data) => {
      console.log("host offer recieved", data);

      let peerConnectionManager = store.getState().peerConnectionManager;
      let connectionId = data.requestId;
      let hostName = data.hostName;
      let hostOffer = data.hostOffer;
      let hostIceCandidates = data.hostIceCandidates;
      let hostSocketId = data.hostSocketId;
      let requesterName = store.getState().localName;
   
      const constraints = { 
        video: {
          width: { max: 640 },
          height: { max: 480 },
          frameRate: { max: 30 },
        },
        audio: true,
      };

      let localStream = await navigator.mediaDevices.getUserMedia(constraints);

      peerConnectionManager
        .createNewPeerConnection(
          connectionId,
          hostName,
          requesterName,
          hostSocketId
        )
        .then((peerConnection) => {
          console.log(
            "create peer connection to connect with host :",
            peerConnection
          );

          peerConnectionManager.storeRemoteOfferInConnection(
            hostOffer,
            connectionId
          );

          peerConnectionManager.storeRemoteIceCandidates(
            hostIceCandidates,
            connectionId
          );

          peerConnectionManager
            .addLocalStreamIntoConnection(connectionId, localStream)
            .then((peerConnectionWithTracks) => {
              console.log("peerConnectionWithTracks", peerConnectionWithTracks);
              //now setting up remote session description
              peerConnectionManager
                .setRemoteDescription(connectionId, hostOffer)
                .then(() => {
                  console.log(
                    "peerConnectionManager.getPeerConnectionByConnectionId(connectionId)",
                    peerConnectionManager.getPeerConnectionByConnectionId(
                      connectionId
                    )
                  );
                  // setting update remote ice candidates
                  peerConnectionManager
                    .updateRemoteIceCandidates(connectionId)
                    .then(() => {
                      console.log("updated remote ice candidates");
                      //creating answer
                      peerConnectionManager
                        .createOfferAnswer(connectionId)
                        .then((answer) => {
                          console.log("answer", answer);
                        })
                        .catch((e) => {
                          console.error(e);
                        });
                    })
                    .catch((e) => {
                      console.error(e);
                    });
                })
                .catch((e) => {
                  console.error(e);
                });
            })
            .catch((e) => {
              console.error(e);
            });
        })
        .catch((e) => {
          console.error(e);
        });
    });
  };

  const attachCandidateICECandidatesListeners = (socket) => {
    //we need redux events here, so that we update ui when ever new event is received
    socket.on("listenCandidateICECandidates", (data) => {
      console.log("Recieved remote ice candidates for  request id ", data);
      let peerConnectionManager = store.getState().peerConnectionManager;
      let remoteICECandidates = data.payload.localIceCandidates;
      let remoteAnswerOffer = data.payload.answerOffer;
      let connectionId = data.requestId;
      let candidateName = data.payload.candidateName;

      peerConnectionManager.storeRemoteIceCandidates(
        remoteICECandidates,
        connectionId
      );

      peerConnectionManager.storeAnswerOffer(remoteAnswerOffer, connectionId);

      peerConnectionManager
        .setRemoteDescription(connectionId, remoteAnswerOffer)
        .then(() => {
          peerConnectionManager
            .updateRemoteIceCandidates(connectionId)
            .then(() => {
              console.log(
                "update remote ice candidates for connection",
                connectionId
              );
              //adding a new participant
              let remoteStream =
                peerConnectionManager.getPeerConnectionByConnectionId(
                  connectionId
                ).remoteStream;
              let newParticipant = {
                candidateName,
                remoteStream,
              };
              console.log(newParticipant);
              store.dispatch(addParticipant(newParticipant));
              let webRTC = store.getState().webRTC;
              let hostSocketId =
                peerConnectionManager.getPeerConnectionByConnectionId(
                  connectionId
                ).remoteSocketId;

              let callId =
                peerConnectionManager.getPeerConnectionByConnectionId(
                  connectionId
                ).callId;
              webRTC
                .getSignalEmitterHandel()
                .confirmConnectionWithHost(
                  hostSocketId,
                  callId,
                  connectionId,
                  "connected"
                )
                .then((response) => {
                  console.log(response);
                })
                .catch((e) => {
                  console.error(e);
                });
            });
        })
        .catch((e) => {
          console.error(e);
        });
    });
  };

  const attachConnectionConfirmationWithHostListener = (socket) => {
    //we need redux events here, so that we update ui when ever new event is received
    socket.on("listenConnectionConfirmationWithHost", (data) => {
      console.log("Confirmed connection : ", data);
      if (data.status === "connected") {
        let peerConnectionManager = store.getState().peerConnectionManager;
        let remoteStream =
          peerConnectionManager.getPeerConnectionByConnectionId(
            data.requestId
          ).remoteStream;
        let candidateName =
          peerConnectionManager.getPeerConnectionByConnectionId(
            data.requestId
          ).hostName;
        let newParticipant = {
          candidateName,
          remoteStream,
        };
        store.dispatch(addParticipant(newParticipant));
        console.log("Added new participant", newParticipant);
      }
    });
  };

  const attachNewParticipantToAddListener = (socket) => {
    socket.on("listenNewParticipantToAdd", async (data) => {
      console.log("New Participant added in call : ", data);
      //Now need to create new peer connection and send offer to given socket id
      let peerConnectionId = data.requestId;
      let remoteClientSocketId = data.remoteClientSocket;
      let peerConnectionManager = store.getState().peerConnectionManager;
      let candidateName = data.candidateName;

      let localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      peerConnectionManager
        .createNewPeerConnection(
          peerConnectionId,
          "DEFAULT_HOST_NAME",
          candidateName,
          remoteClientSocketId
        )
        .then((peerConnection) => {
          console.log(
            "initialized peerConnection for " + peerConnectionId,
            peerConnection
          );

          //update autoAccept flag true
          peerConnectionManager.updateAutoAcceptFlag(true, peerConnectionId);

          peerConnectionManager
            .addLocalStreamIntoConnection(peerConnectionId, localStream)
            .then((peerConnectionWithTracks) => {
              console.log(
                "added tracks in peerConnection",
                peerConnectionWithTracks
              );
              peerConnectionManager
                .createOffer(peerConnectionId)
                .then((offer) => {
                  console.log("created offer", offer);
                  console.log(
                    "getAllPeerConnections",
                    peerConnectionManager.getAllPeerConnections()
                  );
                  peerConnectionManager.storeOfferInConnection(
                    offer,
                    peerConnectionId
                  );
                });
            })
            .catch((e) => {
              console.error(e);
            });
        })
        .catch((e) => {
          console.error(e);
        });
    });
  };

  const attachAutoAcceptedOfferListener = (socket) => {
    socket.on("getAutoAcceptedOffer", async (data) => {
      console.log("Recieved auto accepted offer : ", data);
      //now create new peer connection and answer of offer.
      let peerConnectionManager = store.getState().peerConnectionManager;
      let connectionId = data.request.requestId;
      let hostName = data.request.hostName;
      let hostOffer = data.request.offer;
      let hostIceCandidates = data.request.hostIceCandidates;
      let hostSocketId = data.request.hostSocketId;
      let requesterName = store.getState().localName;

      const constraints = {
        video: {
          width: { max: 640 },
          height: { max: 480 },
          frameRate: { max: 30 },
        },
        audio: true,
      };

      let localStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("hostIceCandidates-auto-accept",hostIceCandidates);
      peerConnectionManager
        .createNewPeerConnection(
          connectionId,
          hostName,
          requesterName,
          hostSocketId
        )
        .then((peerConnection) => {
          console.log(
            "create peer connection to connect with host :",
            peerConnection
          );

          peerConnectionManager.storeRemoteOfferInConnection(
            hostOffer,
            connectionId
          );

          peerConnectionManager.storeRemoteIceCandidates(
            hostIceCandidates,
            connectionId
          );
          
          peerConnectionManager.updateAutoAcceptFlag(true, connectionId);

          peerConnectionManager
            .addLocalStreamIntoConnection(connectionId, localStream)
            .then((peerConnectionWithTracks) => {
              console.log("peerConnectionWithTracks", peerConnectionWithTracks);
              //now setting up remote session description
              console.log("hostOffer-atuo",hostOffer)
              peerConnectionManager
                .setRemoteDescription(connectionId, hostOffer)
                .then(() => {
                  console.log(
                    "peerConnectionManager.getPeerConnectionByConnectionId(connectionId)",
                    peerConnectionManager.getPeerConnectionByConnectionId(
                      connectionId
                    )
                  );

                  // setting update remote ice candidates
                  peerConnectionManager
                    .updateRemoteIceCandidates(connectionId)
                    .then(() => {
                      console.log("updated remote ice candidates");
                      //creating answer
                      peerConnectionManager
                        .createOfferAnswer(connectionId)
                        .then((answer) => {
                          console.log("answer", answer);
                        })
                        .catch((e) => {
                          console.error(e);
                        });
                    })
                    .catch((e) => {
                      console.error(e);
                    });
                })
                .catch((e) => {
                  console.error(e);
                });
            })
            .catch((e) => {
              console.error(e);
            });
        })
        .catch((e) => {
          console.error(e);
        });
    });
  };

  const attachAutoCandidateICECandidatesListeners = (socket) => {
    //we need redux events here, so that we update ui when ever new event is received
    socket.on("listenAutoCandidateICECandidates", (data) => {
      console.log("Recieved auto remote ice candidates for  request id ", data);

      let peerConnectionManager = store.getState().peerConnectionManager;
      let remoteICECandidates = data.payload.localIceCandidates;
      let remoteAnswerOffer = data.payload.answerOffer;
      let connectionId = data.requestId;
      let candidateName = data.payload.candidateName;

      peerConnectionManager.storeRemoteIceCandidates(
        remoteICECandidates,
        connectionId
      );

      peerConnectionManager.storeAnswerOffer(remoteAnswerOffer, connectionId);

      peerConnectionManager
        .setRemoteDescription(connectionId, remoteAnswerOffer)
        .then(() => {
          peerConnectionManager
            .updateRemoteIceCandidates(connectionId)
            .then(() => {
              console.log(
                "update remote ice candidates for connection",
                connectionId
              );
              //adding a new participant
              let remoteStream =
                peerConnectionManager.getPeerConnectionByConnectionId(
                  connectionId
                ).remoteStream;
              let newParticipant = {
                candidateName,
                remoteStream,
              };
              console.log(newParticipant);
              store.dispatch(addParticipant(newParticipant));
              let webRTC = store.getState().webRTC;
              let hostSocketId =
                peerConnectionManager.getPeerConnectionByConnectionId(
                  connectionId
                ).remoteSocketId;

              let callId =
                peerConnectionManager.getPeerConnectionByConnectionId(
                  connectionId
                ).callId;
                  console.log("Send request of auto confirmation")
              webRTC
                .getSignalEmitterHandel()
                .confirmAutoConnectionWithHost(
                  hostSocketId,
                  callId,
                  connectionId,
                  "connected"
                )
                .then((response) => {
                  console.log(response);
                })
                .catch((e) => {
                  console.error(e);
                });
            });
        })
        .catch((e) => {
          console.error(e);
        });
    });
  };

  const attachAutoConnectionConfirmationWithHostListener = (socket) => {
    //we need redux events here, so that we update ui when ever new event is received
    socket.on("listenAutoConnectionConfirmationWithHost", (data) => {
      console.log("Confirmed connection : ", data);
      if (data.status === "connected") {
        let peerConnectionManager = store.getState().peerConnectionManager;
        let remoteStream =
          peerConnectionManager.getPeerConnectionByConnectionId(
            data.requestId
          ).remoteStream;
        let candidateName =
          peerConnectionManager.getPeerConnectionByConnectionId(
            data.requestId
          ).hostName;
        let newParticipant = {
          candidateName,
          remoteStream,
        };
        store.dispatch(addParticipant(newParticipant));
        console.log("Added new participant", newParticipant);
      }
    });
  };
  return {
    init,
  };
};

export default signalListener;
