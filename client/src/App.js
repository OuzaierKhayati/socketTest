import { useContext, useEffect, useState } from "react";
import {BrowserRouter as Router, Routes, Route, Link} from "react-router-dom";
import { SocketContext } from "./socketContext";
import Input from "./components/input";
import Draw from "./components/draw";
import Chat from "./components/chat";
import Tic from "./components/tictactoe";

function App() {
  const socket = useContext(SocketContext);
  const [score, setScore] = useState({});
  const [playerScores, setPlayerScores] = useState([]);
  
  function handleInput(event){
    let {name, value} = event.target;
    let currentObj = {[name]: value};
    
    setScore((prev) => ({...prev, ...currentObj}));
  }
  
  function sendScores(){
    if(score.name && !isNaN(score.score)){
      socket.emit("scores", score);
      // console.log(playerScores);
    }
  }

  useEffect(() => {
    if(score.name && !isNaN(score.score)){
      socket.on("playerScores", (playerScores) => {
        setPlayerScores(playerScores);
      });
      return() => socket.off("playerScores")
    }
  }, [socket,score.name, score.score]);

  return (
    <Router>
      <div className="container">
        <Routes>
          <Route path="/" element={
            <>
              <h1>React Multiplayer Dashboard</h1>
              <Input name="name" placeholder="Enter your Name" handleInput={handleInput} />
              <Input name="score" placeholder="Enter your Score" handleInput={handleInput} />
              <button className="send-scores" onClick={sendScores}>Publish Score</button>
              {playerScores.length > 0 && (
                <table>
                  <tbody>
                    <tr>
                      <th>Name</th>
                      <th>Score</th>
                    </tr>
                    {playerScores.map((playerScore, index) => (
                      <tr key={index}>
                        <td>{playerScore?.name}</td>
                        <td>{playerScore?.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <span>
                <Link to="/draw" className="no-underline">DrawBoard</Link>
                <Link to="/chat" className="no-underline">Quick Chat</Link>
                <Link to = "/tictactoe" className="no-underline">Tic-Tac-Toe</Link>
              </span>
            </>
          } />
          <Route path="/draw" element={
            <>
              <span>
                <Link to="/" className="no-underline">Remove DrawBoard</Link>
              </span>
              <Draw />
            </>
          } />
          <Route path="/chat" element={
            <>
              <span>
                <Link to="/" className="no-underline">Quit chat</Link>
              </span>
              <Chat />
            </>
          } />
          <Route path="/tictactoe" element={
            <>
              <Tic />
              <span>
                <Link to="/" className="no-underline">Quit</Link>
              </span>
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
