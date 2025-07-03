import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { UserManager } from './managers/Usermanager.js';


const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
})

const userManager = new UserManager();

io.on('connection', (socket) => {
    console.log("User connected");
    userManager.addUser("randomUser", socket)

    socket.on('disconnect', () => {
        userManager.removeUser(socket.id)
    })
    
} )


app.get('/', (req, res) => {
    res.send("server is running......");
});

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
    console.log(`Server is running in port : ${PORT}`);  
})