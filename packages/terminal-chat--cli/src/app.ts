import io from 'socket.io-client'
import { log, logMessage, loopQuestion, MessagePayload } from './utils'
import * as uuid from 'uuid'
import chalk, { cyan } from 'chalk'
import clipboardy from 'clipboardy'
import Settings from 'conf'

export type Flags = {
  username: string;
  host?: string;
}

enum SocketEvents {
  MESSAGE = 'message',
  ROOM_LEAVE = 'room:leave',
  ROOM_JOIN = 'room:join'
}

enum StoreKeys {
  HOST = 'host',
  USERNAME = 'host'
}

export default async function main(input: string[], flags: Flags) {
  console.clear()

  const [ room = uuid.v4() ] = input;
  const { username, host } = flags;

  const config = new Settings({
    projectName: 't-chat',
    projectVersion: '0.0.1',
    defaults: {
      [StoreKeys.HOST]: 't-chat.fedevitale.tech',
      [StoreKeys.USERNAME]: username
    }
  })


  if ( host ) {
    const oldHost = config.get(StoreKeys.HOST)

    config.set(StoreKeys.HOST, host)
    console.log(chalk`Server changed sucessfully: {red ${oldHost}} {dim =>} {green ${host}}`)

    process.exit(0)
  }

  // Socket Stuff
  try {
    const socket = io(`ws://${config.get(StoreKeys.HOST)}`)

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

      loopQuestion(socket, room, username)
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
      logMessage(payload, room)
    })

  } catch (error) {
    log(error, 'error')
  }
}
