const { SlashCommandBuilder } = require('@discordjs/builders')
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
const { clientId, guildId, token } = require('./config.json')

const commands = [
	new SlashCommandBuilder().setName('pirate').setDescription('Starts a game of pirate!'),
  new SlashCommandBuilder().setName('piraterules').setDescription('How to play a game of pirate.')
].map((command) => command.toJSON())

const rest = new REST({ version: '9' }).setToken(token)

rest
	.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error)
