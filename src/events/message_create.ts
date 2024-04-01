import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, OAuth2Scopes } from "discord.js"
import { register_event } from "@lib"
import { get_random_egg } from "@/get_random_egg"
import { spawn_message_egg } from "@/spawn_message_egg"

register_event({
    event: "messageCreate",
    async implement(message) {
        if (message.author.bot) return

        if (message.channelId === "1194670535884423188") {
            const should_spawn = (message.author.id === "474407357649256448" && message.content === "meu ovo") || (Math.floor(Math.random() * 100) + 1) <= 1

            if (!should_spawn) return void null

            const egg = get_random_egg()

            if (!egg) return void null

            const egg_message = await message.channel.send(spawn_message_egg(egg))

            await new Promise(resolve => setTimeout(resolve, 5_000))

            egg_message.delete().catch(() => { })
        }
    },
})
