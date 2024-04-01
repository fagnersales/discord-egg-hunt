import { guild_config_repository } from "@/database"
import type { GuildConfigData } from "@/database/repositories/config/schemas"

export class GetGuildConfigUseCase {
    public static async execute(guild_id: string): Promise<GuildConfigData> {
        const guild_config = await guild_config_repository.get(guild_id)

        if (!guild_config) return await guild_config_repository.create({
            id: guild_id,
            categories_to_spawn: [],
            guild_id: guild_id
        })

        return guild_config
    }
}