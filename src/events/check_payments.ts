import MercadoPagoConfig, { Payment as MercadoPagoPayment, } from "mercadopago"

import { register_event } from "@lib"
import { collection, getDocs, getFirestore, query, updateDoc, where } from "firebase/firestore"
import { TextChannel } from "discord.js"

const mercadopago = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!
})

const handler = new MercadoPagoPayment(mercadopago)

register_event({
    event: "ready",
    async implement(client) {
        setInterval(async () => {
            const snapshot = await getDocs(query(
                collection(getFirestore(), "payments"),
                where("status", "==", "pending"),
            ))

            for (const doc of snapshot.docs) {
                const mpPayments = await handler.search({ options: { external_reference: doc.id } })

                const mpPayment = mpPayments.results?.[0]

                if (mpPayment?.status === "approved") {
                    await updateDoc(doc.ref, { status: "approved" })

                    const channel = await client.channels
                        .fetch(doc.data().channel_id)
                        .catch(() => null)

                    if (channel instanceof TextChannel) {
                        channel.send("✅ Pagamento aprovado com sucesso!")
                    }
                }

                if (mpPayment?.status === "cancelled") {
                    await updateDoc(doc.ref, { status: "cancelled" })
                    const channel = await client.channels
                        .fetch(doc.data().channel_id)
                        .catch(() => null)

                    channel?.delete().catch(() => { })
                }
            }
        }, 10_000)
    },
})
