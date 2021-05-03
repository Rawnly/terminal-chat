import io from 'socket.io-client'
import { log, sendMessage, logMessage, loopQuestion, MessagePayload } from './utils'
import * as uuid from 'uuid'
import chalk from 'chalk'
import clipboardy from 'clipboardy'
import readline from 'readline'

export type Flags = {
  username: string;
}

enum SocketEvents {
  MESSAGE = 'message',
  ROOM_LEAVE = 'room:leave',
  ROOM_JOIN = 'room:join'
}

export default async function main(input: string[], flags: Flags) {
  console.clear()

  const { username } = flags;
  const [ room = uuid.v4() ] = input;

  try {
    const socket = io('ws://localhost:3000')

    process.on('SIGINT', () => {
      console.log()

      log('Disconnecting...', 'warn')
      socket.emit(SocketEvents.ROOM_LEAVE, {
        username
      })

      process.exit(0)
    })

    socket.io.on('open', async () => {
      log(`Connected as ${username}`, 'success')

      // Join the room
      socket.emit(SocketEvents.ROOM_JOIN, {
        username,
        roomId: room
      })


      if (!input[0]) {
        await clipboardy.write(room)
      }

      log(`Joined: ${room}${!input[0] ? ' (Copied to clipboard)' : ''}`, 'dim')
      log('Press Ctrl+C to exit.', 'dim')

      console.log('')

      loopQuestion(socket, username)
    })

    socket.io.on('close', () => {
      log('Connection lost... I will reconnect as soon as possible.', 'warn')
      log('Press Ctrl+C to exit.', 'dim')

      socket.emit(SocketEvents.ROOM_LEAVE, {
        username,
        roomId: room
      })
    })

    socket.on(SocketEvents.ROOM_LEAVE, ({ username }: Omit<MessagePayload, 'body'>) => {
      log(chalk`{yellow @${username}} has {underline {red left}}.`, 'announcement')
    })

    socket.on(SocketEvents.ROOM_JOIN, ({ username }: Omit<MessagePayload, 'body'>) => {
      log(chalk`{yellow @${username}} has {green {underline joined}}.`, 'announcement')
    })

    socket.on(SocketEvents.MESSAGE, (payload: MessagePayload) => {
      if ( payload.username === username ) return;
      logMessage(payload, username)
    })

  } catch (error) {
    console.error(error)
  }
}
