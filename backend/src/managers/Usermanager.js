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
        console.log("queue: ",this.queue);
        socket.send('lobby');
        this.clerQueue();
        this.initHandler(socket);
    }

    removeUser(socketId) {
        this.users = this.users.filter(x => x.socket.id !== socketId);
        this.queue = this.queue.filter(x => x !== socketId);
    }

    clerQueue() {
        if(this.queue.length < 2) {
            return;
        }

        let id1 = this.queue.pop();
        let id2 = this.queue.pop();

        let user1 = this.users.find(x => x.socket.id === id1);
        let user2 = this.users.find(x => x.socket.id === id2);        

        if(!user1 || !user2) {
            console.log("inside if");
            
            return;
        }

        const room = this.roomManager.createRoom(user1, user2);
        this.clerQueue();
    
    }

    initHandler(socket) {
        socket.on('offer', ({ roomId, sdp }) => {
        console.log("inside Offer");
            this.roomManager.onOffer(roomId, sdp);
        });

        socket.on('answer', ({ roomId, sdp }) => {
        console.log("inside asnawer");
            this.roomManager.onAnswer(roomId, sdp);
        })
    }
}