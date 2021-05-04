import http from 'http'
import { Server } from 'socket.io'
import chalk from 'chalk'
import signale from 'signale'
import Express from 'express'
import morgan from 'morgan'

const PORT = parseInt(process.env.PORT as string) || 8080;
const HOST = process.env.HOST || '0.0.0.0'

const app = Express()

const server = http.createServer(app)
const io = new Server(server)

type Message = {
  body: string;
  username: string;
}

enum SocketEvents {
  MESSAGE = 'message',
  ROOM_LEAVE = 'room:leave',
  ROOM_JOIN = 'room:join'
}

io.on('connect', socket => {
  let room: string;
  signale.success(chalk`Someone has connected with ID {underline ${socket.id}}`)

  socket.on(SocketEvents.ROOM_JOIN, ({ username, roomId }: any) => {
    signale.info(chalk`User: {yellow ${username}} has join {magenta ${room}}`)

    room = roomId
    socket.join(room)

    socket
      .to(room)
      .emit(SocketEvents.ROOM_JOIN, { username })
  })

  socket.on(SocketEvents.ROOM_LEAVE, ({ username }: any) => {
    signale.info(chalk`User: {yellow ${username}} has left {magenta ${room}}`)

    socket
      .leave(room)

    socket
      .to(room)
      .emit(SocketEvents.ROOM_LEAVE, { username })
  })

  socket.on(SocketEvents.MESSAGE, (msg: Message) => {
    signale.debug(`Message from ${msg.username}: ${msg.body} to ${room}`)

    socket
      .to(room)
      .emit(SocketEvents.MESSAGE, msg)
  })
})


app.use(morgan('tiny'))
app.get('*', (req, res) => {
  return res.send({
    message: 'Hello World'
  })
})

server.listen(PORT, HOST, function() {
  console.log(`Server started at: http://${HOST}:${PORT}`)
})
