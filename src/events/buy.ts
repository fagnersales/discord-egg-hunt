import { AttachmentBuilder, OAuth2Scopes } from "discord.js"
import { register_event } from "@lib"
import { eggs } from "@/eggs"
import { randomUUID } from "node:crypto"
import MercadoPagoConfig, { Payment as MercadoPagoPayment } from "mercadopago"
import { weird_date_format } from "@/utils/weird_date_format"
import { doc, getFirestore, setDoc } from "firebase/firestore"

const mercadopago = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!
})

register_event({
    event: "interactionCreate",
    async implement(interaction) {
        if (
            !interaction.inCachedGuild() ||
            !interaction.isButton() ||
            !interaction.customId.startsWith("buy")
        ) return void null

        const [_, egg_id, gender] = interaction.customId.split("-")

        if (gender !== "female" && gender !== "male") throw new Error("invalid gender")

        const egg = eggs.find(egg => egg.id === egg_id)

        if (!egg) throw new Error("Egg not found for payment")

        const handler = new MercadoPagoPayment(mercadopago)

        const skin = egg.skins[gender]

        await interaction.update({ components: [] })

        const message = await interaction.channel!.send("Gerando pagamento...")

        const payment_id = randomUUID()

        const { point_of_interaction } = await handler.create({
            body: {
                transaction_amount: skin.price,
                payment_method_id: "pix",
                description: `Egg Hunt - ${egg.name}`,
                payer: {
                    email: "egghunt@doggg.shop",
                    first_name: "egghunt"
                },
                additional_info: {
                    items: [
                        {
                            unit_price: skin.price,
                            title: `Skin ${egg.name} - Modelo ${gender === "female" ? "Feminino" : "Masculino"}`,
                            quantity: 1,
                            id: egg.id,
                            category_id: "egghunt",
                            picture_url: skin.imageUrl
                        }
                    ]
                },
                external_reference: payment_id,
                date_of_expiration: weird_date_format(new Date(Date.now() + 20 * 60_000)),
                metadata: {
                    user_id: interaction.user.id
                }
            }
        })

        const qr_code_text = point_of_interaction?.transaction_data?.qr_code
        const qr_code_base64 = point_of_interaction?.transaction_data?.qr_code_base64

        if (!qr_code_base64) throw new Error("missing qrcodebase64")
        if (!qr_code_text) throw new Error("missing qrcodetext")

        await setDoc(doc(getFirestore(), `payments/${payment_id}`), {
            egg_id: egg.id,
            customer_id: interaction.user.id,
            channel_id: interaction.channel!.id,
            status: "pending"
        })

        const qr_code_image = new AttachmentBuilder(
            Buffer.from(qr_code_base64, "base64"),
            { name: "qrcode.png" }
        )

        message.edit({
            content: qr_code_text,
            files: [qr_code_image]
        })
    },
})
