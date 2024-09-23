import { useContext, useEffect, useState } from "react";
import { SocketContext } from "./socketContext";
import Input from "./components/input";

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
      console.log(playerScores);
    }
  }
  
  useEffect(() => {

    socket.on("playerScores", (playerScores) => {
      setPlayerScores(playerScores);
    });
    return() => socket.off("playerScores")
  }, [socket]);

  return (
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
    </div>
  );
}

export default App;
