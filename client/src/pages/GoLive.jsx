import { useRef, useState, useEffect } from "react"
import { io } from 'socket.io-client'
import './golive.css';

const GoLive = () => {

    const [data, setData] = useState({
        streamURL: "",
        streamKey: "",
    });

    const changeHandler = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    }

    const userVideoRef = useRef(null);
    const [mediaStream, setMediaStream] = useState(null);
    const [mediaRcd, setMediaRcd] = useState(null);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const getMedia = async () => {
            try {
                const media = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
                setMediaStream(media);
                userVideoRef.current.srcObject = media;
            } catch (error) {
                console.log('Error accessing media', error);
            }
        }

        getMedia();

        return () => {
            if (mediaStream) {
                mediaStream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);



    const handleStart = () => {
        if (!mediaStream) return;

        const newSocket = io('http://localhost:5000', {
            autoConnect: false,
            query: {
                streamKey: data.streamKey,
                streamUrl: data.streamURL,
            },
        });

        setSocket(newSocket);

        newSocket.connect();

        const mediaRecorder = new MediaRecorder(mediaStream, {
            audioBitsPerSecond: 128000,
            videoBitsPerSecond: 2500000,
            framerate: 25,
        })

        setMediaRcd(mediaRecorder);

        mediaRecorder.ondataavailable = (e) => {
            console.log('Binary Stream Available:', e.data);
            newSocket.emit('binarystream', e.data);
        }

        mediaRecorder.start(25);
    }

    const handleStop = () => {
        socket.disconnect();
        setSocket(null);
        mediaRcd.stop();
        setMediaRcd(null);
    }

    return (
        <div className="golive-container">

            <div className="golive-main">
                <h1>Studio</h1>
                <div className="golive-utils">
                    <div className="golive-video">
                        <video id="user-video" ref={userVideoRef} autoPlay muted></video>
                    </div>
                    <div className="golive-chats">
                        <div className="chats-top">
                            <h5>Top Chats</h5>
                            <hr />  
                        </div>
                        <div className="chats-container">
                            
                        </div>
                    </div>
                </div>
                <div className="golive-inputs">
                    <div className="golive-input">
                        <label htmlFor="streamURL">StreamURL</label>
                        <input type='password' value={data.streamURL} onChange={changeHandler} name="streamURL" id="streamURL" placeholder="streamURL" />
                    </div>
                    <div className="golive-input">
                        <label htmlFor="streamKey">StreamKey</label>
                        <input type="password" value={data.streamKey} onChange={changeHandler} name="streamKey" id="streamKey" placeholder="streamKey" />
                    </div>
                </div>
                <div className="golive-btns">
                    <button id="start-btn" onClick={handleStart} disabled={(data.streamKey || data.streamURL) ? false : true}>Start</button>
                    <button id="end-btn" onClick={handleStop} disabled={mediaRcd === null ? true : false}>End</button>
                </div>
            </div>

        </div>

    )
}

export default GoLive