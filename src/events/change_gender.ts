import { get_egg_by_id, get_random_egg } from "@/get_random_egg";
import { GetGuildConfigUseCase } from "@/use_cases/get_guild_config"
import { register_event } from "@lib"
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder } from "discord.js"
import { arrayUnion, doc, getDoc, getFirestore, setDoc, updateDoc } from "firebase/firestore";

const collecting = new Set<string>()

register_event({
    event: "interactionCreate",
    async implement(interaction) {
        if (
            !interaction.inCachedGuild() ||
            !interaction.isButton() ||
            !(interaction.customId.startsWith("male") || interaction.customId.startsWith("female"))
        ) return void null

        const [gender, egg_id] = interaction.customId.split("-")

        if (gender !== "female" && gender !== "male") throw new Error("invalid gender")

        const egg = get_egg_by_id(egg_id)

        if (!egg) throw new Error("Unknown Egg " + egg_id)

        const embed = new EmbedBuilder()
            .setColor(egg.skins[gender].backgroundColor)
            .setThumbnail(egg.imageUrl)
            .setTitle(egg.name)
            .addFields([
                { name: "Preço", value: `R$ ${egg.skins[gender].price.toFixed(2)}` },
                { name: "Gênero", value: gender === "male" ? "Masculino" : "Feminino" },
            ])
            .setDescription(egg.skins.description)
            .setImage(egg.skins[gender].imageUrl)

        const component = new ActionRowBuilder<ButtonBuilder>()
            .setComponents(
                new ButtonBuilder()
                    .setLabel("Adquirir")
                    .setCustomId(`buy-${egg.id}-${gender}`)
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setLabel("Masculino")
                    .setCustomId(`male-${egg.id}`)
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(gender === "male"),
                new ButtonBuilder()
                    .setLabel("Feminino")
                    .setCustomId(`female-${egg.id}`)
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(gender === "female"),
                new ButtonBuilder()
                    .setLabel("Fechar")
                    .setCustomId("close")
                    .setStyle(ButtonStyle.Danger),
            )

        interaction.update({
            embeds: [embed],
            components: [component]
        })
    },
})