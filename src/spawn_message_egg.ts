import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js"
import type { Egg } from "./eggs"

export function spawn_message_egg(egg: Egg) {
    return {
        content: "Um ovo apareceu!",
        embeds: [
            new EmbedBuilder()
                .setColor(egg.primaryColor)
                .setDescription(egg.description)
                .setThumbnail(egg.imageUrl)
        ],
        components: [
            new ActionRowBuilder<ButtonBuilder>()
                .setComponents(
                    new ButtonBuilder()
                        .setLabel("Pegar no Ovo")
                        .setEmoji("👀")
                        .setStyle(ButtonStyle.Secondary)
                        .setCustomId(`collect-egg-${egg.id}`)
                )
        ]
    }
}