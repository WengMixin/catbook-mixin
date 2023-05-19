/*
 * @Author: mixin weng mixin_weng2022@163.com
 * @Date: 2023-05-17 17:58:00
 * @LastEditors: mixin weng mixin_weng2022@163.com
 * @LastEditTime: 2023-05-19 01:02:43
 * @FilePath: /catbook-react/client/src/components/pages/Profile.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useState, useEffect } from "react";
import CatHappiness from "../modules/CatHappiness.js";
import { get } from "../../utilities";

import "../../utilities.css";
import "./Profile.css";

const Profile = (props) => {
  const [catHappiness, setCatHappiness] = useState(0);
  const [user, setUser] = useState();

  useEffect(() => {
    document.title = "Profile Page";
    get(`/api/user`, { userid: props.userId }).then((userObj) => setUser(userObj));
  }, []);

  const incrementCatHappiness = () => {
    setCatHappiness(catHappiness + 1);
  };

  if (!user) {
    return <div> Loading! </div>;
  }
  return (
    <>
      <div
        className="Profile-avatarContainer"
        onClick={() => {
          incrementCatHappiness();
        }}
      >
        <div className="Profile-avatar" />
      </div>
      <h1 className="Profile-name u-textCenter">{user.name}</h1>
      <hr className="Profile-linejj" />
      <div className="u-flex">
        <div className="Profile-subContainer u-textCenter">
          <h4 className="Profile-subTitle">About Me</h4>
          <div id="profile-description">
            I am really allergic to cats i don't know why i have a catbook
          </div>
        </div>
        <div className="Profile-subContainer u-textCenter">
          <h4 className="Profile-subTitle">Cat Happiness</h4>
          <CatHappiness catHappiness={catHappiness} />
        </div>
        <div className="Profile-subContainer u-textCenter">
          <h4 className="Profile-subTitle">My Favorite Type of Cat</h4>
          <div id="favorite-cat">corgi</div>
        </div>
      </div>
    </>
  );
};

export default Profile;
