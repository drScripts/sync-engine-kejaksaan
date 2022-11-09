const cron = require('node-cron');
const pgSource = require('./pg')
const syncerBuilder = require('./syncer')
const monitoring = require("./monitoring");
const { pgClients } = require('./config');

const sync = async (app, pgClient) => {
    try {
        const p = pgSource(pgClient)
        const syncer = syncerBuilder(app)
        const rows = await p.getAuditLogs()
        const metrics = {
            successCreate: 0,
            errorCreate: 0,
            successUpdate: 0,
            errorUpdate: 0,
            successDelete: 0,
            errorDelete: 0,
            satker: app,
            dateTime: new Date()
        }

        let reportMonitoring = false
       
        await Promise.all(rows.map(async (row) => {
            if (!row.is_synced) {
                reportMonitoring = true
                switch (row.action) {
                    case "I":
                        try {
                            const insertedData = JSON.parse(row.new_data)
                            await syncer.insert(row.table_name, insertedData)
                            await p.updateFlagLog(row.id)
                            metrics.successCreate++

                        } catch (e) {
                            metrics.errorCreate++
                        }
                        break;
                    case "D":
                        try {
                            const deletedData = JSON.parse(row.original_data)
                            await syncer.delete(row.table_name, deletedData.id)
                            await p.updateFlagLog(row.id)
                            metrics.successUpdate++
                        } catch (e) {
                            metrics.errorUpdate++
                        }
                        break;
                    case "U":
                        try {
                            const updatedData = JSON.parse(row.new_data)
                            await syncer.update(row.table_name, updatedData.id, updatedData)
                            await p.updateFlagLog(row.id)
                            metrics.successDelete++
                        } catch (e) {
                            metrics.errorDelete++
                        }
                        break;
                    default:
                        console.error("unrecognized action value: " + row.action)
                }
            }
        }))

        if (reportMonitoring) {
            await monitoring.create(metrics)
        }

    } catch (error) {
        console.log("error", error)
    }
}

cron.schedule("*/10 * * * * *",() => {
    pgClients.map(({app, pgClient}) => {
        sync(app, pgClient)
    })
});


