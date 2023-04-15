import { addJoinRequest, addParticipant, setSocketId } from "../redux/actions/actions";
import store from "../redux/store/store";

const signalListener = () => {
  let socket = null;
  const init = (initializedSocket) => {
    socket = initializedSocket;
    attachSocketIdListener(socket);
    attachJoinRequestListener(socket);
    attachHostOfferListeners(socket);
    attachCandidateICECandidatesListeners(socket)
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
    socket.on("listenHostOffer", (data) => {
      console.log("host offer recieved", data);
     
      let peerConnectionManager = store.getState().peerConnectionManager;
      let connectionId = data.requestId;
      let hostName = data.hostName;
      let hostOffer = data.hostOffer;
      let hostIceCandidates = data.hostIceCandidates;
      let hostSocketId = data.hostSocketId;
      let requesterName = store.getState().localName;
      let localStream = store.getState().localStream;
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
                  console.log("peerConnectionManager.getPeerConnectionByConnectionId(connectionId)",peerConnectionManager.getPeerConnectionByConnectionId(connectionId))
                  // setting update remote ice candidates
                  peerConnectionManager
                    .updateRemoteIceCandidates(connectionId)
                    .then(() => {
                      console.log("updated remote ice candidates");
                      //creating answer
                      peerConnectionManager
                        .createOfferAnswer(connectionId)
                        .then((answer) => {
                          console.log("answer",answer);
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
      console.log("Recieved remote ice candidates for  request id ",data);;
      let peerConnectionManager = store.getState().peerConnectionManager;
      let remoteICECandidates = data.payload.localIceCandidates;
      let remoteAnswerOffer = data.payload.answerOffer
      let connectionId = data.requestId;
      let candidateName = data.payload.candidateName
      peerConnectionManager.storeRemoteIceCandidates(remoteICECandidates,connectionId);
      peerConnectionManager.setRemoteDescription(connectionId,remoteAnswerOffer).then(()=>{
        peerConnectionManager.updateRemoteIceCandidates(connectionId).then(()=>{
          console.log("update remote ice candidates for connection",connectionId)
          //adding a new participant 
          let remoteStream = peerConnectionManager.getPeerConnectionByConnectionId(connectionId).remoteStream;
          let newParticipant = {
            candidateName,
            remoteStream
          }
          console.log(newParticipant)
          store.dispatch(addParticipant(newParticipant))
          //TODO:Emit an event to confirm to remote candidate that we have recieved its ICE candidates
        })
      }).catch((e)=>{
        console.error(e)
      })
    });
  };  

  return {
    init,
  };
};

export default signalListener;
