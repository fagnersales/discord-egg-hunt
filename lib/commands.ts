import { SlashCommandBuilder, ChatInputCommandInteraction, AutocompleteInteraction } from "discord.js"
import path from "path"
import { load_folder_recursively } from "./utils/load-folder-recursively"

type Builder =
    | SlashCommandBuilder
    | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">
    | Omit<SlashCommandBuilder, "addBooleanOption" | "addUserOption" | "addChannelOption" | "addRoleOption" | "addAttachmentOption" | "addMentionableOption" | "addStringOption" | "addIntegerOption" | "addNumberOption">

type GuildCommand = {
    builder: Builder
    func: (interaction: ChatInputCommandInteraction<"cached">) => Promise<void>
    autocomplete?: (interaction: AutocompleteInteraction<"cached">) => Promise<void>
    client_required_permissions?: bigint[]
    user_required_permissions?: bigint[]
    dev_only?: boolean
}

type PrivateCommand = {
    builder: Builder
    func: (interaction: ChatInputCommandInteraction) => Promise<void>
    dev_only?: boolean
}

export const guild_commands: GuildCommand[] = []
export const private_commands: PrivateCommand[] = []

Bun.sleep(500).then(() => {
    load_folder_recursively(path.join(process.cwd(), "src", "commands"))
})
