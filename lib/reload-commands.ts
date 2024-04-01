import { REST, Routes } from "discord.js"
import { guild_commands } from "./commands"

export const reload_commands = async () => {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_CLIENT_TOKEN!)

    const body = {
        body: guild_commands.map(command => command.builder.toJSON())
    }

    await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID!), body)
}