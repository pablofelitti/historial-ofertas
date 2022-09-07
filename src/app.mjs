import {Service} from "./service.mjs";

export async function handler(event, context) {
    const logic = new Service()
    let deals = await logic.loadDeals()

    console.log(deals)
}
