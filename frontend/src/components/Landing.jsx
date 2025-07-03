  import React, { useEffect, useRef, useState } from 'react';
  import { Link } from 'react-router-dom';
  import Room from './Room';

  function Landing() {

    const [name, setName] = useState("");
    const [joined, setJoined] = useState(false);

    const [localVideoTrack, setLocalVideoTrack] = useState(null);
    const [localAudioTrack, setLocalAudioTrack] = useState(null);

    const videoRef = useRef();


    let getCam = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })

      const audioTrack = stream.getAudioTracks()[0];
      const videoTrack = stream.getVideoTracks()[0];

      setLocalAudioTrack(audioTrack);
      setLocalVideoTrack(videoTrack);

      if (!videoRef.current) {
        return;
      }

      videoRef.current.srcObject = stream;
    }

    useEffect(() => {
      if (videoRef && videoRef.current) {
        getCam();

      }
    }, [videoRef])

    if(!joined) {
      return (
      <div>
        <h1>Landing Page</h1>
        <video ref={videoRef} autoPlay></video>
        <input type="text" onChange={(e) => setName(e.target.value)} />
        <button onClick={() => {setJoined(true)}}>Join</button>
      </div>
    )
    } else {
      return <Room name={name} localAudioTrack={localAudioTrack} localVideoTrack={localVideoTrack} />
    }
  }

  export default Landing
