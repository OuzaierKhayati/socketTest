import { useContext, useEffect, useState } from 'react';
import {SocketContext} from "../socketContext";
import './tictactoe.css';

function Tictactoe(){
    const socket = useContext(SocketContext);
    const [squares, setSquares] = useState(Array(9).fill(""));
    const [xIsNext, setXIsNext] = useState(true);
    const [status, setStatus] = useState("First Player: X");
    const [stop, setStop] = useState(false);

    function Square({value, onSquareClick}){
        return <button className="square" onClick={onSquareClick}>{value}</button>
    }

    function handleClick(index){
        const nextSquares = squares.slice();

        if (nextSquares[index] !== "") {
            return;
        }
        if(stop){
            return;
        }

        if(xIsNext){
            nextSquares[index] = "X";
        }else{
            nextSquares[index] = "O";
        }
        socket.emit("nextSquares", nextSquares);

        const winner = calculateWinner(nextSquares);
        if(winner){
            socket.emit("winner","Winner: "+ winner);
        }

        socket.emit("xIsNext", !xIsNext);
    }

    function reset(){
        setSquares(Array(9).fill(""));
        setXIsNext(true);
        setStatus("First Player: X"); 
        setStop(false);
    }

    function calculateWinner(squares){
        const lines = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];
        for (let i=0; i<8; i++){
            if( squares[lines[i][0]] === squares[lines[i][1]] && 
                squares[lines[i][1]] === squares[lines[i][2]]
            ){
                return squares[lines[i][0]];
            }
        }
        return null;
    }

    function getStatus(){
        if (!stop) {
            if (squares.every(square => square === "")) {
                return "First Player: X";
            } else {
                return "Next Player: " + (xIsNext ? "X" : "O");
            }
        } else {
            return status;
        }
    }

    useEffect(() => {
        socket.on("squares", (data)=>{
            setSquares(data);
        })
        socket.on("findWinner",(data)=>{
            setStatus(data);
            setStop(true);
        });
        socket.on("changeTurn", (data)=>{
            setXIsNext(data);
        });

        return () => {
            socket.off('squares');
            socket.off('changeTurn');
            socket.off('findWinner');
        };

    },[socket]);

    return (
        <>
            <div className="container-tic">
                <div className="status">{getStatus()}</div>
                <div className='board-box'>
                    <div className="board-row">
                        <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
                        <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
                        <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
                    </div>
                    <div className="board-row">
                        <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
                        <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
                        <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
                    </div>
                    <div className="board-row">
                        <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
                        <Square value={squares[7]} onSquareClick={() => handleClick(7)} />
                        <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
                    </div>
                </div>
            </div>
            <button onClick={reset} className='reset'>Replay</button>
        </>
    );
};
export default Tictactoe;