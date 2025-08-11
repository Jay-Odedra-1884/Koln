import { RoomManager } from "./RoomManager.js";

export class UserManager {
    constructor() {
        this.users = [];
        this.queue = [];
        this.roomManager = new RoomManager();
    }

    addUser(name, socket) {
        this.users.push({
            name,
            socket
        });

        this.queue.push(socket.id);
        console.log("queue: ", this.queue);
        socket.emit('lobby');
        this.clearQueue();
        this.initHandlers(socket);
    }

    removeUser(socketId) {
        const user = this.users.find(x => x.socket.id === socketId);

        this.users = this.users.filter(x => x.socket.id !== socketId);
        this.queue = this.queue.filter(x => x !== socketId); // Fixed: should be !== instead of ===
    }

    clearQueue() {
        console.log("inside clear queue");
        console.log("queue length:", this.queue.length);
        
        if (this.queue.length < 2) {
            return;
        }

        const id1 = this.queue.pop();
        const id2 = this.queue.pop();
        
        console.log("connecting users:", id1, id2);

        const user1 = this.users.find(x => x.socket.id === id1);
        const user2 = this.users.find(x => x.socket.id === id2);

        if (!user1 || !user2) {
            console.log("User not found");
            return;
        }

        console.log("creating room");
        this.roomManager.createRoom(user1, user2);
        this.clearQueue(); // Continue clearing if more users in queue
    }

    initHandlers(socket) {
        socket.on('offer', ({ roomId, sdp }) => {
            console.log("received offer from client");
            this.roomManager.onOffer(roomId, sdp, socket.id);
        });

        socket.on('answer', ({ roomId, sdp }) => {
            console.log("received answer from client");
            this.roomManager.onAnswer(roomId, sdp, socket.id);
        });

        socket.on("add-ice-candidate", ({ roomId, candidate, type }) => {
            this.roomManager.onIceCandidates(roomId, socket.id, candidate, type);
        });
    }
}