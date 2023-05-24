import React, { useState } from "react";
import styles from "./Lobby.module.css";
// import { useHistory } from "react-router-dom";
import { navigate } from "@reach/router";
function Lobby(props) {
    const [inviteLink, setInviteLink] = useState(""); // 追踪 inviteLink 的状态

    const handleSubmit = (event) => {
        event.preventDefault();
        navigate(`/chatroom/${inviteLink}?userId=${props.userId}`);
    };

    return (
        <main className={styles.lobbyContainer}>
            <div className={styles.formContainer}>
                <div className={styles.formContainerHeader}>
                    <p>👋 Create OR Join a Room</p>
                </div>

                <div className={styles.formContentWrapper}>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            value={inviteLink} // 绑定 inviteLink 状态到 input 元素
                            onChange={(e) => setInviteLink(e.target.value)} // 当 input 元素的值改变时，更新 inviteLink 的状态
                            required
                        />
                        <input
                            className={styles.inputSubmit}
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
