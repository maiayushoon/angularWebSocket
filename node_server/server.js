import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectToDB from './db/db.js';
import router from './routers/routes.js';
import { Server } from 'socket.io';
import http from 'http';
import { Message } from './models/Message.js';


const app = express();
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

dotenv.config();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', router);

// Connect to MongoDB
connectToDB()
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });

// Socket.IO
const users = new Map();

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('register', (username) => {
        if (!username) return;

        users.set(socket.id, username);
        socket.username = username;
        console.log(`User registered: ${username}`);

        // Send updated online user list
        const onlineUsers = Array.from(users.values());
        io.emit('userList', onlineUsers);
    });

    socket.on('loadMessages', async ({ recipient }) => {
        const messages = await Message.find({
            $or: [
                { sender: socket.username, recipient },
                { sender: recipient, recipient: socket.username }
            ]
        }).sort({ timestamp: 1 });
        socket.emit('loadMessages', messages);
    });

    socket.on('privateMessage', async ({ recipient, message }) => {
        const sender = socket.username;
        const newMsg = new Message({ sender, recipient, message });
        await newMsg.save();

        // Emit to sender
        socket.emit('privateMessage', newMsg);

        // Emit to recipient if online
        for (let [id, name] of users) {
            if (name === recipient) {
                io.to(id).emit('privateMessage', newMsg);
            }
        }
    });

    socket.on('getLastMessage', async ({ recipient }) => {
        const lastMsg = await Message.findOne({
            $or: [
                { sender: socket.username, recipient },
                { sender: recipient, recipient: socket.username },
            ]
        }).sort({ timestamp: -1 });

        if (lastMsg) {
            socket.emit('lastMessage', {
                user: recipient,
                message: lastMsg.message,
                timestamp: lastMsg.timestamp,
                sender: lastMsg.sender,
            });
        }
    });

    socket.on('loadAllMessages', async () => {
        try {
            const allMessages = await Message.find({
                $or: [
                    { sender: socket.username },
                    { recipient: socket.username },
                ]
            }).sort({ timestamp: 1 });

            socket.emit('allMessages', allMessages);
        } catch (err) {
            console.error('Error loading all messages:', err);
        }
    });


    socket.on('disconnect', () => {
        const username = users.get(socket.id);
        users.delete(socket.id);
        console.log(`${username || 'Unknown user'} disconnected`);

        // Update user list
        const onlineUsers = Array.from(users.values());
        io.emit('userList', onlineUsers);
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

