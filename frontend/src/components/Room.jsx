import React, { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { io } from "socket.io-client";

const URL = "http://localhost:8000";

const config = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302"
    }
  ]
}

function Room({
  name,
  localVideoTrack,
  localAudioTrack
}) {

  const [searchParams, setsesrchParams] = useSearchParams();
  const [socket, setSocket] = useState(null);
  const [lobby, setLobby] = useState(true);
  const [sendingPc, setSendingPc] = useState(null);
  const [recevingPc, setRecevingPc] = useState(null);
  const [remoteVideoTrack, setRemoteVideoTrack] = useState(null);
  const [remoteAudioTrack, setRemoteAudioTarck] = useState(null);
  const [remoteMediaSteram, setRemoteMediaStream] = useState(null);
  const remoteVideoRef = useRef();
  const localVideoRef = useRef();

  useEffect(() => {
    let socket = io(URL);
    setSocket(socket);

    //peer connection on offer request
    socket.on("send-offer", async ({ roomId }) => {
      setLobby(false);
      let pc = new RTCPeerConnection(config);
      setSendingPc(pc);

      //add localTracks
      if (localAudioTrack) {
        pc.addTrack(localAudioTrack);
      }

      if (localVideoTrack) {
        pc.addTrack(localVideoTrack);

      }


      pc.onicecandidate = async () => {
        const sdp = await pc.createOffer();
        socket.emit('offer', {
          sdp,
          roomId
        })
      }
    })

    socket.on('offer', async ({ roomId, sdp:remoteSdp }) => {
      let pc = new RTCPeerConnection(config);
      setLobby(false);

      pc.setRemoteDescription(remoteSdp);

      const sdp = await pc.createAnswer();
      setRecevingPc(pc);
      const stream = new MediaStream();
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
      setRemoteMediaStream(stream);

      pc.ontrack(({ track, type }) => {
        if (type == 'audio') {
          // setRemoteAudioTarck(track)
          remoteVideoRef.current.srcObject.addTrack(track);
        } else {
          // setRemoteVideoTrack(track)
          remoteVideoRef.current.srcObject.addTrack(track);
        }
      })
      socket.emit('answer', {
        roomId,
        sdp: sdp
      })
    })

    socket.on('answer', ({ roomId, sdp:remoteSdp }) => {
      setLobby(false);
      setSendingPc(pc => {
        pc?.setRemoteDescription({
          type: 'answer',
          sdp: remoteSdp  
        })
        return pc;
      })
    })

    socket.on('lobby', () => {
      setLobby(true);
    })

  }, [name])


  useEffect(() => {
    if(localVideoRef.current) {
      if(localVideoTrack) {
      localVideoRef.current.srcObject = new MediaStream([localVideoTrack]);
      }
    }
  }, [localVideoRef])

  return (
    <div>
      <h1>Room</h1>
      Hi {name}
      <video ref={localVideoRef} autoPlay></video>
      {lobby && <p>Wating for connection.....</p> }
      <video ref={remoteVideoRef} autoPlay></video>
    </div>
  )
}

export default Room
