const express = require('express')
const socketIo = require('socket.io')
const path = require('path')
const bodyParser = require('body-parser')
const Server = socketIo.Server
const PORT = process.env.PORT || 3500
const app = express()
let userName = ""
const users = {};

app.use(bodyParser.urlencoded({extended: true}))
app.get('/', (req,res) => res.sendFile(path.join(__dirname,'../dist/index.html')))
app.get('/api/node_modules/bootstrap/dist/css/bootstrap.min.css', (req,res) => res.sendFile(path.join(__dirname,'../api/node_modules/bootstrap/dist/css/bootstrap.min.css')))
app.get('/api/node_modules/bootstrap/dist/js/bootstrap.min.js', (req,res) => res.sendFile(path.join(__dirname,'../api/node_modules/bootstrap/dist/js/bootstrap.min.js')))
app.get('/style.css', (req,res) => res.sendFile(path.join(__dirname,'../dist/style.css')))
app.get('/app.js', (req,res) => res.sendFile(path.join(__dirname,'../dist/app.js')))
app.post('/chat', (req, res) => {
    userName = req.body.UserName
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
    users[socket.id] = userName;
    console.log(`User ${users[socket.id]} connected`)

    //Upon connection - only to user
    socket.emit('message', "Welcome to Chat App!")

    //Upon connection - to all others
    socket.broadcast.emit('message', `User ${users[socket.id]} connected`)

    //listening for a message event
    socket.on('message', data => {
        console.log(data)
        io.emit('message', `${users[socket.id]}: ${data}`)
    })

    //when user disconnects - to all others
    socket.on('disconnect', () => {
        socket.broadcast.emit('message', `User ${users[socket.id]} disconnected`)
        delete users[socket.id];
    })

    //Listen for activity
    socket.on('activity', (name) => {
        name = users[socket.id]
        socket.broadcast.emit('activity', name)
    })
})
