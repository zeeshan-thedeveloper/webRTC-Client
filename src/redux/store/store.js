import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import {
  ADD_JOIN_REQUEST,
  ADD_PARTICIPANT,
  SET_CALL_DESCRIPTION,
  SET_CALL_ID,
  SET_CALL_TITLE,
} from "../actionTypes/actionTypes";

const initialState = {
  callTitle:null,
  callDescription:null,
  callId:null,
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

    default:
      return state;
  }
};

const store = createStore(rootReducer, applyMiddleware(thunk));

export default store;
