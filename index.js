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

io.on('connection', function(socket) {
    if (debug) {
        console.log('connection');
    }

    // setInterval(function(){
    //     socket.emit('news', { hello: 'world' });    // 通知所有 客户端 news 频道
    // }, 5000);
    // socket.broadcast.emit({ hello: 'world' });



    socket.on('my other event', function (data, cb) {
        console.log(data);
        cb('smallnews');
        // console.log(data);
    });
});


// io.sockets.emit('String', data);    // 给所有客户端广播消息
















1
