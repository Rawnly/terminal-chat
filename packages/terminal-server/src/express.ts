import Express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import * as uuid from 'uuid'



const app = Express()
app.set('port', 3000)

const server = http.createServer(app)
const io = new Server(server)

type Message = {
  body: string;
  username: string;
}

io.on('connect', socket => {
  let room: string;

  socket.on('join-room', (payload: any) => {
    room = payload
    socket.join(payload)
  })

  socket.on('leave-room', (payload: any) => {
    socket.leave(room)
  })

  socket.on('message', (msg: Message) => {
    socket.to(room).emit('message', msg)
  })
})


app.get('/get-room', (req, res) => {
  return res.send({
    roomId: uuid.v4()
  })
})

server.listen(3000, function() {
  console.log('Server started at: http://localhost:3000')
})
