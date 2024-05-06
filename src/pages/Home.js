import React from "react";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import Game from "./Game";

// const socket = io("https://quiz-server-g48l.onrender.com");
const socket = io("http://localhost:8080");

const Home = () => {
  const [show, setShow] = useState(false);
  const [username, setUsername] = useState("");
  const [myRoom, setMyRoom] = useState(null);
  const [roomId, setRoomId] = useState("");
  useEffect(() => {
    {
      socket.on("leftRoom",(mssg)=>{
        alert(mssg)
        window.location.href="/";
      })
      socket.on("joined", (roomData) => {
        setMyRoom(roomData);
        setShow(true);
        console.log(roomData);
      });
      socket.on("error",(mssg)=>{
        alert(mssg);
      })
      socket.on("startGame", () => {
        console.log("Game Started");
      });
    }
  }, [socket]);
  const joinServer = (e) => {
    e.preventDefault();
    if (username !== "") {
      socket.emit("join", username);
    }
  };
  const joinRoom = (e) => {
   e.preventDefault();
   if (username !== "") {
     socket.emit("joinPrivate", username);
   }
  };
  const joinByRoom = (e) => {
    e.preventDefault();
    if (roomId !== "") {
      socket.emit("joinByRoom", roomId, username);
    }
  };
  return (
    <div className="w-screen h-screen flex justify-center items-center">
      {!show ? (
        <div className="bg-white w-[300px] h-max p-5 rounded-xl flex flex-col items-center text-center shadow-xl gap-3">
          <div className="m-5">
            <h1 className="text-green-800  font-extrabold text-3xl ">Quizzy</h1>
          </div>
          <form onSubmit={joinServer}>
            <input
              type="text"
              className="border-2 border-gray-300 p-2 rounded-lg w-full mb-5 focus:outline-none focus:border-green-500"
              value={username}
              placeholder="Enter your name"
              autoComplete="off"
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <button className="bg-green-800 text-white w-full py-2 rounded-lg">
              Join Server</button>
          </form>
           
          <a className="mt-2 text-xs" href="https://www.punithdandluri.me">
            Developed By <span className="text-red-500">Punith Dandluri</span>
          </a>
        </div>
      ) : (
        <Game
          myRoom={myRoom}
          socket={socket}
          username={username}
          setMyRoom={setMyRoom}
        />
      )}
    </div>
  );
};

export default Home;
