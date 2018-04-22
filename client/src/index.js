import React from 'react';
import ReactDOM from 'react-dom';

import io from 'socket.io-client';
import { SocketProvider } from 'socket.io-react';

import App from './components/App';

const port = 1858;
const socket = io.connect('localhost:' + port);

// ========================================

ReactDOM.render(
    <SocketProvider socket={socket}>
        <App />
    </SocketProvider>,
    document.getElementById('app')
);