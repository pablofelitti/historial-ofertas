import chromium from "chrome-aws-lambda"
import {getDeals, openPage} from "./web-utils.mjs"

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

        try {
            const page = await browser.newPage()
            await openPage(page)

            let deals = await getDeals(page)
            sanitizeDeals(deals)

            browser.close().then(() => console.log('Browser closed'))
            return deals
        } catch (e) {
            console.log('An error occurred: ')
            console.log(e)
            browser.close().then(() => console.log('Browser closed'))
            return []
        }
    }

}