// Require the necessary discord.js classes
const {
	Client,
	Intents,
	MessageReaction,
	MessageAttachment,
} = require('discord.js')
const { token } = require('./config.json')
// For merging pool ball images together
const mergeImages = require('merge-images')
const { Canvas, Image } = require('canvas')
const fs = require('fs')

// Create a new client instance
const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.DIRECT_MESSAGES,
		Intents.FLAGS.DIRECT_MESSAGE_TYPING,
	],
})

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!')
})

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isCommand()) return

	const { commandName } = interaction

	if (commandName === 'pirate') {
		let poolBalls = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]

		function shuffle(array) {
			let currentIndex = array.length,
				randomIndex

			// While there remain elements to shuffle.
			while (currentIndex != 0) {
				// Pick a remaining element.
				randomIndex = Math.floor(Math.random() * currentIndex)
				currentIndex--

				// And swap it with the current element.
				[array[currentIndex], array[randomIndex]] = [
					array[randomIndex],
					array[currentIndex],
				]
			}

			return array
		}

		shuffle(poolBalls)

    let numPlayers = 0
		const message = await interaction.reply({
			content: 'Starting a game of pirate! React with 👍 to join the game!',
			fetchReply: true,
		})
		message.react('👍')

		// Create a reaction collector
		const filter = (reaction, user) =>
			reaction.emoji.name === '👍' && user.id !== '980000692351676446'
    // sets amount of time for people to react
		let seconds = 30
		const collector = message.createReactionCollector({
			filter,
			time: 1000 * seconds,
		})
		collector.on('collect', (reaction, user) => {
			console.log(`Collected ${reaction.emoji.name} from ${user.tag}`)
      numPlayers += 1
    })
		collector.on('end', async (collected) => {
			console.log(`${numPlayers} players have joined.`)
			collector.users.forEach((value, key) => {
				// "value" is the User object, "key" is the user id
				let numBalls = Math.floor(15 / numPlayers)

				let selectedBalls = poolBalls.splice(0, numBalls)
        selectedBalls.sort(function(a, b) {
          return a - b
        })

				client.users.fetch(key.toString()).then((currentUser) => {
          let imagesToMerge = []
          let img
          let fileName
          let xVal = -50

          for (ball of selectedBalls) {
            xVal += 50
            imagesToMerge.push({src: `./poolEmojis/${ball}ball.jpg`, x: xVal, y:0})
          }

					mergeImages(
						imagesToMerge,
						{
							Canvas: Canvas,
							Image: Image,
              width: xVal + 50,
              height: 50
						}
					).then((base64) => {
            base64 = base64.split(',')[1]
            let buffer = Buffer.from(base64, 'base64')
            fileName = `${selectedBalls.toString().replaceAll(',', '_')}poolBalls.jpg`
						fs.writeFileSync(`./randomBallsImages/${fileName}`, buffer)
            img = new MessageAttachment(`./randomBallsImages/${fileName}`)
					}).then( () => {
            currentUser.send({
              content: `Your selected balls are:\n **${selectedBalls
                .toString()
                .replaceAll(',', ', ')}**`,
              files: [img],
            })
          })
        })
      })

			interaction.editReply(
				'Ball numbers for Pirate have been sent to the players!'
			)
		})
	} else if (commandName === 'piraterules') {
		await interaction.reply({
			content: `Each player is assigned random ball numbers. The objective of the game is to pocket your opponents' balls. The last player with one or more balls remaining on the table wins the game.`,
		})
	}
})

// Login to Discord with your client's token
client.login(token)
