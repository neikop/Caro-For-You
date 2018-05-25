import React from 'react';
import ReactDOM from 'react-dom';

import io from 'socket.io-client';
import { SocketProvider } from 'socket.io-react';

import App from './components/App';

const socket = io.connect('/');

// ========================================

ReactDOM.render(
    <SocketProvider socket={socket}>
        <App />
    </SocketProvider>,
    document.getElementById('app')
);