const express = require('express')
const app = express()
const socket = require('socket.io')
const server = app.listen(3000)
const io = socket.listen(server)

app.use(express.static('public'))

io.on('connection', function(socket){
    
    socket.emit('newColor', {color: '#777'})

    socket.on('requestColor', function(data){
        console.log(data)
        let ambientHex = '#' + (Math.random() * 0xFFFFFF << 0).toString(16)
        socket.emit('newColor', {color: ambientHex})
    })
})


