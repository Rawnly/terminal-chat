const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

async function askQuestion(message, shouldClose = true) {
  return new Promise((resolve) => {
    rl.question(message, answer => {
      resolve(answer)
      if ( shouldClose) rl.close()
    })
  })
}



async function loopQuestion(question) {
  const answer = await askQuestion(question, false);
  console.log("Answer " + answer)
  console.log('--------------------')

  await loopQuestion(question)
}

loopQuestion('Your text: ')
