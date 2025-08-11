
let GLOBAL_ROOM_ID = 1;

export class RoomManager {
    constructor() {
        this.rooms = new Map();
    }

    createRoom(user1, user2) {
        const roomId = this.generate().toString();

        this.rooms.set(roomId, {
            user1,
            user2
        });
        
        // Both users get the send-offer event
        user1.socket.emit('send-offer', { roomId });
        user2.socket.emit('send-offer', { roomId });
    }

    onOffer(roomId, sdp, senderSocketId) {
        console.log("inside onOffer");
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        
        const receivingUser = room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
        receivingUser?.socket.emit('offer', { roomId, sdp });
    }
    
    onAnswer(roomId, sdp, senderSocketId) {
        console.log("inside onAnswer");
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }

        const receivingUser = room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
        receivingUser?.socket.emit('answer', { roomId, sdp });
    }

    onIceCandidates(roomId, senderSocketId, candidate, type) {
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }

        const receivingUser = room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
        receivingUser.socket.emit("add-ice-candidate", { candidate, type });
    }
    
    generate() {
        return GLOBAL_ROOM_ID++;
    }
}