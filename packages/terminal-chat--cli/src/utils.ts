import chalk from 'chalk'
import readline from 'readline'
import os from 'os'

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

  return { color, message: text }
}

export function logMessage({ username, body }: Record<string, string>) {
  const { color, message } = extractColorAndText(body)

  if ( !color || !(chalk as any)[color] ) {
    console.log(chalk`{bold {yellow >}} ${message}`)
  } else {
    console.log( `${chalk.bold.yellow('>')} ${(chalk as any)[color](message)}` )
  }
}

export function log(message: string): void {
  console.log(chalk`{bgGreen {black SYSTEM}}: {green {bold ${message}}}`);
}

export function sendMessage(socket: SocketIOClient.Socket, message: string, username: string) {
  socket.emit('message', {
    username,
    body: message
  })

  // logMessage({ username, body: message })
}


export function promptInput(question: string) : Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answ) => {
      resolve(answ)
    })
  })
}


export async function waitForUserText(socket: SocketIOClient.Socket, username: string) {
  const answer = await promptInput('')

  socket.emit('message', {
    username,
    body: answer
  })

  waitForUserText(socket, username)
}
