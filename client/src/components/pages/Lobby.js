/*
 * @Author: mixin weng mixin_weng2022@163.com
 * @Date: 2023-05-24 00:32:58
 * @LastEditors: mixin weng mixin_weng2022@163.com
 * @LastEditTime: 2023-05-25 00:38:32
 * @FilePath: /catbook-mixin/client/src/components/pages/Lobby.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useState } from "react";
import "./Lobby.css";
// import { useHistory } from "react-router-dom";
import { navigate } from "@reach/router";
import { cold } from "react-hot-loader";
function Lobby(props) {
    const [inviteLink, setInviteLink] = useState(""); // 追踪 inviteLink 的状态

    const handleSubmit = (event) => {
        event.preventDefault();
        navigate(`/chatroom/${inviteLink}?userId=${props.userId}`);
    };

    return (
        <main>
            <div className="formContainer">
                <div className="formContainerHeader">
                    <p>👋 Create OR Join a Room</p>
                </div>

                <div className="formContentWrapper">
                    <form onSubmit={handleSubmit}>
                        <input
                            className="input"
                            type="text"
                            value={inviteLink} // 绑定 inviteLink 状态到 input 元素
                            onChange={(e) => setInviteLink(e.target.value)} // 当 input 元素的值改变时，更新 inviteLink 的状态
                            required
                        />
                        <input
                            className="input inputSubmit"
                            type="submit"
                            value="Join Room"
                        />
                    </form>
                </div>
            </div>
        </main>
    );
}

export default Lobby;
