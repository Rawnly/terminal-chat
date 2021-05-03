import io from 'socket.io-client'
import meow from 'meow'
import got from 'got'
import { log, logMessage, sendMessage, waitForUserText } from './utils'
import os from 'os'

const cli = meow({
  flags: {
    join: {
      type: 'string',
    },
    require: {
      type: 'boolean'
    },
    username: {
      type: 'string'
    }
  }
})

const { flags, input: [ command ] } = cli;

type RequestRoomBody = {
  roomId: string;
}

(async function main() {
  const username = flags.username || os.userInfo().username;

  if ( flags.require ) {
    const { body } = await got<RequestRoomBody>('http://localhost:3000/get-room', { method: 'GET', parseJson: text => JSON.parse(text) })
    console.log('Random room name:' + body.roomId)
  } else if ( flags.join ) {
    const socket = io('ws://localhost:3000')

    socket.io.on('open', () => {
      log('Connected!')

      socket.emit('join-room', flags.join)
      log("Joined: " + flags.join)

      waitForUserText(socket, username)
    })

    socket.io.on('close', () => {
      log('DISCONNECTING...')
    })

    socket.on('message', (payload: Record<string, string>) => {
      if ( payload.username === username ) return;
      logMessage(payload)
    })
  }
})()
