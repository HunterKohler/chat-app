const http = require('http')
const path = require('path')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { Message, Location } = require('./utils/messages')
const Users = require('./utils/users')

const { PORT } = process.env
const publicDirPath = path.join(__dirname, '../public')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.static(publicDirPath))


io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    socket.on('join', ({ username, room }, callback) => {
        const user = Users.add(socket.id, username, room)

        if (user.error) {
            return callback(user.error)
        }

        socket.join(room)

        socket.emit('message', new Message('Welcome'))
        socket.broadcast.to(user.room)
            .emit('message', new Message(`${user.username} has joined the room.`))
        io.to(user.room)
            .emit('roomData', {
                room: user.room,
                users: Users.getRoom(user.room)
            })
        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const user = Users.get(socket.id)
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback(new Message('Please refrain from profanity.'))
        }

        io.to(user.room)
            .emit('message', new Message(message, user))
        callback()
    })

    socket.on('sendLocation', (coords, callback) => {
        const user = Users.get(socket.id)

        io.to(user.room)
            .emit('locationMessage', new Location(coords, user))
        callback()
    })

    socket.on('disconnect', () => {
        const user = Users.remove(socket.id)

        if (user) {
            io.to(user.room)
                .emit('message', new Message(`${user.username} has left the room.`))
            io.to(user.room)
                .emit('roomData', {
                    room: user.room,
                    users: Users.getRoom(user.room)
                })
        }
    })
})

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})