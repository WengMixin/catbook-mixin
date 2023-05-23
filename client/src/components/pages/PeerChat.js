/*
 * @Author: mixin weng mixin_weng2022@163.com
 * @Date: 2023-05-21 19:21:29
 * @LastEditors: mixin weng mixin_weng2022@163.com
 * @LastEditTime: 2023-05-23 17:11:41
 * @FilePath: /catbook-mixin/client/src/components/pages/WebRTC.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

import React, { useEffect, useState, useRef } from "react";
import "./PeerChat.css";
import { navigate } from "@reach/router";
// Remember to import images and adjust these paths to the correct ones in your project
import cameraIcon from "../../../dist/icons/camera.png";
import micIcon from "../../../dist/icons/mic.png";
import phoneIcon from "../../../dist/icons/phone.png";
import { useParams } from "@reach/router";

function PeerChat(props) {
    const [APP_ID] = useState("582c5744b00d4e7dae15d86ca5734353");
    const [token, setToken] = useState(null);
    const [localStreamState, setLocalStreamState] = useState(null);

    // const searchParams = new URLSearchParams(window.location.search);
    // const uid = searchParams.get("userId");
    const uid = String(Math.floor(Math.random() * 10000));

    let client;
    let channel;
    let peerConnection;
    let localStream;
    let remoteStream;
    let thirdMemberID;

    const params = useParams();
    let roomId = params.inviteLink;

    // 定义一个状态来控制 user-2 是否显示
    const [user2Visible, setUser2Visible] = useState(true);
    // 定义一个状态来决定 user-1 是否应用 'smallFrame' 样式
    const [user1SmallFrame, setUser1SmallFrame] = useState(false);

    const [cameraButtonColor, setCameraButtonColor] = useState(
        "rgb(179, 102, 249, .9)"
    );
    const [micButtonColor, setMicButtonColor] = useState(
        "rgb(179, 102, 249, .9)"
    );
    //初始化useRef来获取浏览器中的视频和音频权限。
    let videoRef1 = useRef(null);
    let videoRef2 = useRef(null);

    // 然后，我们处理你的函数。我们需要确保函数能够访问到最新的state，
    // 因此我们将它们放在组件内部。在这个过程中，我们需要注意替换全局变量的引用为对应的state，
    // 并使用setState函数来改变state的值。
    const constraints = {
        video: {
            width: { min: 640, ideal: 1920, max: 1920 },
            height: { min: 480, ideal: 1080, max: 1080 },
        },
        audio: true,
    };
    const servers = {
        iceServers: [
            {
                urls: [
                    "stun:stun1.l.google.com:19302",
                    "stun:stun2.l.google.com:19302",
                ],
            },
        ],
    };

    useEffect(() => {
        //  || uid !== props.userId
        if (!roomId) {
            navigate("/lobby");
        } else {
            init();
        }
        return () => {
            // 这里可以放一些清理代码
            // leaveChannel();
        };
    }, []); // 只在组件挂载时执行

    let init = async () => {
        client = await AgoraRTM.createInstance(APP_ID);
        await client.login({ uid, token });
        channel = client.createChannel(roomId);
        await channel.join();
        // 加入和离开
        channel.on("MemberJoined", handleUserJoined);
        channel.on("MemberLeft", handleUserLeft);

        client.on("MessageFromPeer", handleMessageFromPeer);

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        localStream = stream;
        setLocalStreamState(stream);
        if (videoRef1.current) {
            videoRef1.current.srcObject = stream;
        }
    };

    const handleMessageFromPeer = async (message, MemberID) => {
        message = JSON.parse(message.text);
        console.log("Message:", message);

        // if (message.type === "full") {
        //     await channel.leave();
        //     await client.logout();
        //     navigate("/lobby");
        //     alert("Room is full");
        // }
        if (message.type === "offer") {
            createAnswer(MemberID, message.offer);
        }

        if (message.type === "answer") {
            addAnswer(message.answer);
        }

        if (message.type === "candidate") {
            if (peerConnection) {
                peerConnection.addIceCandidate(message.candidate);
            }
        }
    };

    let handleUserJoined = async (MemberID) => {
        console.log("A new user is joined:", MemberID);

        // channel.getMembers().then(async (memberList) => {
        //     if (memberList.length > 2) {
        //         client.sendMessageToPeer(
        //             {
        //                 text: JSON.stringify({
        //                     type: "full",
        //                 }),
        //             },
        //             MemberID
        //         );
        //         thirdMemberID = MemberID;
        //         return;
        //     }
        createOffer(MemberID);
        // });
    };

    let createPeerConnection = async (MemberID) => {
        peerConnection = new RTCPeerConnection(servers); //使用RTCPeerConnection()库。

        remoteStream = new MediaStream(); //MediaStream也是库
        if (videoRef2.current) {
            videoRef2.current.srcObject = remoteStream;
        }

        setUser2Visible(true);
        setUser1SmallFrame(true);

        // 如果localStream还没有设置，则再次设置。防止为空。
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        localStream = stream;
        setLocalStreamState(stream);
        if (videoRef1.current) {
            videoRef1.current.srcObject = stream;
        }

        localStream.getTracks().forEach((track) => {
            peerConnection.addTrack(track, localStream);
        });

        // 接受远程的track
        peerConnection.ontrack = (event) => {
            event.streams[0].getTracks().forEach((track) => {
                remoteStream.addTrack(track);
            });
        };
        // 监听远程的track
        peerConnection.onicecandidate = async (event) => {
            if (event.candidate) {
                client.sendMessageToPeer(
                    {
                        text: JSON.stringify({
                            type: "candidate",
                            candidate: event.candidate,
                        }),
                    },
                    MemberID
                );
            }
        };
    };

    let createOffer = async (MemberID) => {
        try {
            await createPeerConnection(MemberID);

            let offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);

            client.sendMessageToPeer(
                { text: JSON.stringify({ type: "offer", offer: offer }) },
                MemberID
            );
        } catch (error) {
            console.error("Failed to create offer:", error);
        }
    };

    let createAnswer = async (MemberID, offer) => {
        await createPeerConnection(MemberID);

        await peerConnection.setRemoteDescription(offer);

        let answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        client.sendMessageToPeer(
            { text: JSON.stringify({ type: "answer", answer: answer }) },
            MemberID
        );
    };

    let addAnswer = async (answer) => {
        if (!peerConnection.currentRemoteDescription) {
            peerConnection.setRemoteDescription(answer);
        }
    };

    let handleUserLeft = (MemberID) => {
        //only update the UI if the member who left was not the third member
        if (MemberID !== thirdMemberID) {
            setUser2Visible(false);
            setUser1SmallFrame(false);
        }
        // clear the stored thirdMemberID
        thirdMemberID = null;
    };

    let leaveChannel = async () => {
        //...
        // navigate("/lobby");
        await channel.leave();
        await client.logout();
    };

    let toggleCamera = () => {
        let videoTrack = localStreamState
            .getTracks()
            .find((track) => track.kind === "video");

        if (videoTrack.enabled) {
            videoTrack.enabled = false;
            setCameraButtonColor("rgb(255, 80, 80)");
        } else {
            videoTrack.enabled = true;
            setCameraButtonColor("rgb(179, 102, 249, .9)");
        }
    };

    let toggleMic = () => {
        let audioTrack = localStreamState
            .getTracks()
            .find((track) => track.kind === "audio");

        if (audioTrack.enabled) {
            audioTrack.enabled = false;
            setMicButtonColor("rgb(255, 80, 80)");
        } else {
            audioTrack.enabled = true;
            setMicButtonColor("rgb(179, 102, 249, .9)");
        }
    };

    window.addEventListener("beforeunload", leaveChannel);
    // 返回组件的JSX
    return (
        <div>
            <div className={"videos"}>
                <video
                    className={user1SmallFrame ? "smallFrame" : "videoPlayer"}
                    id="user-1"
                    ref={videoRef1}
                    autoPlay
                    playsInline
                ></video>
                <video
                    className={user2Visible ? "videoPlayer" : "user2"}
                    id="user-2"
                    ref={videoRef2}
                    autoPlay
                    playsInline
                ></video>
            </div>

            <div className={"controls"}>
                <div
                    className={"controlContainer"}
                    style={{ backgroundColor: cameraButtonColor }}
                    id="camera-btn"
                    onClick={toggleCamera}
                >
                    <img
                        className={"controlContainerImg"}
                        src={cameraIcon}
                        alt="Camera Icon"
                    />
                </div>

                <div
                    className={"controlContainer"}
                    style={{ backgroundColor: micButtonColor }}
                    id="mic-btn"
                    onClick={toggleMic}
                >
                    <img
                        className={"controlContainerImg"}
                        src={micIcon}
                        alt="Mic Icon"
                    />
                </div>

                <div
                    className={"controlContainer"}
                    id="leave-btn"
                    onClick={leaveChannel}
                >
                    <img
                        className={"controlContainerImg"}
                        src={phoneIcon}
                        alt="Phone Icon"
                    />
                </div>
            </div>
        </div>
    );
}

export default PeerChat;
