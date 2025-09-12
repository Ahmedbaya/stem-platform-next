import { Server as NetServer } from "http"
import { Server as SocketIOServer } from "socket.io"
import { NextApiResponse } from "next"

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: SocketIOServer
    }
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}

let io: SocketIOServer

export function getIO() {
  return io
}

export function initSocket(server: NetServer) {
  if (!io) {
    io = new SocketIOServer(server, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    })

    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id)

      socket.on("join-competition", (competitionId: string) => {
        socket.join(`competition:${competitionId}`)
      })

      socket.on("join-team", (teamId: string) => {
        socket.join(`team:${teamId}`)
      })

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id)
      })
    })
  }
  return io
} 