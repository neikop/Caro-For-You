import React from 'react';
import config from './../configs';

class Chat extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            messages: []
        };

        this.props.socket.on('welcome', () => {
            this.createMessage(null, 'Welcome');
        });

        this.props.socket.on('someone-joined', (username) => {
            this.createMessage(null, username + ' joined');
        });

        this.props.socket.on('someone-left', (username) => {
            this.createMessage(null, username + ' left');
        });

        this.props.socket.on('message', (message) => {
            this.createMessage(message.username, message.message);
        });
    }

    createMessage(username, message) {
        if (this.props.username) {
            this.setState({
                messages: this.state.messages.concat({ username, message })
            });
        }
    }

    componentDidUpdate() {
        this.lineEnd.scrollIntoView({ behavior: 'smooth' });
    }

    render() {
        const messages = this.state.messages.map((message, index) => {
            return (
                <Message key={index}
                    username={message.username}
                    message={message.message} />
            );
        });

        const Y = config.Y, Z = config.Z;
        const size = { height: (Y * (Z - 1)) };
        return (
            <div className='chat-board' style={size}>
                <div className='messages'>
                    <ul type='none'>{messages}</ul>
                    <div ref={(lineEnd) => { this.lineEnd = lineEnd; }} />
                </div>
                <input className='message-input' type='text' placeholder='Type here...'
                    onKeyDown={(event) => this.inputKeyDown(event)}
                    ref={(target) => { this.input = target; }} />
            </div>
        );
    }

    inputKeyDown(event) {
        // ENTER
        if (event.which === 13) {
            const message = this.input.value.trim();
            this.input.value = '';
            if (message) {
                this.createMessage(this.props.username, message);

                const line = {
                    username: this.props.username,
                    usercode: this.props.usercode,
                    message: message
                };
                this.props.socket.emit('message', line);
            }
        }
    }
}

function Message(props) {
    const onwer = props.username ? (props.username + ' : ') : '';
    const style = onwer ? '' : 'bold green';
    return (
        <li className='message-line'>
            <span className='bold'>{onwer}</span>
            <span className={style}>{props.message}</span>
        </li>
    );
}

export default Chat;