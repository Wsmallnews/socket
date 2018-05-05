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

    socket.on('user-connect', function (data, cb) {
        if (data != undefined && data.user != undefined && data.user.id > 0) {
            var socketId = "socket-" + data.user.id;
            var is_exist = false;
            for (let item of socketPool) {
                if (item.socketId == socketId) {
                    is_exist = true;
                }
            }

            if (!is_exist) {        // 将当前用户 放入 socket 连接池
                socketPool.push({socketId: socketId, socket: socket})
                console.log(socketPool);
            }
        }

        cb({error: 0, info: '连接成功'});
    });
});


setInterval(() => {
    var socketNum = socketPool.length;
    console.log(socketNum);
    if (socketNum > 0) {    // 连接池中有连接
        var rand = Math.random();
        console.log(rand);

        if (rand > 0.5){
            socketPool[0].socket.emit({ hello: 'socket one' });
        } else {
            if (socketPool.length > 1) {
                socketPool[1].socket.emit({ hello: 'socket two' });
            } else {
                socketPool[0].socket.emit({ hello: 'socket three' });
            }
        }
    }
}, 5000)

// io.sockets.emit('String', data);    // 给所有客户端广播消息
