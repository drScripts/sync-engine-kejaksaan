const cron = require('node-cron');
const { getAuditLogs, updateFlagLog } = require('./pg')
const { insert, update, _delete } = require('./syncer')

cron.schedule("*/10 * * * * *", async function () {
    try {
        const rows = await getAuditLogs()
        rows.map((row) => {
            if (!row.is_synced) {
                switch (row.action) {
                    case "I":
                        const insertedData = JSON.parse(row.new_data)
                        insert(row.table_name, insertedData).then(() => {
                            updateFlagLog(row.id)
                        }).catch(console.log)
                        break;
                    case "D":
                        const deletedData = JSON.parse(row.original_data)
                        _delete(row.table_name, deletedData.id).then(() => {
                            updateFlagLog(row.id)
                        }).catch(console.log)
                        break;
                    case "U":
                        const updatedData = JSON.parse(row.new_data)
                        update(row.table_name, updatedData.id, updatedData).then(() => {
                            updateFlagLog(row.id)
                        }).catch(console.log)
                        break;
                    default:
                        console.error("unrecognized action value: " + row.action)
                }
            }
        })

    } catch (error) {
        console.log("error", error)
    }
});


