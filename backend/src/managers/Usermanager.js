import { RoomManager } from "./RoomManager";

export class Usermanager {
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
        this.clerQueue();
        this.initHandler(socket);
    }

    removeUser(socketId) {
        this.users.filter(x => x.socket.id === socketId);
        this.queue.filter(x => x === socketId);
    }

    clerQueue() {
        let user1 = this.users.find(x => x.socket.id === this.queue.pop());
        let user2 = this.users.find(x => x.socket.id === this.queue.pop());

        if(!user1 || user2) {
            return;
        }

        const room = roomManager.createRoom(user1, user2);
    }

    initHandler(socket) {
        socket.on('offer', (sdp, roomId) => {
            this.roomManager.onOffer(roomId, sdp);
        });

        socket.on('answer', (sdp, roomId) => {
            this.roomManager.onAnswer(roomId, sdp);
        })
    }
}