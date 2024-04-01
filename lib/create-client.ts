import { Client, IntentsBitField } from "discord.js"
import { guild_commands, private_commands } from "./commands"
import { events } from "./events"

export function create_client(options?: Partial<{ devs: string[] }>) {
    const client = new Client({
        intents: [
            IntentsBitField.Flags.Guilds,
            IntentsBitField.Flags.GuildMembers,
            IntentsBitField.Flags.GuildMessages,
            IntentsBitField.Flags.MessageContent,
            IntentsBitField.Flags.DirectMessages,
            IntentsBitField.Flags.GuildMessageReactions,
            IntentsBitField.Flags.GuildMessageTyping,
        ]
    })

    const unique_events = new Set(events.map(event => event.event))

    unique_events.forEach(event => client.on(event, (...args) =>
        events
            .filter(e => e.event === event)
            .forEach(e => e.func(...args))
    ))

    client.on("interactionCreate", interaction => {
        if (interaction.isAutocomplete()) {
            if (!interaction.inCachedGuild()) return;

            const command = guild_commands.find(command => command.builder.name === interaction.commandName)

            if (!command?.autocomplete) return void 0;

            return void command?.autocomplete(interaction)
        }

        if (interaction.isChatInputCommand()) {
            if (!interaction.inCachedGuild()) {
                const command = private_commands.find(command => command.builder.name === interaction.commandName)

                if (command) {
                    if (!command.dev_only) return void command.func(interaction)

                    const is_dev = options?.devs?.includes(interaction.user.id)

                    if (!is_dev) return void interaction.reply({
                        ephemeral: true,
                        content: "Comando reservado apenas para desenvolvedores."
                    })
                }

                return void 0
            }

            const command = guild_commands.find(command => command.builder.name === interaction.commandName)

            if (command) {
                if (command.dev_only) {
                    const is_dev = options?.devs?.includes(interaction.user.id)

                    if (!is_dev) return void interaction.reply({
                        ephemeral: true,
                        content: "Comando reservado apenas para desenvolvedores."
                    })
                }

                if (command.user_required_permissions) {
                    const missing_permissions = command.user_required_permissions.filter(
                        permission => !interaction.memberPermissions.has(permission, false)
                    )

                    if (missing_permissions.length > 0) {
                        return void interaction.reply({
                            ephemeral: true,
                            content: "Você não tem as permissões necessárias para usar este comando."
                        })
                    }
                }

                return void command.func(interaction)
            }
        }
    })

    return client
}
