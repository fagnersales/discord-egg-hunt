import { type ClientEvents, AutocompleteInteraction, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"
import { guild_commands, private_commands } from "./commands"
import { events } from "./events"

type Builder =
    | SlashCommandBuilder
    | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">
    | Omit<SlashCommandBuilder, "addBooleanOption" | "addUserOption" | "addChannelOption" | "addRoleOption" | "addAttachmentOption" | "addMentionableOption" | "addStringOption" | "addIntegerOption" | "addNumberOption">

export function register_slash_command(opts: {
    builder: Builder
    implement: (interaction: ChatInputCommandInteraction<"cached">) => Promise<void>
    autocomplete?: (interaction: AutocompleteInteraction<"cached">) => Promise<void>
    client_required_permissions?: bigint[]
    user_required_permissions?: bigint[]
    dev_only?: boolean
    not_load?: boolean
}) {
    if (!opts.not_load) {
        guild_commands.push({
            builder: opts.builder,
            func: opts.implement,
            autocomplete: opts.autocomplete,
            client_required_permissions: opts.client_required_permissions,
            user_required_permissions: opts.user_required_permissions,
            dev_only: opts.dev_only,
        })
        console.log(`[/] "${opts.builder.name}"`)
    }
}

export function register_private_slash_command(opts: {
    builder: Builder
    implement: (interaction: ChatInputCommandInteraction) => Promise<void>
    user_required_permissions?: bigint[]
    dev_only?: boolean
    not_load?: boolean
}) {
    if (!opts.not_load) {
        private_commands.push({
            builder: opts.builder,
            func: opts.implement,
            dev_only: opts.dev_only,
        })
        console.log(`[/] "${opts.builder.name}"`)
    }
}

export function register_event<Event extends keyof ClientEvents>(opts: {
    event: Event,
    implement: (...args: ClientEvents[Event]) => Promise<void> | void
    name?: string
    not_load?: boolean
}) {
    if (!opts.not_load) {
        events.push({
            event: opts.event,
            func: opts.implement,
        })
        console.log(`[🧵] "${opts.name ?? opts.event}"`)
    }
}