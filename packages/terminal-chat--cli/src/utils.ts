import chalk from 'chalk'
import readline from 'readline'

export const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const extractColorAndText = (message: string): { message:string, color?:string} => {
  const regex = /\{(?<color>\w+)\s(?<text>[\w\d\s]+)\}/

  if (!regex.test(message)) {
    return {
      message
    }
  }

  const { color, text } = regex.exec(message)?.groups as any

  if ( !color || !(chalk as any)[color] ) {
    return {
      message
    }
  }

  if ( regex.test(text) ) {
    const message = (chalk as any)[color](text)
    return extractColorAndText(message)
  }

  return { color, message: text }
}

export function logMessage({ username: user, body }: MessagePayload, username: string) {
  const { color = 'white', message } = extractColorAndText(body)

  const msg = (chalk as any)[color](message);

  readline.clearLine(process.stdout, 0)
  readline.cursorTo(process.stdout, 0)

  console.log(chalk`{yellow @${user}}: ${msg}`)
  readline.moveCursor(process.stdout, 0, 0)
  process.stdout.write(chalk`{green {bold @you}}: `)
}

type LogType = 'success' | 'error' | 'warn' | 'dim' | 'announcement';
export function log(message: string, type: LogType = 'success'): void {
  let formattedMessage: string = message;

  switch ( type ) {
    case 'error': {
      formattedMessage = chalk`{bgRed {white [{bold ERROR}]}} {red {bold ${message}}}`
      break
    }
    case 'success': {
      formattedMessage = chalk`{bgGreen {black {bold SYSTEM}}}: {green {bold ${message}}}`
      break
    }
    case 'warn': {
      formattedMessage = chalk`{bgYellow {black [{bold WARNING}]}} {yellow {bold ${message}}}`
      break
    }
    case 'dim': {
      formattedMessage = chalk`{dim {bold [SYSTEM]} ${message}}`
      break
    }
    case 'announcement': {
      formattedMessage = chalk`{dim >>} ${message}`
      break
    }
  }

  if ( type === 'announcement' ) {
    readline.clearLine(process.stdout, 0)
    readline.cursorTo(process.stdout, 0)
    console.log(formattedMessage)
    readline.moveCursor(process.stdout, 0, 1)
    process.stdout.write(chalk`{green {bold @you}}: `)
  } else {
    console.log(formattedMessage);

  }
}

export async function updateHeader(usernmae: string, count: number = 5) {
  readline.clearLine(process.stdout, -1)
}

export async function sendMessage(socket: SocketIOClient.Socket, message: string, username: string) {
  socket.emit('message', {
    username,
    body: message
  })

  // console.debug(chalk`{dim [??] Sent message ${message} from @${username}}`)
}

export const askQuestion = (question: string, shouldClose: boolean = true) : Promise<string> => new Promise((resolve) => {
  rl.question(question, answer => {
    resolve(answer)
    if ( shouldClose ) rl.close()
  })
})

export const loopQuestion = async (
  socket: SocketIOClient.Socket,
  username: string
) => {
  try {
    const answer = await askQuestion(chalk`{green {bold @you}}: `, false)
    await sendMessage(socket, answer, username)
    loopQuestion(socket, username)
  } catch (error) {
    console.error(error)
    return null
  }
}


export type MessagePayload = {
  username: string;
  body: string;
}
