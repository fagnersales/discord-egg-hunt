import { OAuth2Scopes } from "discord.js"
import { register_event } from "@lib"

register_event({
    event: "ready",
    async implement(client) {
        console.log(`Up & Running! (${client.user.username})`)

        const invite = client.generateInvite({
            scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands],
            permissions: ["Administrator"]
        })

        client.user.setActivity("Entregando Ovos")

        console.log(invite)
    },
})
