import { OAuth2Scopes } from "discord.js"
import { register_event } from "@lib"

register_event({
    event: "interactionCreate",
    async implement(interaction) {
        if (interaction.isButton() && interaction.customId === "close") {
            interaction.channel?.delete().catch(() => { })
        }
    },
})
