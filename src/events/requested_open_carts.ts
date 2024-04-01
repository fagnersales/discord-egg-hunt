import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CategoryChannel, ChannelType, EmbedBuilder, OAuth2Scopes, TextChannel } from "discord.js"
import { register_event } from "@lib"
import { Timestamp, collection, getDocs, getFirestore, onSnapshot, updateDoc } from "firebase/firestore"
import { z } from "zod"
import { eggs } from "@/eggs"

const requestOpenCartSchema = z.object({
    userId: z.string(),
    eggId: z.string(),
    skin: z.object({
        gender: z.literal("female").or(z.literal("male"))
    })
})

register_event({
    event: "ready",
    async implement(client) {
        const guild = await client.guilds.fetch("1177470274279571486")
        const category = await guild.channels.fetch("1223656405899149312")

        if (!category) throw new Error("Category not found")

        if (!(category instanceof CategoryChannel)) throw new Error("Channel is not a CategoryChannel")

        const requestedCartsCollection = collection(getFirestore(), "requestedOpenCarts")

        onSnapshot(requestedCartsCollection, (snapshot) => {
            snapshot.docChanges().forEach(async change => {
                if (change.type === "added") {
                    if (change.doc.data().message) return

                    const timestamp = change.doc.data().timestamp as Timestamp

                    if (timestamp.toMillis() + 10_000 < Date.now()) return

                    const { userId, eggId, skin } = requestOpenCartSchema.parse(change.doc.data())

                    const egg = eggs.find(egg => egg.id === eggId)

                    if (!egg) throw new Error("Egg not found wtf")

                    const user = await guild.members.fetch(userId)

                    const already_created_channel = guild.channels.cache.find(
                        (channel): channel is TextChannel => (
                            channel instanceof TextChannel &&
                            !!channel.topic?.includes(userId) &&
                            channel.name === `egg-hunt-${egg.id}`
                        )
                    )

                    const channel = already_created_channel ?? await guild.channels.create({
                        name: `egg-hunt-${egg.id}`,
                        topic: `${userId} encontrou o ovo ${egg.id}`,
                        type: ChannelType.GuildText,
                        permissionOverwrites: [
                            { id: guild.id, deny: ["ViewChannel"] },
                            { id: userId, allow: ["ViewChannel", "SendMessages", "AttachFiles", "AddReactions"] }
                        ],
                        parent: category.id
                    })

                    const url = user
                        ? channel.url
                        : await channel.createInvite().then(invite => invite.url)

                    console.log(`Created Dog Skin Cart for ${userId} (${url})`)

                    updateDoc(change.doc.ref, { message: url })

                    already_created_channel
                        ? channel.send({ content: `<@${userId}> utilize este chat para continuar sua compra.` })
                        : channel.send({
                            content: `<@${userId}>`,
                            embeds: [
                                new EmbedBuilder()
                                    .setColor(egg.skins[skin.gender].backgroundColor)
                                    .setThumbnail(egg.imageUrl)
                                    .setTitle(egg.name)
                                    .addFields([
                                        { name: "Preço", value: `R$ ${egg.skins[skin.gender].price.toFixed(2)}` },
                                        { name: "Gênero", value: skin.gender === "male" ? "Masculino" : "Feminino" },
                                    ])
                                    .setDescription(egg.description)
                                    .setImage(egg.skins[skin.gender].imageUrl)
                            ],
                            components: [
                                new ActionRowBuilder<ButtonBuilder>()
                                    .setComponents(
                                        new ButtonBuilder()
                                            .setLabel("Adquirir")
                                            .setCustomId(`buy-${egg.id}-${skin.gender}`)
                                            .setStyle(ButtonStyle.Primary),
                                        new ButtonBuilder()
                                            .setLabel("Masculino")
                                            .setCustomId(`male-${egg.id}`)
                                            .setStyle(ButtonStyle.Secondary)
                                            .setDisabled(skin.gender === "male"),
                                        new ButtonBuilder()
                                            .setLabel("Feminino")
                                            .setCustomId(`female-${egg.id}`)
                                            .setStyle(ButtonStyle.Secondary)
                                            .setDisabled(skin.gender === "female"),
                                        new ButtonBuilder()
                                            .setLabel("Fechar")
                                            .setCustomId("close")
                                            .setStyle(ButtonStyle.Danger),
                                    )
                            ]
                        })
                }
            })
        })
    },
})
