/** Required Dependencies */
import * as dotenv from "dotenv"
import express from "express"
import cors from "cors"
import helmet from "helmet"
import http from "http"
import {Server, Socket} from "socket.io"

dotenv.config()

/** App variables */
if(!process.env.PORT) process.exit(1)
const PORT: number = parseInt(process.env.PORT as string, 10);
const app = express()


/** App config */
app.use(helmet())
app.use(cors())
app.use(express.json())


/** Server init */
const httpServer = http.createServer(app)
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    }
})

io.on("connection", (socket: Socket) => {
    socket.emit("me", socket.id)

    socket.on("disconnect", () => {
        socket.broadcast.emit("call ended")
    })

    socket.on("callUser", (data) => {
        io.to(data.userToCall).emit("callUser", {signal: data.signalData, from: data.from, name: data.name})
    })

    socket.on("answerCall", (data) => {
        io.to(data.to).emit("callAccepted",  data.signal)
    })
});

httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
});