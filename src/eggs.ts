import { collection, getDocs, getFirestore } from "firebase/firestore"
import { z } from "zod"

const colorSchema = z.custom<`#${string}`>(val => typeof val === "string" && /^#\w+$/.test(val))

const skinSchema = z.object({
    backgroundColor: colorSchema,
    textPrimaryColor: colorSchema,
    textSecondaryColor: colorSchema,
    imageUrl: z.string().url(),
    videoUrl: z.string().url(),
    robux: z.number().positive().int(),
    price: z.number().positive()
})

const eggSchema = z.object({
    name: z.string(),
    id: z.string(),
    imageUrl: z.string().url(),
    rarity: z.number().int().min(1).max(10),
    description: z.string(),
    primaryColor: colorSchema,
    skins: z.object({
        description: z.string(),
        female: skinSchema,
        male: skinSchema
    })
})

export type Egg = z.infer<typeof eggSchema>

export const eggs: Egg[] = []

getDocs(collection(getFirestore(), "eggs"))
    .then((snapshot) => {
        snapshot.docs.forEach(doc => eggs.push(eggSchema.parse(doc.data())))
    })