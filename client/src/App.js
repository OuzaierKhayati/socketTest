import { useContext, useEffect, useState } from "react";
import {BrowserRouter as Router, Routes, Route, Link} from "react-router-dom";
import { SocketContext } from "./socketContext";
import Input from "./components/input";
import Draw from "./components/draw";

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
        <h1>React Multiplayer Dashboard</h1>
        <Input name="name" placeholder="Enter your Name" handleInput={handleInput}/>
        <Input name="score" placeholder="Enter your Score" handleInput={handleInput}/>
        <button className="send-scores" onClick={sendScores}>Publish Score</button>
        {playerScores.length > 0 ?
          <table>
            <tbody>
              <tr>
                <th>Name</th>
                <th>Score</th>
              </tr>
              {playerScores.map((playerScore, index) => (
                <tr key={index}>
                  <th>{playerScore?.name}</th>
                  <th>{playerScore?.score}</th>
                </tr>
              ))}
            </tbody>
          </table>: <></>}
        <span>
          <Link to="/draw" className="no-underline">DrawBoard</Link>
          <Link to="/" className="no-underline">Remove DrawBoard</Link>
        </span>
        <Routes>
          <Route path="/draw" element={<Draw/>}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
