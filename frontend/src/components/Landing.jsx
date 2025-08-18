import React, { useEffect, useRef, useState } from 'react';
import Room from './Room';

function Landing() {

  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);

  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [error, setError] = useState("");

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

    videoRef.current.srcObject = new MediaStream([videoTrack]);
    videoRef.current.play();
  }

  useEffect(() => {
    if (videoRef && videoRef.current) {
      getCam();

    }
  }, [videoRef])


  if (!joined) {
    return (
      <div className='w-full min-h-screen flex justify-center items-center'>
        <div className='bg-gradient-to-r from-neutral-800 to-neutral-900 landingContainer flex justify-center items-center gap-4 p-8 rounded-lg shadow-lg'>
          <video ref={videoRef}
            className='rounded-lg border border-neutral-400 z-10'
            autoPlay></video>
          <div className='flex flex-col gap-4'>
            <input className='inp-theme rounded-lg bg-neutral-500' required type="text" onChange={(e) => setName(e.target.value)} placeholder='Enter name'/>
            <p className='text-red-500'>{error ? `⚠️ ${error}` : ""}</p>
            <button className='btn-theme' onClick={() => { name == "" ? setError("Enter Name") : setJoined(true) }}>Join</button>
          </div>
        </div>
      </div>
    )
  } else {
    return <Room name={name} localAudioTrack={localAudioTrack} localVideoTrack={localVideoTrack} />
  }
}

export default Landing
