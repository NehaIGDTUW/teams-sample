const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
// Import the peer library that we installed.
const { ExpressPeerServer } = require('peer');
// Use Express Peer Server
const peerServer = ExpressPeerServer(server, {
    debug: true
});
const { v4: uuidV4 } = require('uuid')
// specify to peer server the specific url that we are using.
// Now our Peer Server is live.
app.use('/peerjs', peerServer)

app.set('view engine', 'ejs')
//Telling the server that where is our public files are located
app.use(express.static('public'))

// for making the URL
app.get('/', (req, res) => {
    // we know that our main router in loclahost:3030. 
    //When I go there then it will redirect it to a unique id that is generated via uuid 
    //and that id is our room.
    res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
})
io.on('connection', socket => {
    // inside this socketio function
    // when the user will go inside here then he/she will
    //join the room
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        // if one person joined someone's room where other users are connected
        // then below line will tell that one new user has joined the room to all the users
        // all the users can then add the new user to their stream
        // By emiting that a new user has conneted we are also telling them that
        // the user id of the new user is this (userId).
        socket.to(roomId).emit('user-connected', userId);

        // when the user 1 and 2 are getting connected after that,
        // we want that the message sent by the sender(user 1 suppose) should be received by the receiver(user 2).
        socket.on('message', (message) => {
            // message should be sent to that specific room and no where else
            io.to(roomId).emit('createMessage', message)
        });
    })
})
server.listen(process.env.PORT || 3030)
