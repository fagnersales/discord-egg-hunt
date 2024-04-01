import { SlashCommandBuilder } from "discord.js"
import { register_slash_command } from "@lib"

register_slash_command({
    builder: new SlashCommandBuilder()
        .setName("meus-ovos")
        .setDescription("Veja todos seus ovos desbloqueados"),

    async implement(interaction) {
        return void interaction.reply("https://dogggskins.com/")
    },
})