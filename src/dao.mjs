import mysql from "mysql2/promise"
import {GetParametersByPathCommand, SSMClient} from "@aws-sdk/client-ssm"

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

let client = await mysql.createConnection(clientOptions)

export class Dao {

    async retrieveExistingNotifiedPublications(publicationIds) {
        let publicationIdsForQuery = publicationIds.map(it => [it.id])
        return await client
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
            await client.query("BEGIN")
            await client.query("insert notified_publications (id, name, store, product_link, notified_date) values ?", [notNotifiedPublicationsForQuery])
            await client.query("COMMIT")
        } catch (e) {
            console.error(e)
            await client.query("ROLLBACK")
            throw e
        }
    }
}