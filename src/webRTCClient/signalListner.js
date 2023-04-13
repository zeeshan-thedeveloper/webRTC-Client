const signalListener = () => {
  let socket = null;
  const init = (initializedSocket) => {
    socket = initializedSocket;
    return socket;
  };

  const attachJoinRequestListener = (socket) => {
    //we need redux events here, so that we update ui when ever new event is received
  };

  const attachOfferListeners = (socket) => {};

  const attachAnswerListeners = (socket) => {

  };

  const attachIceCandidatesListeners = (socket) => {};
  
  return {
    init,
    attachJoinRequestListener,
    attachAnswerListeners,
    attachOfferListeners,
    attachIceCandidatesListeners,
  };
};

export default signalListener;
