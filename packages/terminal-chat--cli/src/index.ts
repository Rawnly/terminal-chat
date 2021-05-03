import io from 'socket.io-client'
import { log, logMessage, sendMessage, waitForUserText } from './utils'
import ora from 'ora'
import * as uuid from 'uuid'

export type Flags = {
  username: string;
}

export default async function main(input: string[], flags: Flags) {
  const spinner = ora({
    spinner: 'bouncingBall',
    color: 'green',
    text: 'Connecting...',
  })

  const { username } = flags;
  const [ room = uuid.v4() ] = input;

  console.clear()

  spinner.start()
  try {
    const socket = io('ws://localhost:3000')

    socket.io.on('open', () => {
      spinner.succeed('Connection established!')

      socket.emit('join-room', room)
      log(`Joined: ${room}`, 'success')

      waitForUserText(socket, username)
    })

    socket.io.on('close', () => {
      log('DISCONNECTING...', 'warn')
    })

    socket.on('message', (payload: Record<string, string>) => {
      if ( payload.username === username ) return;
      logMessage(payload)
    })

  } catch (error) {
    console.error(error)
  }
}
