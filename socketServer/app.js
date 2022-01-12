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
    // socketObject.emit()可以给指定的socketObject客户端发送广播
    // socketObject可以从io.sockets.sockets
    // const id = io.sockets.sockets.get(data.id)
    socket.on('login', data => {
        console.log('客户端发来的数据', data)
        userList.push({ ...data, id: socket.id })
        io.emit('join', { name: data.nickname + '加入聊天室', id: socket.id })
        io.emit('user list', userList)
    })
    socket.on('send message', data => {
        console.log('客户端发来的消息', data)
        data.from = "other"
        if (data.id == "") {// 不是私聊
            socket.broadcast.emit('get message', data)
        } else {// 有socketid，是私聊
            // 只给指定的socket客户端发送消息
            const toSocket = io.sockets.sockets.get(data.id)
            toSocket.emit('get message', data)
        }
    })
    // 关闭连接，disconnect事件自动触发
    socket.on('disconnect', () => {
        const user = userList.find(u => socket.id == u.id)
        console.log('用户关闭连接',user)
        if(user){
            userList.splice(userList.findIndex(u => socket.id == u.id),1)
            io.emit('leave', {name:user.nickname + '离开聊天室'})
            // 发送最新的用户列表
            io.emit('user list', userList)
        }
    })
});

httpServer.listen(3000, () => {
    console.log('socket创建成功！')
});