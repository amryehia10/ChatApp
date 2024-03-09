const express = require('express')
const socketIo = require('socket.io')
const path = require('path')
const bodyParser = require('body-parser')
const Server = socketIo.Server
const PORT = process.env.PORT || 3500
const app = express()
let userName = ""
app.use(bodyParser.urlencoded({extended: true}))
app.get('/', (req,res) => res.sendFile(path.join(__dirname,'../dist/index.html')))
app.get('/dist/node_modules/bootstrap/dist/css/bootstrap.min.css', (req,res) => res.sendFile(path.join(__dirname,'../dist/node_modules/bootstrap/dist/css/bootstrap.min.css')))
app.get('/dist/node_modules/bootstrap/dist/js/bootstrap.min.js', (req,res) => res.sendFile(path.join(__dirname,'../dist/node_modules/bootstrap/dist/js/bootstrap.min.js')))
app.get('/style.css', (req,res) => res.sendFile(path.join(__dirname,'../dist/style.css')))
app.get('/app.js', (req,res) => res.sendFile(path.join(__dirname,'../dist/app.js')))
app.post('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, "../dist/chat.html"));
})

const expressServer = app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
})

const io = new Server(expressServer, {
    cors: {
        origin: process.env.NODE_ENV === "production" ? false : ["http://localhost:5500", "http://127.0.0.1:5500"]
    }
})

io.on('connection', socket => {
    console.log(`User ${socket.id} connected`)

    //Upon connection - only to user
    socket.emit('message', "Welcome to Chat App!")

    //Upon connection - to all others
    socket.broadcast.emit('message', `User ${socket.id.substring(0, 5)} connected`)

    //listening for a message event
    socket.on('message', data => {
        console.log(data)
        io.emit('message', `${socket.id.substring(0, 5)}: ${data}`)
    })

    //when user disconnects - to all others
    socket.on('disconnect', () => {
        socket.broadcast.emit('message', `User ${socket.id.substring(0, 5)} disconnected`)
    })

    //Listen for activity
    socket.on('activity', (name) => {
        socket.broadcast.emit('activity', name)
    })
})
