import {Service, sendQueue, createMessage} from "./service.mjs";

export async function handler(event, context) {
    const service = new Service()
    let deals = await service.loadDeals()

    deals.forEach(deal => sendQueue(createMessage(deal)))
}
