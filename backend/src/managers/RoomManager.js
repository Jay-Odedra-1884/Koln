
let GLOBAL_GENERATE = 1;

export class RoomManager {
    constructor() {
        this.rooms = new Map();
    }


    createRoom(user1, user2) {
        const roomId = this.generate();

        this.rooms.set(roomId, {
            user1,
            user2
        });

        user1.socket.emit('send-offer', { roomId })
    }

    onOffer(roomId, sdp) {
        const user2 = this.rooms.get(roomId)?.user2;
        user2?.socket.emit('offer', { sdp })
    }
    
    onAnswer(roomId, sdp) {
        const user1 = this.rooms.get(roomId)?.user1;
        user1?.socket.emit('offer', { sdp });
    }
    
    generate() {
        return GLOBAL_GENERATE++;
    }
}