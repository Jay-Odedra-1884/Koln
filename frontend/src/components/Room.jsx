import React, { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { io } from "socket.io-client";

// const URL = "http://localhost:8000";
// const URL = "https://koln.onrender.com";
const URL = import.meta.env.VITE_BACKEND_URL;

const config = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "turn:openrelay.metered.ca:80", username: "openrelayproject", credential: "openrelayproject" }
  ]
}

function Room({
  name,
  localVideoTrack,
  localAudioTrack
}) {

  const [searchParams, setSearchParams] = useSearchParams();
  const [socket, setSocket] = useState(null);
  const [lobby, setLobby] = useState(true);
  const [sendingPc, setSendingPc] = useState(null);
  const [receivingPc, setReceivingPc] = useState(null);
  const [remoteVideoTrack, setRemoteVideoTrack] = useState(null);
  const [remoteAudioTrack, setRemoteAudioTrack] = useState(null);
  const [remoteMediaStream, setRemoteMediaStream] = useState(null);
  const remoteVideoRef = useRef();
  const remoteAudioRef = useRef();
  const localVideoRef = useRef();

  useEffect(() => {
    const socket = io(URL);
    setSocket(socket);

    //peer connection on offer request
    socket.on("send-offer", async ({ roomId }) => {
      console.log("sending offer");
      setLobby(false);
      const pc = new RTCPeerConnection(config);

      setSendingPc(pc);

      // Add local tracks
      if (localVideoTrack) {
        console.log("localVideoTrack added to pc at send-offer");
        pc.addTrack(localVideoTrack);
      }

      if (localAudioTrack) {
        console.log("localAudioTrack added to pc at send-offer");
        pc.addTrack(localAudioTrack);
      }

      pc.onicecandidate = async (e) => {
        console.log("receiving ice candidate locally");
        if (e.candidate) {
          socket.emit("add-ice-candidate", {
            candidate: e.candidate,
            type: "sender",
            roomId
          })
        }
      }

      //create offer and send offer
      pc.onnegotiationneeded = async () => {
        console.log("on negotiation needed, sending offer");
        const sdp = await pc.createOffer();
        await pc.setLocalDescription(sdp);
        socket.emit("offer", {
          sdp,
          roomId
        })
      }
    })

    //handle incoming offer
    socket.on('offer', async ({ roomId, sdp: remoteSdp }) => {
      console.log("received offer");
      setLobby(false);

      const pc = new RTCPeerConnection(config);

      //set remote offer
      console.log("Setting remote description (offer):", remoteSdp);
      await pc.setRemoteDescription(remoteSdp);

      const sdp = await pc.createAnswer();
      await pc.setLocalDescription(sdp);

      const stream = new MediaStream();
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }

      setRemoteMediaStream(stream);
      setReceivingPc(pc);

      window.pcr = pc;

      pc.ontrack = (e) => {
        console.log("ontrack triggered");
        // Handle tracks properly when they arrive
      }

      pc.onicecandidate = async (e) => {
        if (!e.candidate) {
          return;
        }

        console.log("on ice candidate on receiving side");

        if (e.candidate) {
          socket.emit("add-ice-candidate", {
            candidate: e.candidate,
            type: "receiver",
            roomId
          })
        }
      }

      socket.emit("answer", {
        roomId,
        sdp: sdp
      });

      // Handle remote tracks after a delay
      setTimeout(() => {
        const transceivers = pc.getTransceivers();
        if (transceivers.length >= 2) {
          const track1 = transceivers[0].receiver.track;
          const track2 = transceivers[1].receiver.track;

          console.log("Processing tracks:", track1, track2);

          if (track1.kind === "video") {
            setRemoteAudioTrack(track2);
            setRemoteVideoTrack(track1);
          } else {
            setRemoteAudioTrack(track1);
            setRemoteVideoTrack(track2);
          }

          if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
            remoteVideoRef.current.srcObject.addTrack(track1);
            remoteVideoRef.current.srcObject.addTrack(track2);
            remoteVideoRef.current.play().catch(e => console.log("Play error in Video:", e));
          }

          // if(remoteAudioRef && remoteAudioRef.current.srcObject) {
          //   remoteAudioRef.current.srcObject.addTrack(track1)
          //   remoteAudioRef.current.srcObject.addTrack(track2)
          //   remoteAudioRef.current.play().catch(e => console.log("Play error in Audio:", e));
          // }
        }
      }, 5000)
    })

    //receiving answer
    socket.on("answer", ({ roomId, sdp: remoteSdp }) => {
      setLobby(false);
      setSendingPc(pc => {
        if (pc) {
          pc.setRemoteDescription(remoteSdp);
        }
        return pc;
      });
      console.log("loop closed");
    });

    socket.on("lobby", () => {
      setLobby(true);
    });

    //handle ice candidate
    socket.on("add-ice-candidate", ({ candidate, type }) => {
      console.log("add ice candidate from remote");
      console.log({ candidate, type })

      if (type === "sender") {
        setReceivingPc(pc => {
          if (!pc) {
            console.error("receiving pc not found")
          } else {
            pc.addIceCandidate(candidate).catch(e => console.log("ICE candidate error:", e));
          }
          return pc;
        });
      } else {
        setSendingPc(pc => {
          if (!pc) {
            console.error("sending pc not found")
          } else {
            pc.addIceCandidate(candidate).catch(e => console.log("ICE candidate error:", e));
          }
          return pc;
        });
      }
    })

    // Join room
    socket.emit('join', { name });

    // Cleanup function
    return () => {
      socket.disconnect();
    };

  }, [name, localAudioTrack, localVideoTrack])

  useEffect(() => {
    if (localVideoRef.current && localVideoTrack) {

      const tracks = [localVideoTrack];
      if(localAudioTrack) {
        tracks.push(localAudioTrack);
      }

      localVideoRef.current.srcObject = new MediaStream(tracks);
      localVideoRef.current.play().catch(e => console.log("Local video play error:", e));
    }
  }, [localVideoTrack, localAudioTrack])




  const handleDisconnect = () => {

  }

  return (
    <div className='w-full min-h-screen'>
      <h1 className='text-4xl text-center'><span className='text-[#BF1CBA]'>K</span>oln</h1>
      <div className='grid grid-cols-3 md:grid-cols-4 gap-3'>
        <div className='relative w-full col-span-3'>
          <div className='relative'>
            {lobby && <p className='absolute top-1/2 left-1/2 transform -translate-x-1/2'>Waiting to connect you to someone</p>}
            <video className='bg-white/20 h-[45rem] w-full rounded-2xl object-cover' ref={remoteVideoRef} width={500} height={500} autoPlay playsInline></video>
            {/* <audio ref={remoteAudioRef} autoPlay></audio> */}
            <div className='absolute top-4 right-4 rounded-2xl overflow-hidden'>
              <video ref={localVideoRef} width={150} height={150} autoPlay playsInline></video>
            </div>
          </div>
        </div>
        <div className='bg-white/20 w-full h-[45rem] col-span-1 rounded-2xl'>
          <div className='h-[calc(100vh-120px)]'>
            Mesages
          </div>
          <form className='mx-2'>
            <div className='flex '>
            <input type="text" name="message" id="message" placeholder='Type your message' className='w-full bg-white/50 p-3 rounded-l-lg' />
            <hr className='border-l-2 border-gray-500' />
            <button type="submit" className='bg-white/50 p-3 rounded-r-lg'>Send</button>
            </div>
          </form>
        </div>
      </div>
      {/* {!lobby && <div className='bg-red-500 py-2 rounded-lg flex justify-center w-26 cursor-pointer'>disconnect</div>} */}
    </div>
  )
}

export default Room