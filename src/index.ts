import "./database/connect"
import { z } from "zod"
import { create_client, reload_commands } from "../lib"
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, TextChannel } from "discord.js"
import { get_random_egg } from "./get_random_egg"
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

            const collected_eggs_amount = snapshot.exists() ? snapshot.data().unlockedEggs.length + 1 : 1

            snapshot.exists()
                ? await updateDoc(ref, { unlockedEggs: arrayUnion(egg.id) })
                : await setDoc(ref, { unlockedEggs: [egg.id], id: customer_id })

            const egg_hunt_log_channel = await channel.guild.channels.fetch("1224409864902545450")

            if (!(egg_hunt_log_channel instanceof TextChannel)) throw new Error("Invalid EGG HUNT LOG Channel")

            if (collected_eggs_amount === 14) {
                egg_hunt_log_channel.send(`🎉🎉🎉 <@${customer_id}> acabou de completar sua coleção de ovos e venceu o evento Egg Hunt 2024!`)
            } else {
                egg_hunt_log_channel.send(`<@${customer_id}> acabou de resgatar o ovo **${egg.name}** e só faltam **${14 - collected_eggs_amount}** ovos!`)
            }
        },
    }
})

console.log(`Running on ${server.hostname}:${server.port}`)