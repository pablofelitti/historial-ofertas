export async function getDeals(page) {
    try {
        await page.waitForSelector('.ngucarousel-inner .ngucarousel-items', {timeout: 5000})
    } catch (error) {
        console.log('Error trying to load posts', error)
        return []
    }

    return await page.evaluate(() => {
        let dealsPanel = Array.from(document.querySelectorAll('.ngucarousel-inner .ngucarousel-items'))[2]

        function getChildrenWithClass(e, clazz) {
            if (e === undefined || e.childNodes === undefined) return
            return Array.from(e.childNodes)
                .filter(it => it.classList !== undefined)
                .filter(it => it.classList.contains(clazz))
        }

        function searchTree(element, matchingNodeType, includingClassName) {
            if (element.nodeName == matchingNodeType && element.classList.contains(includingClassName)) {
                return element
            } else if (element.children != null) {
                let i
                let result = null
                for (i = 0; result == null && i < element.children.length; i++) {
                    result = searchTree(element.children[i], matchingNodeType, includingClassName)
                }
                return result
            }
            return null
        }

        let result = []
        let deals = getChildrenWithClass(dealsPanel, 'item-mb')

        deals.forEach(deal => {

            let discountValue = searchTree(deal, 'DIV', 'label-discount').innerText

            result.push({
                discount: discountValue
            })
        })

        return result
    })
}

export async function openPage(page) {
    await page.setJavaScriptEnabled(false)
    return await page.goto('https://historial.com.ar/', {
        waitUntil: 'load',
        timeout: 5000
    })
}
