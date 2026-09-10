<div align="center">

# 🎥 Koln

### A real-time, peer-to-peer random video chat platform — inspired by Omegle

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen?style=for-the-badge)](https://koln-o967.vercel.app/)
[![React](https://img.shields.io/badge/React-Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-realtime-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![WebRTC](https://img.shields.io/badge/WebRTC-P2P-FF6B35?style=for-the-badge&logo=webrtc&logoColor=white)](https://webrtc.org/)

**[🌐 Live Demo](https://koln-o967.vercel.app/)** · **[🐛 Report a Bug](../../issues)** · **[✨ Request a Feature](../../issues)**

</div>

---

## 📖 About The Project

**Koln** is a real-time, peer-to-peer video chat platform that randomly pairs strangers for live video conversations — built in the spirit of **Omegle**. It focuses on the hardest part of these apps: establishing a direct, low-latency **WebRTC** connection between two browsers, with a **Socket.io** signaling server orchestrating the handshake, matchmaking, and connection lifecycle in real time.

This project was built to go deep on real-time systems — not just CRUD — covering peer discovery, signaling protocols, media stream negotiation, and the connection-state edge cases (disconnects, skips, re-matching) that make P2P video genuinely tricky to get right.

> 🚧 **Status: Active development.** Core video calling and random matchmaking are live. In-call **text messaging** is currently in progress — see [Roadmap](#-roadmap--in-progress) below.

---

## ✨ Key Features

- 🎲 **Random Stranger Matchmaking** — Users are paired with a random online peer the moment they connect, with automatic re-matching on skip or disconnect.
- 📹 **Live Peer-to-Peer Video & Audio** — Direct browser-to-browser media streaming via **WebRTC**, minimizing latency by not routing video through the server.
- 🔌 **Real-Time Signaling Server** — A **Socket.io**-powered backend handles offer/answer/ICE-candidate exchange, connection events, and user presence — the "matchmaker" that gets two strangers' browsers talking directly to each other.
- ⏭️ **Skip / Next Stranger** — Instantly leave the current call and get re-queued for a new random match, without a page reload.
- 🎛️ **Media Controls** — Toggle camera and microphone on/off mid-call.
- ⚡ **Fast, Modern Frontend** — Built with **React + Vite** for instant dev feedback and a snappy production bundle.
- 🌐 **Deployed & Publicly Accessible** — Live on Vercel, with the signaling server handling real cross-network peer connections (not just localhost demos).

---

## 🚧 Roadmap / In Progress

- [ ] **In-call text messaging** — real-time chat alongside the video stream (currently being built)
- [ ] TURN server fallback for users behind restrictive NATs/firewalls
- [ ] Random matching (fully random pairing)
- [ ] Report / block functionality for user safety (Pending)
- [ ] Mobile-responsive UI polish (Need Improvement)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React (Vite) |
| **Backend** | Node.js + Express |
| **Real-Time Signaling** | Socket.io (WebSockets) |
| **Video/Audio Transport** | WebRTC (peer-to-peer) |
| **Deployment** | Vercel |

---

## 🏗️ How It Works (Architecture)

Koln separates **signaling** (handled by the server) from **media** (handled directly between browsers) — the standard, efficient pattern for WebRTC apps:

```
Koln/
├── backend/     # Express + Socket.io signaling server — matchmaking, offer/answer/ICE relay
└── frontend/    # React (Vite) client — UI, camera/mic access, WebRTC peer connection logic
```

**Connection flow:**

1. A user opens the app → the React client requests camera/mic access and connects to the Socket.io server.
2. The server places the user in a matchmaking queue and pairs them with another waiting user.
3. The two clients exchange a WebRTC **offer**, **answer**, and **ICE candidates** — relayed through the Socket.io server (this is the "signaling" step; no video data passes through the server).
4. Once negotiation completes, a **direct peer-to-peer connection** streams video/audio between the two browsers.
5. On skip or disconnect, the server tears down the pairing and re-queues both users for new matches.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Jay-Odedra-1884/Koln.git
   cd Koln
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   npm start
   ```

3. **Set up the frontend** (in a new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. Open the frontend's local URL (typically `http://localhost:5173`) in **two different browser tabs/windows** to test matchmaking and video calling locally.

> 💡 For real cross-device testing, both peers need working STUN/TURN access — testing over the same local network or via the deployed Vercel link is the easiest way to see true P2P behavior.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome — especially around the in-progress messaging feature!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the ISC License.

---

## 👤 Author

**Jay Odedra**

- GitHub: [@Jay-Odedra-1884](https://github.com/Jay-Odedra-1884)

<div align="center">

If you found this project interesting, consider giving it a ⭐ — it helps a lot!

</div>
