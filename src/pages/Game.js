import React, { useState, useEffect, useRef } from "react";

const Game = ({ socket, username, myRoom, setMyRoom }) => {
  const [startCnt, setStartCnt] = useState(15);
  const [cntShow, setCntShow] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [curQuestion, setCurQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [questionTime, setQuestionTime] = useState(10);
  const [showResult, setShowResult] = useState(false);
  let answerMap = {
    roomId: myRoom.roomId,
    user: username,
    questions: {},
  };
  const answerKey = useRef(new Map());

  useEffect(() => {
    socket.on("gameOver", () => {
      const myObject = Object.fromEntries(answerKey.current);
      answerMap.questions = myObject;
      setShowQuiz(false);
      console.log("Game Over ------->", answerMap);
      socket.emit("gameOver", answerMap);
    });
    socket.on("startGame", (roomData) => {
      console.log("Room Data ---> ", roomData);
      setMyRoom(roomData);
      setCntShow(true);
      let count = 10;
      const countdownInterval = setInterval(() => {
        count--;
        setStartCnt(count);
        if (count === 0) {
          clearInterval(countdownInterval);
          setShowQuiz(true);
          setCntShow(false);
          socket.emit("ready", myRoom);
        }
      }, 1000);

      return () => clearInterval(countdownInterval);
    });

    socket.on("question", (newQuestion) => {
      console.log("answerKey ---> ", answerKey);
      setCurQuestion(newQuestion);
      setAnswer("");
      setQuestionTime(10);
    });
    socket.on("endGame", (roomData) => {
      setMyRoom(roomData);
      setShowResult(true);
      console.log("Result Room ", roomData);
    });
    socket.on("leftRoom", (mssg) => {
      alert(mssg);
      window.location.href = "/";
    });
  }, [socket]);

  useEffect(() => {
    const questionTimeInterval = setInterval(() => {
      setQuestionTime((prevTime) => prevTime - 1);
    }, 1000);
    return () => clearInterval(questionTimeInterval);
  }, [curQuestion]);

  return (
    <div className="w-screen h-screen flex flex-col gap-3 items-center justify-center ">
      {!showQuiz && (
        <div className="md:w-[600px] w-[320px] overflow-hidden   bg-white p-5 rounded-lg shadow-xl">
          <div className="border-2 border-green-800">
            <div className="w-full h-[50px] bg-green-800 flex items-center justify-center">
              <h1 className="text-white text-center text-2xl font-bold">
                Quizzy
              </h1>
            </div>
            <div className="flex flex-col gap-4 p-2">
              <h1 className="text-sm mt-2">
                Room Code:{" "}
                <span className="text-[12px] p-1 border-2 border-black bg-gray-400 ">
                  {myRoom.roomId}
                </span>
              </h1>
              <div className="flex flex-row justify-between">
                <p className="text-sm font-semibold border border-blue-900 bg-blue-400 p-2 rounded-lg">{`${username} (you)`}</p>
                <p className="text-sm font-semibold border border-red-900 bg-red-400 p-2 rounded-lg">
                  {myRoom.players[0].playerName === username
                    ? myRoom.players[1]
                      ? myRoom.players[1].playerName
                      : "Waiting for player"
                    : myRoom.players[0].playerName}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {cntShow && (
        <h1 className="border-2 border-black p-2 font-bold">
          Game will start in:{" "}
          <span className="text-xl text-green-600 font-bold">{startCnt}</span>
        </h1>
      )}
      {showQuiz && curQuestion && (
        <div className="p-3">
          <div className="flex flex-col items-center justify-center gap-2 p-4 bg-white w-[320px] rounded-xl border-2 border-blue-700">
            <div className="rounded-[50%] border-2 border-black flex items-center justify-center w-[30px] h-auto">
              {questionTime}
            </div>
            <h2 className="font-bold text-wrap">{curQuestion?.question}</h2>
            <ul
              className="flex flex-col gap-3
            ">
              {curQuestion.options?.map((option, index) => (
                <li
                  key={index}
                  className="bg-blue-300 
                hover:bg-blue-600 focus:bg-green-500 flex items-center p-2 rounded-xl ">
                  <input
                    className="mr-3 my-3"
                    type="radio"
                    id={`option${index}`}
                    name="answer"
                    value={option}
                    checked={answer === option}
                    onChange={(e) => {
                      answerKey.current.set(
                        curQuestion.questionId,
                        e.target.value
                      );
                      setAnswer(e.target.value);
                    }}
                  />
                  <label htmlFor={`option${index}`}>{option}</label>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {showResult && (
        <div className="w-[310px] flex flex-col items-center justify-center bg-white shadow-xl rounded-xl p-3">
          <div className="border-2 border-green-800 w-full flex flex-col text-center justify-center items-center py-5">
            <h1 className="text-green-800 font-bold text-2xl">Game Over</h1>
            <h2 className="text-lg font-bold">Results</h2>
            {myRoom.stats.draw ? (
              <h2 className="text-xl font-bold bg-blue-300 border-2 border-blue-600 p-3">
                Draw
              </h2>
            ) : (
              <h2>
                <span
                  className={`${
                    username === myRoom.winner
                      ? "bg-green-700 text-lg font-bold"
                      : "bg-red-700 text-lg font-bold"
                  }`}>
                  {myRoom.stats.winner}
                </span>{" "}
                is the winner!
              </h2>
            )}
            {myRoom.players.map((player) => (
              <p key={player.playerName}>
                {player.playerName} : {player.score}
              </p>
            ))}
            <a href="/" className="border-b-2 border-blue-900 text-blue-900">
              play again
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
