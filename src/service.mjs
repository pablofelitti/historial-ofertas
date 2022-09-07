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

        try {
            const page = await browser.newPage()
            await openPage(page)

            const posts = await getDeals(page)

            browser.close().then(() => console.log('Browser closed'))
            return posts
        } catch (e) {
            console.log('An error occurred: ')
            console.log(e)
            browser.close().then(() => console.log('Browser closed'))
            return []
        }
    }

}