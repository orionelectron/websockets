import { Server } from "socket.io";
import express from 'express';
import { createServer } from 'http';
import { io } from "socket.io-client";

const app = express();
const httpServer = createServer(app);
const chatServer = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});



let allSockets = new Set();
chatServer.on('connection', (socket) => {
    socket.username = socket.handshake.auth.username;
    //socket.join('room');
    allSockets.add(socket);

    chatServer.emit("friend", socket.username);
    let tempClients = [];
    allSockets.forEach((socket) => {
        tempClients.push(socket.username);
        console.log("tempClients ",tempClients )
    });
    chatServer.emit("friendList", tempClients);
    
    
    

    socket.on('message', (msg) => {
        console.log("Received message!!", msg);
        let receiverId = null;
        allSockets.forEach(socket => {
           if (socket.username === msg.to)
            receiverId = socket.id
        })

        chatServer.to(receiverId).emit("message", msg.message);


    });
    socket.once('disconnect', () => {
        console.log('A client disconnected!!');
        chatServer.emit("closed", socket.username);
        //socket.leave('room');

        allSockets.delete(socket);
      




    });





});

httpServer.listen(4000, () => {
    console.log("Server listening ");
});
