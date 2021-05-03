import { Server, Socket } from 'socket.io'
import { createServer } from 'http'
import fastify from 'fastify'
import { v4 as uuid } from 'uuid'
import fastifyHelmet from 'fastify-helmet'

const app = fastify()
app.register(fastifyHelmet)

const io = new Server()


app.get('/room', async (req, reply) => {
  const roomId = uuid()

  io
    .to(roomId)
    .emit('message', {
      message: 'Welcome people',
      from: '@server'
    })

  return reply.send([
    roomId
  ])
})

app.listen(3000, (err) => {
  if ( err ) {
    app.log.error(err)
    process.exit(0)
  }
})
