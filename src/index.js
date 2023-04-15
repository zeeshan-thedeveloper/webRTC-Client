import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
    
import { Provider } from "react-redux";
import store from "./redux/store/store";
import webRTCClient from './webRTCClient/webRTCClient';
import { setPeerConnectionManager, setSocket, setWebRTC } from './redux/actions/actions';
import RTCPeerConnectionManager from './webRTCClient/RTCPeerConnectionManager';

const root = ReactDOM.createRoot(document.getElementById('root'));
let webRTC = webRTCClient();
let peerConnectionManager = RTCPeerConnectionManager();
let socket = webRTC.init("http://localhost:8080");
  
store.dispatch(setWebRTC(webRTC));
store.dispatch(setSocket(socket));
store.dispatch(setPeerConnectionManager(peerConnectionManager));


root.render(
  <React.StrictMode>
    <Provider store={store}>
    <App />
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

reportWebVitals();
