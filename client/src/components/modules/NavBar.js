/*
 * @Author: mixin weng mixin_weng2022@163.com
 * @Date: 2023-05-09 20:05:45
 * @LastEditors: mixin weng mixin_weng2022@163.com
 * @LastEditTime: 2023-05-09 22:11:56
 * @FilePath: /catbook-mixin/client/src/components/modules/NavBar.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React from "react";
import { Link } from "@reach/router";
import GoogleLogin, { GoogleLogout } from "react-google-login";

import "./NavBar.css";

// This identifies your web application to Google's authentication service
const GOOGLE_CLIENT_ID =
  "1077451764878-bb0pg5vusui84qbsbl1f7gnc5es3carr.apps.googleusercontent.com";

/**
 * The navigation bar at the top of all pages. Takes no props.
 */
const NavBar = (props) => {
  return (
    <nav className="NavBar-container">
      <div className="NavBar-title u-inlineBlock">Catbook</div>
      <div className="NavBar-title u-inlineBlock">|</div>
      <div className="NavBar-title-red u-inlineBlock">Game</div>
      <div className="NavBar-title u-inlineBlock">book</div>
      <div className="NavBar-linkContainer u-inlineBlock">
        <Link to="/" className="NavBar-link">
          Home
        </Link>
        {props.userId && (
          <Link to={`/profile/${props.userId}`} className="NavBar-link">
            Profile
          </Link>
        )}
        <Link to="/chat/" className="NavBar-link">
          Chat
        </Link>
        <Link to="/game/" className="NavBar-link">
          Game
        </Link>
        {props.userId ? (
          <GoogleLogout
            clientId={GOOGLE_CLIENT_ID}
            buttonText="Logout"
            onLogoutSuccess={props.handleLogout}
            onFailure={(err) => console.log(err)}
            className="NavBar-link NavBar-login"
          />
        ) : (
          <GoogleLogin
            clientId={GOOGLE_CLIENT_ID}
            buttonText="Login"
            onSuccess={props.handleLogin}
            onFailure={(err) => console.log(err)}
            className="NavBar-link NavBar-login"
          />
        )}
      </div>
    </nav>
  );
};

export default NavBar;
