import { EmbedBuilder, SlashCommandBuilder } from "discord.js"
import { register_slash_command } from "@lib"
import { getFirestore, collection, getDocs } from "firebase/firestore"

register_slash_command({
    builder: new SlashCommandBuilder()
        .setName("vencedores")
        .setDescription("Veja todos os vencedores do Egg Hunt 2024"),

    async implement(interaction) {
        await interaction.deferReply()

        const ref = collection(getFirestore(), `users`)

        const snapshot = await getDocs(ref)

        const winners = snapshot.docs
            .map(doc => `<@${doc.data().id}>`)
            .slice(0, 20)

        interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor("Random")
                    .setTitle(`Vencedores do Egg Hunt 2024 ${snapshot.docs.length}`)
                    .setDescription(`${winners.join("\n")} e mais ${winners.length - 20} vencedores...`)
            ]
        })
    },
})