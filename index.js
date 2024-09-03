import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import path from 'path'

import http from 'http'
import { Server as SocketIOServer } from 'socket.io';

import folderRoutes from './routes/folderRoutes.js'
import fileRoutes from './routes/fileRoutes.js'

import firebase from "./firebase.js"

dotenv.config({ path: '.env.local' })
const app = express()
app.use(express.static(path.resolve('public')))
app.use(express.json())
app.use(cors())
app.set('view engine', 'ejs');

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: "*",
    credentials: true
  }
});

firebase.setup(io)

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('listFiles', (folderId) => {
    
    firebase.listFiles(folderId, socket)
  });

  socket.on('disconnect', () => {
    firebase.unsubscribeListeners(socket)
    console.log('Client disconnected');
  });
});


app.get('/', (req, res) => {
  res.render('index', { listeners: Object.fromEntries(firebase.activeListeners) });
})

app.use('/folders', folderRoutes)
app.use('/files', fileRoutes)


const PORT = process.env.PORT || 3000
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`))