import { addJoinRequest, setSocketId } from "../redux/actions/actions";
import store from "../redux/store/store";

const signalListener = () => {
  let socket = null;
  const init = (initializedSocket) => {
    socket = initializedSocket;
    attachSocketIdListener(socket);
    attachJoinRequestListener(socket);
    return socket;
  };

  const attachSocketIdListener=(socket)=>{
    socket.on("recieveSocketId",(data)=>{
      console.log("received socketId is ",data);
      store.dispatch(setSocketId(data));
    })
  }

  const attachJoinRequestListener = (socket) => {
    //we need redux events here, so that we update ui when ever new event is received
    socket.on("listenJoinRequest",(data)=>{
      console.log("New joining request");
      store.dispatch(addJoinRequest(data));
    })
  };

  const attachOfferListeners = (socket) => {};

  const attachAnswerListeners = (socket) => {

  };

  const attachIceCandidatesListeners = (socket) => {};
  
  return {
    init,
    attachSocketIdListener,
    attachJoinRequestListener,
    attachAnswerListeners,
    attachOfferListeners,
    attachIceCandidatesListeners,
  };
};

export default signalListener;
