import chromium from "chrome-aws-lambda"
import {getDeals, openPage} from "./web-utils.mjs"
import {GetParametersByPathCommand, SSMClient} from "@aws-sdk/client-ssm"
import {SQSClient, SendMessageCommand} from "@aws-sdk/client-sqs"
import mysql from "mysql2/promise"
import {Dao} from "./dao.mjs"

const ssmClient = new SSMClient({region: 'us-east-1'})
const command = new GetParametersByPathCommand({Path: "/applications-db"})
const ssmResponse = await ssmClient.send(command)

const clientOptions = {
    host: ssmResponse.Parameters.filter(it => it.Name === '/applications-db/host')[0].Value,
    user: ssmResponse.Parameters.filter(it => it.Name === '/applications-db/user')[0].Value,
    password: ssmResponse.Parameters.filter(it => it.Name === '/applications-db/password')[0].Value,
    database: ssmResponse.Parameters.filter(it => it.Name === '/applications-db/database-historial-ofertas')[0].Value,
    ssl: {
        rejectUnauthorized: false
    }
}

let dbClient = await mysql.createConnection(clientOptions)
const dao = new Dao(dbClient)

export class Service {

    async loadDeals() {

        const browser = await chromium.puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath,
            headless: true,
            ignoreHTTPSErrors: true,
        })

        function sanitizeDeal(deal) {
            let size = deal.productLink.split('/').length
            deal.id = deal.productLink.split('/')[size - 1]
            deal.discount = parseInt(deal.discount.replace(/\D/g, ""))
            return deal
        }

        function sanitizeDeals(deals) {
            return deals.forEach(deal => sanitizeDeal(deal))
        }

        function removeAlreadyNotified(deals, alreadyNotified) {
            return deals.filter(deal => !alreadyNotified.includes(deal.id));
        }

        try {
            const page = await browser.newPage()
            await openPage(page)

            let deals = await getDeals(page)
            sanitizeDeals(deals)

            browser.close().then(() => console.log('Browser closed'))

            let alreadyNotified = await dao.retrieveExistingNotifiedPublications(deals)
            let notNotifiedPublications = removeAlreadyNotified(deals, alreadyNotified)

            if (notNotifiedPublications.length === 0) {
                console.log('Nothing new to notify')
            } else {
                await dao.insertNotifiedPublications(notNotifiedPublications)
            }
            return notNotifiedPublications
        } catch (e) {
            console.log('An error occurred: ')
            console.log(e)
            browser.close().then(() => console.log('Browser closed'))
            return []
        }
    }
}

export function createMessage(data) {
    return "Producto: " + data.name + "\n\n" + "Descuento: " + data.discount + "%" + "\n\n" + "Store: " + data.store + "\n\n" + "Link: " + data.productLink
}

export async function sendQueue(data) {

    let sqsOrderData = {
        MessageAttributes: {
            "EnvironmentId": {
                DataType: "String",
                StringValue: process.env.ENVIRONMENT
            },
            "Channel": {
                DataType: "String",
                StringValue: "ofertas"
            }
        },
        MessageBody: data,
        QueueUrl: process.env.SQS_QUEUE_URL
    }

    console.log('sending message')
    await new SQSClient({region: 'us-east-1'}).send(new SendMessageCommand(sqsOrderData));
    console.log('message sent')
}