const io  = require('socket.io')(process.env.PORT || 8000);
// const app = require('http').createServer(handler)

// io.listen(8000);

console.log('Server started.');

let amountOfSockets = 0;
const socketData = new Map();

io.on('connection', socket => {

    amountOfSockets++;
    console.log(`Socket joined. Now have ${amountOfSockets} sockets.`);
    
    socket.on('join', (name, roomid) => {
        socket.join(roomid);
        console.log(`A socket has joined Room '${roomid}'. The room now has ${io.sockets.adapter.rooms[roomid].length} members.`);
        socketData.set(socket.id, { roomid, name });
        socket.to(roomid).emit('join', name);
    });

    socket.on('message', text => {
        console.log('Got message. + ' + text);

        if (!socketData.get(socket.id).roomid) {
            return;
        }

        console.log(`A socket said '${text}' in room ${socketData.get(socket.id).roomid}.`);
        socket.to(socketData.get(socket.id).roomid).emit('message', socketData.get(socket.id).name, text);
    });

    socket.on('disconnect', () => {        
        if (socketData.get(socket.id).roomid) {
            socket.leave(socketData.get(socket.id).roomid);
            const room = io.sockets.adapter.rooms[socketData.get(socket.id).roomid];
            const msg = room ? room.length : '0';
            console.log(`A socket has left Room '${socketData.get(socket.id).roomid}'. The room now has ${msg} members. Now there are ${--amountOfSockets} sockets.`);
        } else {
            console.log(`A socket without a room has disconnected. Now there are ${--amountOfSockets} sockets.`);
        }
        socket.to(socketData.get(socket.id).roomid).emit('leave', socket.user);
    });
});