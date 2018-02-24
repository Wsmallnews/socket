var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
    // res.send('<h1>Hello World</h1>');
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
    console.log('a user connected');

    socket.on('chat message', function(msg) {       // 多人聊天
        io.emit('chat message', msg);    // 发送给所有人，包括自己
        // socket.broadcast.emit('chat message', msg);      // 广播给除了自己之外的所有人
    })
    //
    // socket.on('disconnect', function() {
    //     console.log('user disconnect');
    // })
});

http.listen(3000, function() {
    console.log('listening on *: 3000');
});
