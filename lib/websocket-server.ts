const { Server: SocketIOServer } = require('socket.io')
const { createServer } = require('http')
const { Socket } = require('socket.io')

const httpServer = createServer()
const io = new SocketIOServer(httpServer, {
  path: "/api/socket",
  addTrailingSlash: false,
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ["websocket"],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 45000,
  maxHttpBufferSize: 1e8
})

io.on("connection", (socket: typeof Socket) => {
  console.log("Client connected:", socket.id)

  socket.on("join-competition", (competitionId: string) => {
    socket.join(`competition:${competitionId}`)
    console.log(`Client ${socket.id} joined competition: ${competitionId}`)
  })

  socket.on("join-team", (teamId: string) => {
    socket.join(`team:${teamId}`)
    console.log(`Client ${socket.id} joined team: ${teamId}`)
  })

  socket.on("team-registered", (data: { competitionId: string, teamId: string, teamName: string }) => {
    console.log("Team registered:", data)
    io.to(`competition:${data.competitionId}`).emit("new-team-registration", {
      teamId: data.teamId,
      teamName: data.teamName,
      timestamp: new Date().toISOString()
    })
  })

  socket.on("team-approved", (data: { competitionId: string, teamId: string, teamName: string }) => {
    console.log("Team approved:", data)
    io.to(`team:${data.teamId}`).emit("team-status-updated", {
      status: "approved",
      competitionId: data.competitionId,
      teamName: data.teamName,
      timestamp: new Date().toISOString()
    })
  })

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id)
  })
})

// Start the server on port 3001
httpServer.listen(3001, () => {
  console.log('WebSocket server listening on port 3001')
})

module.exports = { io } 