require('dotenv').load();       // 将 .env 中的配置读入环境变量中，可以 process.env 去到 .env 的值

var debug = (process.env.APP_DEBUG === 'true' || process.env.APP_DEBUG === true);

var Redis = require('ioredis');     // redis 库

var redis = new Redis({
    port: process.env.REDIS_PORT || 6379,          // Redis port
    host: process.env.REDIS_HOST || '127.0.0.1',   // Redis host
    password: process.env.REDIS_PASSWORD || null,
    db: process.env.REDIS_DATABASE || 0
});

// redis.set('foo', 'bar');
//
// redis.get('foo', function (err, result) {
//
// })
// console.log(redis);

var app = require('http').createServer((req, res) => {
    res.writeHead(200);
    res.write("Hello World");
    res.end('');
}).listen(parseInt(process.env.SOCKET_PORT), function() {
    if (debug) {
        console.log('Server is running ok!');
    }
});            // 创建 http 实例

var io  = require('socket.io')(app);


// io.use(function(socket, next) {
//
// });

// 区别，io.sockets.on 默认namespace 是 /, io.on 是 namespace / 的简写
// io.sockets.on
// io.on

var userSocket = io.of('/user');    // user 命名空间
var socketPool = [];

userSocket.on('connection', function(socket) {
    if (debug) {
        console.log('connection');
    }

    // setInterval(function(){
    //     socket.emit('news', { hello: 'world' });    // 通知所有 客户端 news 频道
    // }, 5000);
    // socket.broadcast.emit({ hello: 'world' });

    // console.log(socket);

    socket.on('user-connect', function (data, cb) {     // 监听用户连接
        if (data != undefined && data.user != undefined && data.user.id > 0) {
            var socketId = "SOCKET-" + socket.id;
            var socketUserId = "SOCKET-" + data.user.id;
            var is_exist = false;
            for (let item of socketPool) {
                if (item.socketId == socketId) {
                    is_exist = true;
                }
            }

            if (!is_exist) {        // 将当前用户 放入 socket 连接池
                socketPool.push({
                    socketId: socketId,
                    socketUserId: socketUserId,
                    socket: socket
                })
            }
        }

        cb({error: 0, info: '连接成功'});
    });

    socket.on('disconnect', function() {
        for (let i in socketPool) {
            if (socketPool[i].socketId == "SOCKET-" + socket.id) {
                socketPool.splice(i, 1);
                break;
            }
        }
    })
});




redis.subscribe('test-channel', function(err, count) {
    if (debug) {
        console.log('psubscribe');
    }
});

redis.on('message', function(channel, message) {
    console.log(channel);
    console.log(message);
    // message = JSON.parse(message);


    // if (message.event.indexOf('RestartSocketServer') !== -1) {
    //
    //     if (debug) {
    //         console.log('Restart command received');
    //     }
    //
    //     process.exit();
    //     return;
    // }
    //
    // if (debug) {
    //     console.log('Message received from event ' + message.event + ' to channel ' + channel);
    // }
    console.log(parseInt(message) - 1);
    console.log(socketPool)
    console.log("socketId" + socketPool[parseInt(message) - 1].socketId)
    console.log("socketUserId" + socketPool[parseInt(message) - 1].socketUserId)
    socketPool[parseInt(message) - 1].socket.emit('user-message', channel + ':这是用户' + message + '的消息');
});





// setInterval(() => {
//     var socketNum = socketPool.length;
//
//     console.log(socketNum);
//
//     if (socketNum > 0) {    // 连接池中有连接
//         var rand = Math.random();
//         console.log(rand);
//
//         if (rand > 0.5){
//             socketPool[0].socket.emit('user-message', { hello: 'socket one' });
//         } else {
//             if (socketPool.length > 1) {
//                 socketPool[1].socket.emit('user-message', { hello: 'socket two' });
//             } else {
//                 socketPool[0].socket.emit('user-message', { hello: 'socket three' });
//             }
//         }
//     }
// }, 5000)

// io.sockets.emit('String', data);    // 给所有客户端广播消息
