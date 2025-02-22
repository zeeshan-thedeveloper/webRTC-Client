import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import logger from "redux-logger";
import {
  ADD_JOIN_REQUEST,
  ADD_PARTICIPANT,
  SET_CALL_DESCRIPTION,
  SET_CALL_ID,
  SET_CALL_TITLE,
  SET_LOCAL_NAME,
  SET_LOCAL_STREAM,
  SET_PEER_CONNECTION_MANAGER,
  SET_SOCKET,
  SET_SOCKET_ID,
  SET_WEB_RTC,
} from "../actionTypes/actionTypes";

const initialState = {
  callTitle: null,
  callDescription: null,
  callId: null,
  socketId: null,
  localName: null,
  socket: null,
  webRTC: null,
  peerConnectionManager: null,
  localStream: null,
  listOfParticipants: [],
  listOfJoinRequests: [],
};

const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_PARTICIPANT:
      return {
        ...state,
        listOfParticipants: [...state.listOfParticipants, action.payload],
      };
    case ADD_JOIN_REQUEST:
      return {
        ...state,
        listOfJoinRequests: [...state.listOfJoinRequests, action.payload],
      };
    case SET_CALL_ID:
      return {
        ...state,
        callId: action.payload,
      };
    case SET_CALL_TITLE:
      return {
        ...state,
        callTitle: action.payload,
      };
    case SET_CALL_DESCRIPTION:
      return {
        ...state,
        callDescription: action.payload,
      };
    case SET_CALL_DESCRIPTION:
      return {
        ...state,
        callDescription: action.payload,
      };
    case SET_SOCKET_ID:
      return {
        ...state,
        socketId: action.payload,
      };
    case SET_SOCKET:
      return {
        ...state,
        socket: action.payload,
      };

    case SET_WEB_RTC:
      return {
        ...state,
        webRTC: action.payload,
      };
    case SET_LOCAL_STREAM:
      return {
        ...state,
        localStream: action.payload,
      };
    case SET_PEER_CONNECTION_MANAGER:
      return {
        ...state,
        peerConnectionManager: action.payload,
      };
    case SET_LOCAL_NAME:
      return {
        ...state,
        localName: action.payload,
      };

    default:
      return state;
  }
};
// apply middleware to the store
const middleware = [thunk, logger];

const store = createStore(rootReducer, applyMiddleware(...middleware));

export default store;
