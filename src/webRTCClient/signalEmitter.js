const signalEmitter = () => {
  let socket = null;
  const init = (initializedSocket) => {
    socket = initializedSocket;
    return socket;
  };

  const attachNewOneToOneCallEmitter = (socket) => {};
  
  const attachNewGroupCallEmitter = (socket) => {};

  const attachJoinRequestEmitter = (socket) => {};

  const attachOfferEmitter = (socket) => {};

  const attachAnswerEmitter = (socket) => {};

  const attachIceCandidatesEmitter = (socket) => {};

  return {
    init,
    attachNewOneToOneCallEmitter,
    attachNewGroupCallEmitter,
    attachAnswerEmitter,
    attachJoinRequestEmitter,
    attachIceCandidatesEmitter,
    attachOfferEmitter,
  };
};

export default signalEmitter;
