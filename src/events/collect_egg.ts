import { get_egg_by_id, get_random_egg } from "@/get_random_egg";
import { GetGuildConfigUseCase } from "@/use_cases/get_guild_config"
import { register_event } from "@lib"
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, TextChannel } from "discord.js"
import { arrayUnion, doc, getDoc, getFirestore, setDoc, updateDoc } from "firebase/firestore";

const collecting = new Set<string>()

register_event({
    event: "interactionCreate",
    async implement(interaction) {
        if (
            !interaction.inCachedGuild() ||
            !interaction.isButton() ||
            !interaction.customId.startsWith("fake-collect-egg")
        ) return void null

        interaction.reply({
            content: `KKKK Ala, o ${interaction.user} pegou no meu ovo 🤓🤓🤓`
        })
    }
})

register_event({
    event: "interactionCreate",
    async implement(interaction) {
        if (
            !interaction.inCachedGuild() ||
            !interaction.isButton() ||
            !interaction.customId.startsWith("collect-egg")
        ) return void null

        if (interaction.message.createdTimestamp < Date.now() - 5_000) {
            return void interaction.message.delete().catch(() => { })
        }

        if (collecting.has(interaction.user.id)) return void null

        const egg_id = interaction.customId.split("-").reverse()[0]
        const egg = get_egg_by_id(egg_id)

        if (!egg) throw new Error(`Egg not found by the id ${egg_id}`)

        collecting.add(interaction.user.id)

        await interaction.deferReply({ ephemeral: true })

        const ref = doc(getFirestore(), `users/${interaction.user.id}`)

        const snapshot = await getDoc(ref)

        if (snapshot.exists() && snapshot.data().unlockedEggs.includes(egg.id)) {
            collecting.delete(interaction.user.id)
            return void interaction.editReply("Você já coletou este ovo!")
        }

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(egg.primaryColor)
                    .setTitle(`Você coletou o ovo ${egg.name}!`)
                    .setThumbnail(egg.imageUrl)
                    .setDescription(egg.description)
            ],
            components: [
                new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel("Ver Ovos Desbloqueados")
                            .setStyle(ButtonStyle.Link)
                            .setURL("https://dogggskins.com")
                    )
            ]
        })

        setTimeout(() => {
            collecting.delete(interaction.user.id)
        }, 5_000)

        snapshot.exists()
            ? await updateDoc(ref, { unlockedEggs: arrayUnion(egg.id) })
            : await setDoc(ref, { unlockedEggs: [egg.id], id: interaction.user.id })

        const collected_eggs_amount = snapshot.exists() ? snapshot.data().unlockedEggs.length + 1 : 1

        const channel = await interaction.guild.channels.fetch("1224409864902545450")

        if (!(channel instanceof TextChannel)) throw new Error("Invalid EGG HUNT LOG Channel")

        if (collected_eggs_amount === 14) {
            channel.send(`🎉🎉🎉 ${interaction.user} acabou de completar sua coleção de ovos e venceu o evento Egg Hunt 2024!`)
        } else {
            channel.send(`${interaction.user} acabou de resgatar o ovo **${egg.name}** e só faltam **${14 - collected_eggs_amount}** ovos!`)
        }
    },
})