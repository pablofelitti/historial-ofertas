export class Dao {

    constructor(client) {
        this.client = client
    }

    async retrieveExistingNotifiedPublications(publicationIds) {
        let publicationIdsForQuery = publicationIds.map(it => [it.id])
        return await this.client
            .query("select id from notified_publications where id in (?)", [publicationIdsForQuery])
            .then(queryResult => {
                if (queryResult[0].length === 0) {
                    return []
                } else {
                    return queryResult[0].map(row => row.id)
                }
            })
    }

    async insertNotifiedPublications(notNotifiedPublications) {
        try {
            let notNotifiedPublicationsForQuery = notNotifiedPublications.map(it => {
                return [it.id, it.name, it.store, it.productLink, new Date()]
            })
            await this.client.query("BEGIN")
            await this.client.query("insert notified_publications (id, name, store, product_link, notified_date) values ?", [notNotifiedPublicationsForQuery])
            await this.client.query("COMMIT")
        } catch (e) {
            console.error(e)
            await this.client.query("ROLLBACK")
            throw e
        }
    }
}