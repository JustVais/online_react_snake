import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

import Stomp from 'stompjs'
import SockJS from 'sockjs-client'

export const stompClient = Stomp.over(new SockJS('http://localhost:8080/chat'))

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
