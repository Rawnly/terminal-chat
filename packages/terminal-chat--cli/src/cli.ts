import meow from 'meow'
import chalk from 'chalk'
import os from 'os'

export const cli = meow(chalk`
  {bold Usage}

  $ chat <roomid>

  {bold {underline Options}}
  -u --username   Set your username
`, {
  flags: {
    username: {
      alias: 'u',
      type: 'string',
      default: os.userInfo().username
    }
  }
})
