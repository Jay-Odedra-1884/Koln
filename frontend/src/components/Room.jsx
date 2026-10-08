import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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

  const navigate = useNavigate();
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

  const [msg, setMsg] = useState([
    // Example initial message
    { sender: "system", content: "Welcome to the room!" }
  ]);

  //to show the ui
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

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
      if (localAudioTrack) {
        tracks.push(localAudioTrack);
      }

      localVideoRef.current.srcObject = new MediaStream(tracks);
      localVideoRef.current.play().catch(e => console.log("Local video play error:", e));
    }
  }, [localVideoTrack, localAudioTrack])



  //handle disconnect
  //TODO: disconnect redirection error
  const handleDisconnect = () => {
    if (localVideoTrack) {
      localVideoTrack.stop();
    }

    if (localAudioTrack) {
      localAudioTrack.stop();
    }

    if (sendingPc) {
      sendingPc.close();
    }

    if (receivingPc) {
      receivingPc.close();
    }

    socket.disconnect();

    navigate("/");
  }

  //to toggle mic
  const toggleMic = () => {
    if (localAudioTrack) {
      localAudioTrack.enabled = !localAudioTrack.enabled;
      setIsMuted(!localAudioTrack.enabled);
    }
  }

  //to toggle video
  const toggleVideo = () => {
    if (localVideoTrack) {
      localVideoTrack.enabled = !localVideoTrack.enabled;
      setIsVideoOff(!localVideoTrack.enabled);
    }
  }


  const handleMsgSend = (e) => {
    e.preventDefault();
    const messageInput = e.target.elements.message;
    const message = messageInput.value.trim();

    if(message) {
      socket.emit('chat-message', message);
      console.log("Message sent:", message);
    }

    if (message) {
      setMsg(prevMsg => [...prevMsg, { sender: "me", content: message }]);
      messageInput.value = '';
    }
  }

  socket.on('chat-message', (message) => {
    setMsg(prevMsg => [...prevMsg, { sender: "other", content: message }]);
  });

  return (
    <div className='w-full min-h-screen'>
      <h1 className='text-4xl text-center'><span className='text-[#BF1CBA]'>K</span>oln</h1>
      <div className='grid grid-cols-3 md:grid-cols-4 gap-3'>
        <div className='relative w-full col-span-3'>
          <div className='relative'>
            {lobby && <p className='absolute top-1/2 left-1/2 transform -translate-x-1/2'>Waiting to connect you to someone</p>}
            <video className='bg-white/20 h-[45rem] w-full rounded-2xl object-cover' ref={remoteVideoRef} width={500} height={500} autoPlay playsInline></video>
            <audio ref={remoteAudioRef} autoPlay></audio>
            <div className='absolute top-4 right-4 rounded-2xl overflow-hidden border-2 border-white/20 shadow-lg'>
              <video ref={localVideoRef} width={150} height={150} autoPlay muted playsInline></video>
            </div>

            {/* Floating Control Bar */}
            {!lobby && (
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-6 bg-black/40 backdrop-blur-xl p-4 rounded-full border border-white/10 shadow-2xl z-50">
                <button
                  onClick={toggleMic}
                  title={isMuted ? "Unmute" : "Mute"}
                  className={`p-4 rounded-full transition-all duration-300 ${isMuted ? 'bg-red-500/80 hover:bg-red-600' : 'bg-white/10 hover:bg-white/20'}`}
                >
                  {isMuted ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                  )}
                </button>

                <button
                  onClick={toggleVideo}
                  title={isVideoOff ? "Turn Camera On" : "Turn Camera Off"}
                  className={`p-4 rounded-full transition-all duration-300 ${isVideoOff ? 'bg-red-500/80 hover:bg-red-600' : 'bg-white/10 hover:bg-white/20'}`}
                >
                  {isVideoOff ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10l-1-1"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                  )}
                </button>

                <button
                  onClick={handleDisconnect}
                  title="End Call"
                  className="p-4 bg-red-600 hover:bg-red-700 rounded-full transition-all duration-300 shadow-lg shadow-red-500/20"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rotate-[135deg]"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.27-2.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                </button>
              </div>
            )}
          </div>
        </div>
        <div className='bg-white/20 w-full h-[45rem] col-span-1 flex flex-col rounded-2xl'>
          <div className='h-full p-5 flex flex-col'>
            {msg.map((m, index) => (
              <div key={index} className={`p-2 my-1 w-fit rounded-lg ${m.sender === "me" ? "bg-blue-500 text-white self-end" : "bg-gray-200 text-black self-start"}`}>
                <span>{m.content}</span>
              </div>
            ))}
          </div>
          <form className='mx-2 my-2' onSubmit={handleMsgSend}>
            <div className='flex '>
              <input type="text" name="message" id="message" placeholder='Type your message' className='w-full bg-white/50 p-3 rounded-l-lg' />
              <hr className='border-l-2 border-gray-500' />
              <button 
                type="submit" 
                className='bg-white/50 p-3 rounded-r-lg'
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* {!lobby && <div className='bg-red-500 py-2 rounded-lg flex justify-center w-26 cursor-pointer'>disconnect</div>} */}
    </div>
  )
}

export default Room