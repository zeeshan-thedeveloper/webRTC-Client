import { ADD_JOIN_REQUEST, ADD_PARTICIPANT, SET_CALL_DESCRIPTION, SET_CALL_ID, SET_CALL_TITLE, SET_LOCAL_STREAM, SET_SOCKET, SET_SOCKET_ID, SET_WEB_RTC } from "../actionTypes/actionTypes";

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

export const setSocketId = (socketId) => ({
    type: SET_SOCKET_ID,
    payload: socketId
});

export const setSocket = (socketId) => ({
    type: SET_SOCKET,
    payload: socketId
});
export const setWebRTC = (socketId) => ({
    type: SET_WEB_RTC,
    payload: socketId
});

export const setLocalStream = (stream) => ({
    type: SET_LOCAL_STREAM,
    payload: stream
});






