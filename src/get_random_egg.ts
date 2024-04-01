import { type Egg, eggs } from "./eggs"

export function get_egg_by_id(id: string): Egg | null {
    return eggs.find(egg => egg.id === id) || null
}

export function get_random_egg(blacklisted_eggs: string[] = []): Egg | null {
    const filtered_eggs = eggs.filter(egg => !blacklisted_eggs.includes(egg.id))

    const total_rarity = filtered_eggs.reduce((sum, egg) => sum + egg.rarity, 0)
    const random_number = Math.random() * total_rarity

    let accumulated_rarity = 0
    for (const egg of filtered_eggs) {
        accumulated_rarity += egg.rarity
        if (random_number < accumulated_rarity) {
            return egg
        }
    }

    return null
}

