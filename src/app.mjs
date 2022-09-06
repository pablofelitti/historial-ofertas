import {Service} from "./service.mjs";

export async function handler(event, context) {
    const logic = new Service()
    logic.test()
}
