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

        function searchTreeByNodetype(element, matchingNodeType) {
            if (element.nodeName == matchingNodeType) {
                return element
            } else if (element.children != null) {
                let i
                let result = null
                for (i = 0; result == null && i < element.children.length; i++) {
                    result = searchTreeByNodetype(element.children[i], matchingNodeType)
                }
                return result
            }
            return null
        }

        function searchTreeByNodetypeAndClass(element, matchingNodeType, includingClassName) {
            if (element.nodeName == matchingNodeType && element.classList.contains(includingClassName)) {
                return element
            } else if (element.children != null) {
                let i
                let result = null
                for (i = 0; result == null && i < element.children.length; i++) {
                    result = searchTreeByNodetypeAndClass(element.children[i], matchingNodeType, includingClassName)
                }
                return result
            }
            return null
        }

        let result = []
        let deals = getChildrenWithClass(dealsPanel, 'item-mb')

        deals.forEach(deal => {

            let discountValue = searchTreeByNodetypeAndClass(deal, 'DIV', 'label-discount').innerText
            let imageLink = searchTreeByNodetypeAndClass(deal, 'IMG', 'img-product').src
            let productLink = searchTreeByNodetype(deal, 'A').href
            let nameValue = searchTreeByNodetypeAndClass(deal, 'H4', 'product-title').innerText
            let storeValue = searchTreeByNodetypeAndClass(deal, 'UL', 'deal-meta').innerText

            result.push({
                discount: discountValue,
                imageLink: imageLink,
                productLink: productLink,
                name: nameValue,
                store: storeValue
            })
        })

        return result
    })
}

export async function openPage(page) {
    await page.setJavaScriptEnabled(false)
    return await page.goto('https://historial.com.ar/', {
        waitUntil: 'load',
        timeout: 45000
    })
}
