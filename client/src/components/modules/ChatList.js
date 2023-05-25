/*
 * @Author: mixin weng mixin_weng2022@163.com
 * @Date: 2023-05-09 20:05:45
 * @LastEditors: mixin weng mixin_weng2022@163.com
 * @LastEditTime: 2023-05-25 03:40:24
 * @FilePath: /catbook-mixin/client/src/components/modules/ChatList.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useState, useEffect } from "react";
import SingleUser from "./SingleUser.js";

import "./SingleUser.css";

/**
 * List of users that are online to chat with and all chat
 *
 * Proptypes
 * @param {UserObject[]} users to display
 * @param {UserObject} active user in chat
 * @param {string} userId id of current logged in user
 * @param {(UserObject) => ()} setActiveUser function that takes in user, sets it to active
 */
const ChatList = (props) => {
    return (
        <>
            <h3 style={{ padding: "0 0 0 24px" }}>Open Chats</h3>
            {props.users.map((user, i) => (
                <SingleUser
                    key={i}
                    setActiveUser={props.setActiveUser}
                    user={user}
                    active={user === props.active}
                />
            ))}
        </>
    );
};

export default ChatList;
