const express = require("express");
const dotenv = require("dotenv");
const connectionDB = require("./config/db");
const userRoutes = require("./routes/user.routes")
const chatRoutes = require("./routes/chat.routes")
const messageRoutes = require("./routes/message.routes")
const socketIo = require("socket.io")

const cors = require('cors');

const app = express();
dotenv.config();
connectionDB();
app.use(cors({
    origin: 'https://chatpp-git-main-k-bala-dattus-projects.vercel.app',
    methods: ['GET', 'POST', 'PUT', "PATCH", 'DELETE'],
    credentials: true
}));

app.use(express.json());

app.get("/", (req, res) => {
    res.send("welcome to chat app");
})

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

const port = process.env.PORT || 1010
const server = app.listen(port, console.log("server is running at post = ", port));

const io = socketIo(server, {
    cors: {
        origin: "https://chatpp-git-main-k-bala-dattus-projects.vercel.app",
        methods: ["GET", "POST"]
    }
});


io.on("connection", (socket) => {
    socket.on("setup", (userData) => {
        socket.join(userData._id);
        socket.emit("connected")
    })

    socket.on("join chat", (room) => {
        socket.join(room)

    })

    socket.on("new message", (newMessageRec) => {
        var chat = newMessageRec.chat;
        if (!chat.users) return console.log("chat user not defined");

        chat.users.forEach(user => {
            if (user != newMessageRec.sender._id) {
                socket.in(user).emit("message received", newMessageRec);
            }
        });
    });
});