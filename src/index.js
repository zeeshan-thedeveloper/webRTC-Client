import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import webRTCClient from "./webRTC-client/webRTC-client";

const webRtcClient = webRTCClient();
let signalSocket = webRtcClient.init("http://192.168.8.103:8080");
console.log("signalSocket",signalSocket)

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App webRtcClient={webRtcClient} signalSocket={signalSocket}/>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
