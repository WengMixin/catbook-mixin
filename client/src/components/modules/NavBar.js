/*
 * @Author: mixin weng mixin_weng2022@163.com
 * @Date: 2023-05-18 17:29:21
 * @LastEditors: mixin weng mixin_weng2022@163.com
 * @LastEditTime: 2023-05-25 00:07:52
 * @FilePath: /catbook-react/client/src/components/modules/NavBar.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useEffect } from "react";
import { Link } from "@reach/router";
import "./NavBar.css";
import "../../utilities.css";
import { GoogleLogin } from "@react-oauth/google";

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
                    <Link
                        to={`/profile/${props.userId}`}
                        className="NavBar-link"
                    >
                        Profile
                    </Link>
                )}
                <Link to="/chat/" className="NavBar-link">
                    Chat
                </Link>
                <Link to="/game/" className="NavBar-link">
                    Game
                </Link>
                <Link to="/lobby/" className="NavBar-link">
                    Lobby
                </Link>
                {props.userId ? (
                    <button
                        onClick={props.handleLogout}
                        className="NavBar-logout"
                    >
                        Sign out
                    </button>
                ) : (
                    <div className="NavBar-link NavBar-loginx u-inlineBlock">
                        <GoogleLogin
                            onSuccess={props.handleLogin}
                            onError={() => {
                                console.log("Login Failed");
                            }}
                            text="signin"
                            type="standard"
                            theme="outline"
                            size="medium"
                            shape="rectangular"
                        />
                    </div>
                )}
            </div>
        </nav>
    );
};

export default NavBar;
