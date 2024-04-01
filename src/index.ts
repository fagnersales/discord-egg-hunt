import "./database/connect"
import { z } from "zod"
import { create_client, reload_commands } from "../lib"
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, TextChannel } from "discord.js"
import { get_random_egg } from "./get_random_egg"
import { spawn_message_egg } from "./spawn_message_egg"
import { arrayUnion, doc, getDoc, getFirestore, setDoc, updateDoc } from "firebase/firestore"

const client = create_client({
    devs: ["743525913425215608", "474407357649256448"]
})

await client
    .login(process.env.DISCORD_CLIENT_TOKEN)
    .then(() => reload_commands())

const request_spawn_data_schema = z.object({
    customer_id: z.string(),
    channel_id: z.string()
})

const server = Bun.serve({
    port: 3001,
    fetch(req, server) {
        const successfully_upgraded = server.upgrade(req)

        if (!successfully_upgraded) {
            return new Response("Upgrade failed", { status: 500 })
        }
    },
    websocket: {
        async message(ws, message) {
            const {
                channel_id,
                customer_id
            } = request_spawn_data_schema.parse(JSON.parse(message.toString()))

            const channel = await client.channels.fetch(channel_id)

            if (!(channel instanceof TextChannel)) throw new Error("Invalid channel")

            console.log(`Requested egg drop for ${customer_id}`)

            const ref = doc(getFirestore(), `users/${customer_id}`)

            const snapshot = await getDoc(ref)

            const blacklisted_eggs = snapshot.data()?.unlockedEggs ?? []

            const egg = get_random_egg(blacklisted_eggs)

            if (!egg) return;

            const received_egg_embed = new EmbedBuilder()
                .setTitle(`Você recebeu o ovo ${egg.name}`)
                .setColor(egg.primaryColor)
                .setDescription(egg.description)
                .setImage(egg.imageUrl)

            const components = [
                new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel("Ver Ovos Desbloqueados")
                            .setStyle(ButtonStyle.Link)
                            .setURL("https://dogggskins.com")
                    )
            ]

            channel
                .send({ embeds: [received_egg_embed], components })
                .catch(() => { })

            client.users
                .send(customer_id, { embeds: [received_egg_embed], components })
                .catch(() => { })

            snapshot.exists()
                ? await updateDoc(ref, { unlockedEggs: arrayUnion(egg.id) })
                : await setDoc(ref, { unlockedEggs: [egg.id], id: customer_id })
        },
    }
})

console.log(`Running on ${server.hostname}:${server.port}`)