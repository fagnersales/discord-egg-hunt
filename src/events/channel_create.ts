// import { get_random_egg } from "@/get_random_egg";
// import { GetGuildConfigUseCase } from "@/use_cases/get_guild_config"
// import { register_event } from "@lib"
// import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder } from "discord.js"

// register_event({
//     event: "channelCreate",
//     async implement(channel) {
//         if (channel.type !== ChannelType.GuildText || !channel.parentId) return

//         const guild_config = await GetGuildConfigUseCase.execute(channel.guild.id)

//         if (!guild_config.categories_to_spawn.includes(channel.parentId)) return

//         const egg = get_random_egg()

//         if (!egg) return console.log("no egg")

//         await Bun.sleep(1000)

//         channel.send({
//             embeds: [
//                 new EmbedBuilder()
//                     .setColor(egg.skins.female.backgroundColor)
//                     .setTitle(`O ovo "${egg.name}" acabou de surgir!`)
//                     .setDescription(egg.description)
//                     .setImage(egg.imageUrl)
//                     .setFooter({
//                         text: egg.name
//                     })
//             ],
//             components: [
//                 new ActionRowBuilder<ButtonBuilder>()
//                     .addComponents(
//                         new ButtonBuilder()
//                             .setLabel("Coletar")
//                             .setStyle(ButtonStyle.Primary)
//                             .setCustomId("collect-egg")
//                     )
//             ]
//         })
//     },
// })