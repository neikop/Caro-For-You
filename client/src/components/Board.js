import React from 'react';
import config from './../configs';

const { X, Y, Z } = config;

class Board extends React.Component {

    renderSquare(i) {
        return <Square key={i}
            value={this.props.squares[i]}
            lastMove={this.props.lastMove === i}
            inLine={this.isInLine(i)}
            onClick={() => this.props.onClick(i)} />;
    }

    isInLine(i) {
        let inLine = false;
        this.props.lines.forEach((line) => {
            line.forEach((value) => {
                if (value === i) inLine = true;
            });
        });
        return inLine;
    }

    render() {
        let map = [];
        for (let k = 0; k < Y; k++) {
            let row = [];
            for (let i = 0; i < X; i++) {
                row.push(this.renderSquare(k * X + i));
            }
            map.push(<div key={k} className='board-row'>{row}</div>);
        }

        const size = { minWidth: (X * (Z - 1)) };
        return (
            <div className='game-board' style={size}>{map}</div >
        );
    }
}

function Square(props) {

    let color = '';
    if (props.value === 'X') color = props.inLine ? 'glow-red' : props.lastMove ? 'new-red' : 'old-red';
    if (props.value === 'O') color = props.inLine ? 'glow-blue' : props.lastMove ? 'new-blue' : 'old-blue';
    const style = 'square ' + color;
    const size = { width: Z, height: Z };
    return (
        <button className={style} style={size} onClick={props.onClick}>
            {props.value}
        </button>
    );
}

export default Board;