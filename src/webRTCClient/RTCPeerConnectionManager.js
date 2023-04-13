const RTCPeerConnectionManager = () => {
  const peerConnections = {};
  let signalListener = null;
  let signalEmitter = null;
  const init = () => {};

  const createNewPeerConnection = (
    connectionId,
    hostName,
    clientName,
    clientSocketId,
    hostSocketId,
    callId,
    localStream
  ) => {
    // Create a new RTCPeerConnection object
    const peerConnection = new RTCPeerConnection();

    // Store the RTCPeerConnection object in the peerConnections object
    peerConnections[connectionId] = {
      connection: peerConnection,
      hostName,
      clientName,
      clientSocketId,
      hostSocketId,
      callId,
      localStream: localStream,
      remoteStream: null,
      remoteIceCandidates: [],
      localIceCandidates: [],
      offer: null,
      answer: null,
      listeners: {
        onicecandidate: (event) => {
          console.log(
            `onicecandidate event for connection ${connectionId}`,
            event
          );
          //TODO:emit new ice candidates
          // Handle ICE candidate event
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
  };

  const addLocalStreamIntoConnection = (connectionId, stream) => {
    peerConnections[connectionId].localStream = stream;
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

  const createOfferAnswer = (remoteOffer, connectionId) => {
    //get peer connection by using connection id
    return new Promise((resolve, reject) => {
      const connection = peerConnections[connectionId].connection;
      connection
        .createAnswer()
        .then((answer) => {
          connection
            .setLocalDescription(answer)
            .then((response) => {
              console.log(response);
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

  const storeRemoteIceCandidates = (iceCandidates, connectionId) => {
    peerConnections[connectionId].remoteIceCandidates = iceCandidates;
  };

  const updateRemoteIceCandidates = async (connectionId) => {
    try {
      const connection = peerConnections[connectionId].connection;
      if (!connection) {
        throw new Error(`Connection with ID ${connectionId} not found`);
      }
      if (!peerConnections[connectionId].remoteIceCandidates) {
        throw new Error(
          `No remote ICE candidates found for connection ${connectionId}`
        );
      }
      for (const candidateObj of peerConnections[connectionId]
        .remoteIceCandidates) {
        const candidate = new RTCIceCandidate(candidateObj);
        await connection.addIceCandidate(candidate);
        console.log(
          `ICE candidate added successfully for connection ${connectionId}`
        );
      }
    } catch (error) {
      console.error(
        `Error adding ICE candidate for connection ${connectionId}:`,
        error
      );
    }
  };

  const storeLocalIceCandidates = (iceCandidates, connectionId) => {
    peerConnections[connectionId].localIceCandidates = iceCandidates;
  };

  const setRemoteDescription = (connectionId, remoteOffer) => {
    const desc = new RTCSessionDescription(remoteOffer);

    return peerConnections[connectionId].connection
      .setRemoteDescription(desc)
      .then(() => {
        console.log("Remote description set successfully");
      })
      .catch((error) => {
        console.log("Error setting remote description:", error);
        throw error; // re-throw the error to the calling function
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
    getRemoteStream
  };
};

export default RTCPeerConnectionManager;
