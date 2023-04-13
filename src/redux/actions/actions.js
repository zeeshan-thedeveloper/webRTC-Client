import { ADD_JOIN_REQUEST, ADD_PARTICIPANT, SET_CALL_DESCRIPTION, SET_CALL_ID, SET_CALL_TITLE } from "../actionTypes/actionTypes";

export const addJoinRequest = (joinRequest) => ({
    type: ADD_JOIN_REQUEST,
    payload: joinRequest
});


export const addParticipant = (participant) => ({
    type: ADD_PARTICIPANT,
    payload: participant
});

export const setCallTitle = (callTitle) => ({
    type: SET_CALL_TITLE,
    payload: callTitle
});

export const setCallDescription = (callDescription) => ({
    type: SET_CALL_DESCRIPTION,
    payload: callDescription
});

export const setCallId = (callId) => ({
    type: SET_CALL_ID,
    payload: callId
});









