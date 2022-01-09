const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const path = require('path')
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });

let userList = []
// 配置静态资源目录
app.use(express.static(path.join(__dirname, '/public')))
io.on("connection", (socket) => {
    console.log('用户连接socket成功！')
    // on和emit实现服务端与客户端之间的通信
    // 客户端和服务端都有on和emit事件
    /**
     * io.emit()向所有的客户端广播
     * socket.emit()向建立连接的客户端广播
     * socket.broadcast.emit()向建立连接以外的客户端广播
     */
    // io.emit('hello', '你好我是服务端的数据')
    // // 使用on监听事件
    // socket.on('client', data => {
    //     console.log('客户端发来的数据', data)
    // })
    socket.on('login', data => {
        console.log('客户端发来的数据', data)
        userList.push({ ...data, id: socket.id })
        io.emit('join', { name: data.nickname + '加入聊天室' })
        io.emit('user list', userList)
    })
});

httpServer.listen(3000, () => {
    console.log('socket创建成功！')
});