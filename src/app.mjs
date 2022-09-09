import {Service, sendQueue, createMessage} from "./service.mjs";

export async function handler(event, context) {
    const service = new Service()
    let deals = await service.loadDeals()

    for (let i = 0; i < deals.length; i++) {
        try {
            await sendQueue(createMessage(deals[i]))
        } catch (e) {
            console.error(e)
        }
    }
}
