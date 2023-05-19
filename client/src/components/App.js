/*
 * @Author: mixin weng mixin_weng2022@163.com
 * @Date: 2023-05-18 13:05:04
 * @LastEditors: mixin weng mixin_weng2022@163.com
 * @LastEditTime: 2023-05-19 19:00:06
 * @FilePath: /catbook-react/client/src/components/App.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useState, useEffect } from "react";
import NavBar from "./modules/NavBar.js";
import { Router } from "@reach/router";
import Feed from "./pages/Feed.js";
import NotFound from "./pages/NotFound.js";
import Profile from "./pages/Profile.js";
import Chatbook from "./pages/Chatbook.js";
import Game from "./pages/Game.js";

import { socket } from "../client-socket.js";

import { get, post } from "../utilities";

// to use styles, import the necessary CSS files
import "../utilities.css";
import "./App.css";

import { GoogleOAuthProvider } from "@react-oauth/google";
const GOOGLE_CLIENT_ID =
  "1077451764878-bb0pg5vusui84qbsbl1f7gnc5es3carr.apps.googleusercontent.com";
/**
 * Define the "App" component as a function.
 */
const App = () => {
  const [userId, setUserId] = useState(null);
  useEffect(() => {
    get("/api/whoami").then((user) => {
      if (user._id) {
        // they are registed in the database, and currently logged in.
        setUserId(user._id);
      }
    });
  }, []);

  const handleLogin = (res) => {
    const userToken = res.credential;
    post("/api/login", { token: userToken }).then((user) => {
      setUserId(user._id);
      post("/api/initsocket", { socketid: socket.id });
    });
  };

  const handleLogout = () => {
    console.log("Logged out successfully!");
    setUserId(null);
    post("/api/logout");
  };

  // required method: whatever is returned defines what
  // shows up on screen
  return (
    // <> is like a <div>, but won't show
    // up in the DOM tree
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <>
        <NavBar
          handleLogin={handleLogin}
          handleLogout={handleLogout}
          userId={userId}
        />
        <div className="App-container">
          <Router>
            <Feed path="/" userId={userId} />
            <Profile path="/profile/:userId" />
            <Chatbook path="/chat/" userId={userId} />
            <Game path="/game/" userId={userId} />
            <NotFound default />
          </Router>
        </div>
      </>
    </GoogleOAuthProvider>
  );
};

export default App;
