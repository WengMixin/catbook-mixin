/*
 * @Author: mixin weng mixin_weng2022@163.com
 * @Date: 2023-05-21 19:21:29
 * @LastEditors: mixin weng mixin_weng2022@163.com
 * @LastEditTime: 2023-05-24 22:51:42
 * @FilePath: /catbook-mixin/client/src/components/pages/WebRTC.js
 * @Description: Allow peer to peer to video and audio chat. but audio has some echo need to fix
 */

import React, { useEffect, useState, useRef, useCallback } from "react";
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

    const searchParams = new URLSearchParams(window.location.search);
    const uid = searchParams.get("userId");
    // const uid = String(Math.floor(Math.random() * 10000));

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

    const constraints = {
        video: {
            width: { min: 640, ideal: 1920, max: 1920 },
            height: { min: 480, ideal: 1080, max: 1080 },
        },
        audio: {
            echoCancellation: true,
        },
    };
    const servers = {
        iceServers: [
            {
                urls: [
                    "stun:a.relay.metered.ca:80",
                    "stun:stun1.l.google.com:19302",
                    "stun:stun2.l.google.com:19302",
                ],
            },
            {
                urls: "turn:a.relay.metered.ca:80",
                username: "8fdd2940a4178658729dc41f",
                credential: "s39ogJTTyYhT/fwa",
            },
            {
                urls: "turn:a.relay.metered.ca:80?transport=tcp",
                username: "8fdd2940a4178658729dc41f",
                credential: "s39ogJTTyYhT/fwa",
            },
            {
                urls: "turn:a.relay.metered.ca:443",
                username: "8fdd2940a4178658729dc41f",
                credential: "s39ogJTTyYhT/fwa",
            },
            {
                urls: "turn:a.relay.metered.ca:443?transport=tcp",
                username: "8fdd2940a4178658729dc41f",
                credential: "s39ogJTTyYhT/fwa",
            },
        ],
    };

    // test//
    const handleUserJoined = useCallback(
        async (MemberID) => {
            console.log("A new user is joined:", MemberID);

            setCameraButtonColor("rgb(179, 102, 249, .9)");
            setMicButtonColor("rgb(179, 102, 249, .9)");

            //判断是否超过两个人在一个房间
            channel.getMembers().then(async (memberList) => {
                if (memberList.length > 2) {
                    client.sendMessageToPeer(
                        {
                            text: JSON.stringify({
                                type: "full",
                            }),
                        },
                        MemberID
                    );
                    thirdMemberID = MemberID;
                    return;
                }
                createOffer(MemberID);
            });
        },
        [setCameraButtonColor, setMicButtonColor]
    );

    const handleUserLeft = useCallback(
        (MemberID) => {
            //only update the UI if the member who left was not the third member
            if (MemberID !== thirdMemberID) {
                setUser2Visible(false);
                setUser1SmallFrame(false);
            }
            thirdMemberID = null;
        },

        [setUser2Visible, setUser1SmallFrame]
    );

    const handleMessageFromPeer = useCallback(
        async (message, MemberID) => {
            message = JSON.parse(message.text);
            console.log("Message:", message);

            if (message.type === "full") {
                alert("Room is full");
                LeftThePage();
            }

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
        },
        [addAnswer, createAnswer]
    );

    const init = useCallback(async () => {
        client = await AgoraRTM.createInstance(APP_ID);
        await client.login({ uid, token });
        channel = client.createChannel(roomId);
        await channel.join();

        channel.on("MemberJoined", handleUserJoined);
        channel.on("MemberLeft", handleUserLeft);

        client.on("MessageFromPeer", handleMessageFromPeer);

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        localStream = stream;
        setLocalStreamState(stream);
        // 提取视频流
        const videoTracks = stream.getVideoTracks();
        if (videoTracks.length > 0) {
            const videoTrack = videoTracks[0];
            // 创建一个只包含视频的新 MediaStream
            const videoStream = new MediaStream([videoTrack]);
            // 设置只包含视频的流为 video 元素的源
            if (videoRef1.current) {
                videoRef1.current.srcObject = videoStream;
            }
        } else {
            console.log("No video tracks available");
        }

        return () => {
            // returning cleanup function
            channel.off("MemberJoined", handleUserJoined);
            channel.off("MemberLeft", handleUserLeft);
            client.off("MessageFromPeer", handleMessageFromPeer);
        };
    }, [handleUserJoined, handleUserLeft, handleMessageFromPeer]);

    useEffect(() => {
        //  || uid !== props.userId
        if (!roomId || uid !== props.userId) {
            alert("login first!");
            navigate("/lobby");
        } else {
            init();
        }

        return () => {
            window.removeEventListener("beforeunload", leaveChannel);
            leaveChannel();
        };
    }, [init]);

    let createPeerConnection = async (MemberID) => {
        peerConnection = new RTCPeerConnection(servers); //使用RTCPeerConnection()库。

        remoteStream = new MediaStream();
        if (videoRef2.current) {
            videoRef2.current.srcObject = remoteStream;
        }

        setUser2Visible(true);
        setUser1SmallFrame(true);

        if (!localStream) {
            // 如果localStream还没有设置，则再次设置。防止为空。
            const stream = await navigator.mediaDevices.getUserMedia(
                constraints
            );
            localStream = stream;
            setLocalStreamState(stream);
            // 提取视频流
            const videoTracks = stream.getVideoTracks();
            if (videoTracks.length > 0) {
                const videoTrack = videoTracks[0];
                // 创建一个只包含视频的新 MediaStream
                const videoStream = new MediaStream([videoTrack]);
                // 设置只包含视频的流为 video 元素的源
                if (videoRef1.current) {
                    videoRef1.current.srcObject = videoStream;
                }
            } else {
                console.log("No video tracks available");
            }
        }

        localStream.getTracks().forEach((track) => {
            peerConnection.addTrack(track, localStream);
        });

        // 接受远程的track
        peerConnection.ontrack = (event) => {
            handleTrackEvent(event);
        };
        // 监听远程的track
        peerConnection.onicecandidate = async (event) => {
            if (event.candidate) {
                await sendIceCandidate(event.candidate, MemberID);
            }
        };
    };
    function handleTrackEvent(event) {
        event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track);
        });
    }
    async function sendIceCandidate(candidate, MemberID) {
        await client.sendMessageToPeer(
            {
                text: JSON.stringify({
                    type: "candidate",
                    candidate: candidate,
                }),
            },
            MemberID
        );
    }
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
            await peerConnection.setRemoteDescription(answer);
        }
    };

    let leaveChannel = async () => {
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

    let LeftThePage = () => {
        //退出关闭视频和音频
        if (localStreamState) {
            localStreamState.getTracks().forEach((track) => {
                // 不仅设置 enabled = false，还要调用 track.stop() 来彻底停止设备
                track.enabled = false;
                track.stop();
            });
        }
        //
        navigate("/lobby");
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
                    style={{ backgroundColor: "rgb(255,80,80)" }}
                    id="leave-btn"
                    onClick={LeftThePage}
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
