import meow from 'meow'
import chalk from 'chalk'
import os from 'os'
import app from './app'

const cli = meow(chalk`
  {bold Usage}

  $ chat <roomid>

  {bold {underline Options}}
    -u --username   Set your username
    -h --host       Set host
`, {
  flags: {
    host: {
      alias: 'h',
      type: 'string'
    },
    username: {
      alias: 'u',
      type: 'string',
      default: os.userInfo().username
    }
  }
})


app(cli.input, cli.flags)
