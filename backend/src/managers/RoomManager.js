
let GLOBAL_GENERATE = 1;

export class RoomManager {
    constructor() {
        this.rooms = new Map();
    }


    createRoom(user1, user2) {
        const roomId = this.generate().toString();

        console.log("here create");
        this.rooms.set(roomId, {
            user1,
            user2
        });
        
        user1.socket.emit('send-offer', { roomId })
        user2.socket.emit('send-offer', { roomId })
    }

    onOffer(roomId, sdp) {
        console.log("inside onOffer");
        
        const user2 = this.rooms.get(roomId)?.user2;
        user2?.socket.emit('offer', { roomId, sdp })
    }
    
    onAnswer(roomId, sdp) {
        console.log("inside onAnswer");
        const user1 = this.rooms.get(roomId)?.user1;
        user1?.socket.emit('answer', { roomId, sdp });
    }
    
    generate() {
        return GLOBAL_GENERATE++;
    }
}