const cron = require('node-cron');
const { getAuditLogs, updateFlagLog } = require('./pg')
const { insert, update, _delete } = require('./syncer')
const monitoring = require("./monitoring")

cron.schedule("*/10 * * * * *", async function () {
    try {
        const rows = await getAuditLogs()
        const metrics = {
            successCreate: 0,
            errorCreate: 0,
            successUpdate: 0,
            errorUpdate: 0,
            successDelete: 0,
            errorDelete: 0,
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
                            await insert(row.table_name, insertedData)
                            await updateFlagLog(row.id)
                            metrics.successCreate++

                        } catch (e) {
                            metrics.errorCreate++
                        }
                        break;
                    case "D":
                        try {
                            const deletedData = JSON.parse(row.original_data)
                            await _delete(row.table_name, deletedData.id)
                            await updateFlagLog(row.id)
                            metrics.successUpdate++
                        } catch (e) {
                            metrics.errorUpdate++
                        }
                        break;
                    case "U":
                        try {
                            const updatedData = JSON.parse(row.new_data)
                            await update(row.table_name, updatedData.id, updatedData)
                            await updateFlagLog(row.id)
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
});


