import React from 'react';
import config from './../configs';

import Board from './Board';
import Chat from './Chat';

const { X, Y, Z } = config;

class Game extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
                lastMove: -1
            }],
            stepNumber: 0,
            startGame: false,
            endGame: false,
            isReady: false,
            players: [],
            countReady: 0,
            xIsNext: true
        }

        this.props.socket.emit('join');

        this.props.socket.on('update-game', (game) => {
            this.setState({
                history: game.history,
                stepNumber: game.stepNumber,
                startGame: game.startGame,
                endGame: game.endGame,
                xIsNext: game.xIsNext,
                xPlayer: game.xPlayer,
                oPlayer: game.oPlayer
            });
        });

        this.props.socket.on('update-user', (data) => {
            this.updateUser(data);
        });
    }

    updateUser(data) {
        let players = [];
        let countReady = 0;
        data.users.forEach((usercode) => {
            players.push({
                usercode: usercode,
                username: data.names[usercode],
                isReady: data.status[usercode]
            });
            if (data.status[usercode]) countReady++;
        });
        this.setState({ players, countReady });
    }

    handleClick(i) {
        if (!this.state.startGame) return;
        const nextPlayer = this.state.xIsNext ? this.state.xPlayer : this.state.oPlayer;
        if (this.props.socket.id !== nextPlayer) return;

        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();

        if (squares[i]) return;
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        const endGame = calculateLines(squares, i).length !== 0;
        const startGame = !endGame;

        this.setState({
            history: history.concat([{
                squares: squares,
                lastMove: i
            }]),
            stepNumber: history.length,
            startGame: startGame,
            endGame: endGame,
            xIsNext: !this.state.xIsNext
        });

        this.props.socket.emit('click-square', {
            history: history.concat([{
                squares: squares,
                lastMove: i
            }]),
            stepNumber: history.length,
            startGame: startGame,
            endGame: endGame,
            xIsNext: !this.state.xIsNext
        });
    }

    jumpTo(step) {
        if (step < 0) return;

        this.setState({
            stepNumber: step,
            startGame: true,
            endGame: false,
            xIsNext: step % 2 === 0
        });

        this.props.socket.emit('jump-to', {
            stepNumber: step,
            startGame: true,
            endGame: false,
            xIsNext: step % 2 === 0
        });
    }

    handleButtonReady() {
        const isReady = !this.state.isReady;
        const countReady = this.state.countReady + isReady ? 1 : -1;
        this.setState({ isReady, countReady });

        this.props.socket.emit('change-ready', isReady);
    }

    handleButtonStart() {
        const startGame = true;
        const xPlayer = this.props.socket.id;
        this.setState({ startGame, xPlayer });

        this.props.socket.emit('change-start', startGame);
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winnerLines = calculateLines(current.squares, current.lastMove);

        return (
            <div className='game'>
                <Board size={{ X, Y, Z }}
                    squares={current.squares}
                    lastMove={current.lastMove}
                    lines={winnerLines}
                    onClick={(i) => this.handleClick(i)} />

                <this.Status />

                <Chat socket={this.props.socket}
                    username={this.props.username}
                    usercode={this.props.usercode} />

                <div className='space'></div>
            </div>
        );
    }

    Status = () => {
        const players = this.state.players.map((player, index) => {
            let style = player.isReady ? 'player-line green' : 'player-line';
            const type = player.usercode === this.props.socket.id ? 'square' : 'circle';
            return (
                <li key={index} type={type} className={style}> {player.username} </li>
            );
        });

        const nextPlayer = this.state.xIsNext ? this.state.xPlayer : this.state.oPlayer;
        const cannotUndo = this.state.stepNumber === 0 || this.state.endGame || this.props.socket.id !== nextPlayer;

        const statusColor = this.state.endGame ? 'glow-violet' : this.state.xIsNext ? 'new-red' : 'new-blue';

        let statusText = '';
        if (this.state.startGame === false) statusText = 'Preparing...';
        if (this.state.endGame) statusText = 'Game Over';
        if (this.state.startGame) {
            statusText = (this.props.socket.id === nextPlayer ? 'Your Turn: ' : 'Next Turn: ')
                + (this.state.xIsNext ? 'X' : 'O');
        }
        let statusAlign = { textAlign: (this.state.startGame || this.state.endGame ? 'center' : 'left') };

        const readyText = this.state.isReady ? 'Unready' : 'Ready';
        const cannotStart = this.state.isReady === false || this.state.countReady !== 2;

        return (
            <div className='game-info'>
                <div className='history'>
                    <button className='button-undo'
                        disabled={cannotUndo}
                        onClick={() => this.jumpTo(this.state.stepNumber - 1)}>
                        Go to last move
                    </button>
                </div>
                <div className={'status ' + statusColor} style={statusAlign}>{statusText}</div>
                <div className={'button-line ' + (this.state.startGame ? 'hidden' : 'visible')}>
                    <button className='button-ready'
                        onClick={() => this.handleButtonReady()}>{readyText}</button>
                    <button className='button-start'
                        disabled={cannotStart}
                        onClick={() => this.handleButtonStart()}>Start</button>
                </div>
                <div className='player-list'>
                    <ul>{players}</ul>
                </div>
            </div>
        );
    }
}

function calculateLines(squares, target) {
    if (target < 0) return [];
    const lineA = calculateLine(squares, target, 1, 1);
    const lineB = calculateLine(squares, target, 1, -1);
    const lineC = calculateLine(squares, target, 1, 0);
    const lineD = calculateLine(squares, target, 0, 1);

    let lines = [];
    if (lineA.length) lines.push(lineA);
    if (lineB.length) lines.push(lineB);
    if (lineC.length) lines.push(lineC);
    if (lineD.length) lines.push(lineD);

    return lines;
}

function calculateLine(squares, target, factorX, factorY) {
    let line = [target];
    let lowerFree = false, upperFree = false;

    let x = target % X + 1;
    let y = Math.floor(target / X) + 1;
    while (true) {
        x = x + 1 * factorX;
        y = y + 1 * factorY;

        const index = (y - 1) * X + x - 1;
        if (x < 1 || y < 1 || x > X || y > Y || squares[index] == null) {
            lowerFree = true;
            break;
        }
        if (squares[index] === squares[target])
            line.push(index);
        else break;
    }

    x = target % X + 1;
    y = Math.floor(target / X) + 1;
    while (true) {
        x = x + -1 * factorX;
        y = y + -1 * factorY;

        const index = (y - 1) * X + x - 1;
        if (x < 1 || y < 1 || x > X || y > Y || squares[index] == null) {
            upperFree = true;
            break;
        }
        if (squares[index] === squares[target])
            line.push(index);
        else break;
    }

    if (line.length < 5) return [];
    if (line.length > 5) return line;
    if (line.length === 5) {
        if (upperFree || lowerFree) return line;
        else return [];
    }
}

export default Game;