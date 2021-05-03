import chalk from 'chalk'
import readline from 'readline'

const rl = readline.createInterface({
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

export function logMessage({ username: user, body }: Record<string, string>) {
  const { color, message } = extractColorAndText(body)

  const prefix = chalk`{bold {yellow >}}`
  const username = chalk`{yellow @${user}}`
  let msg = chalk`${username}${prefix}${message}`

  if ( color && (chalk as any)[color] ) {
    msg = chalk`${username}${prefix}${ (chalk as any)[color](message) }`
  }

  console.log(msg)
}

type LogType = 'success' | 'error' | 'warn' | 'dim';
export function log(message: string, type: LogType = 'success'): void {
  let formattedMessage: string;

  switch ( type ) {
    case 'error': {
      formattedMessage = chalk`{bgRed {white [{bold ERROR}]}} {red {bold ${message}}}`
    }
    case 'success': {
      formattedMessage = chalk`{bgGreen {black {bold SYSTEM}}}: {green {bold ${message}}}`
    }
    case 'warn': {
      formattedMessage = chalk`{bgYellow {black [{bold WARNING}]}} {yellow {bold ${message}}}`
    }
    case 'dim': {
      formattedMessage = chalk`{dim {bold [SYSTEM]} ${message}}}`
    }
  }

  console.log(formattedMessage)
}

export function sendMessage(socket: SocketIOClient.Socket, message: string, username: string) {
  socket.emit('message', {
    username,
    body: message
  })
}


export function promptInput(question: string) : Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answ) => {
      resolve(answ)
    })
  })
}


export async function waitForUserText(socket: SocketIOClient.Socket, username: string) {
  const message = await promptInput('')
  sendMessage(socket, message, username)
  waitForUserText(socket, username)
}
