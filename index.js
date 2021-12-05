import { Server } from "socket.io";
import express from 'express';
import { createServer } from 'http';


const app = express();
const httpServer = createServer(app);
const chatServer = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});



let allSockets = new Set();
let allFriends = new Set();
chatServer.on('connection', (socket) => {
    socket.username = socket.handshake.auth.username;
    //socket.join('room');
    allSockets.add(socket);
    allFriends.delete(JSON.stringify({ username: socket.username, isOnline: false }));
    allFriends.add(JSON.stringify({ username: socket.username, isOnline: true }));

    chatServer.emit("friend", { username: socket.username, isOnline: true });

    /*
    let tempClients = [];
    allSockets.forEach((socket) => {
        tempClients.push(socket.username);
        console.log("tempClients ",tempClients )
    });
    */
    let tempClients = [];
    allFriends.forEach((friend) => {
        const temp = JSON.parse(friend);
        tempClients.push(temp);
        console.log("tempClients ", tempClients)
    });
    console.log(allFriends);
    chatServer.emit("friendList", tempClients);




    socket.on('message', (msg) => {
        console.log("Received message!!", msg);
        let receiverId = null;
        allSockets.forEach(socket => {
            if (socket.username === msg.to.username)
                receiverId = socket.id
        })
        if (receiverId != null)
            chatServer.to(receiverId).emit("message", msg.message);


    });
    socket.once('disconnect', () => {
        console.log('A client disconnected!!');
        console.log("Username of closed socket ", socket.username);
        chatServer.emit("closed", { username: socket.username, isOnline: false });
        allFriends.delete(JSON.stringify({ username: socket.username, isOnline: true }));
        allFriends.add(JSON.stringify({ username: socket.username, isOnline: false }));
        console.log("FriendList after disconnect ", allFriends);
        
       
       let tempClients = [];
       allFriends.forEach((friend) => {
           const temp = JSON.parse(friend);
           tempClients.push(temp);
           console.log("tempClients ", tempClients)
       });
       chatServer.emit('friendList',tempClients)
        //socket.leave('room');

        allSockets.delete(socket);





    });





});

httpServer.listen(4000, () => {
    console.log("Server listening ");
});
