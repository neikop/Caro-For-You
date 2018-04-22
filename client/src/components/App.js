import React from 'react';
import { socketConnect } from 'socket.io-react';

import Game from './Game';

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            username: null,
            usercode: null
        };
    }

    render() {
        const gameStyle = this.state.username ? 'visible' : 'invisible';
        const loginStyle = this.state.username ? 'invisible' : 'visible';
        return (
            <div className='container'>
                <div className={'game-page ' + gameStyle}>
                    <Game socket={this.props.socket}
                        username={this.state.username}
                        usercode={this.state.usercode} />
                </div>
                <div className={'login-page ' + loginStyle}
                    onClick={() => this.input.focus()}>
                    <div className='form'>
                        <div className='title'>What's your nickname?</div>
                        <input className='user-input' type='text' maxLength='10'
                            onKeyDown={(event) => this.inputKeyDown(event)}
                            ref={(target) => { this.input = target; }} />
                    </div>
                </div>
            </div>
        );
    }

    inputKeyDown(event) {
        if (event.which === 13) {
            const username = this.input.value.trim();
            this.input.value = '';
            if (username) {
                const usercode = this.props.socket.id;
                this.setState({ username, usercode });

                this.props.socket.emit('login', { username, usercode });
            }
        }
    }
}

export default socketConnect(App);