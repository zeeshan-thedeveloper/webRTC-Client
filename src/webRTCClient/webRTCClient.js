import { io } from "socket.io-client";
import signalEmitter from "./signalEmitter";
import signalListener from "./signalListner";
import store from "../redux/store/store";

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

  const createCall = (callTitle, callDescription, callType) => {
    return new Promise((resolve, reject) => {
      signalEmitterHandel
        .createCall(callTitle, callDescription, callType)
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

  const joinCall = (candidateName, callId) => {
    return new Promise((resolve, reject) => {
      signalEmitterHandel
        .makeJoinCallRequest(callId, candidateName)
        .then((response) => {
          resolve(response);
        })
        .catch((e) => {
          reject(e);
        });
    });
  };

  const acceptCall = (request) => {
    return new Promise((resolve, reject) => {
      //Now we need to created an peer connection for this request id .
      //need to create peer connection first then adding local stream into that and then creating offer.
      //TODO:REPLACE : DEFAULT_HOST_NAME with actual host name
      let peerConnectionId = request.requestId;
      let peerConnectionManager = store.getState().peerConnectionManager;
      let localStream = store.getState().localStream;
      peerConnectionManager
        .createNewPeerConnection(
          peerConnectionId,
          "DEFAULT_HOST_NAME",
          request.requestPayload.requesterName,
          request.requestPayload.requesterSocketId
        )
        .then((peerConnection) => {
          console.log("initialized peerConnection", peerConnection);
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

  const rejectCall = (requestId) => {
    return new Promise((resolve, reject) => {
      signalEmitterHandel
        .updateJoinCallRequestStatus(requestId, "declined")
        .then((response) => {
          resolve(response);
        })
        .catch((e) => {
          reject(e);
        });
    });
  };

  const getSignalEmitterHandel=()=>{
    return signalEmitterHandel
  }
  return {
    init,
    createCall,
    joinCall,
    acceptCall,
    rejectCall,
    getSignalEmitterHandel
  };
};

export default webRTCClient;
