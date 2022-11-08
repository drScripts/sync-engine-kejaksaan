const { Client } = require('pg')

const client = new Client({
    host: "0.0.0.0",
    port: 54320,
    database: "postgres",
    user: "user",
    password: "admin"
})

client.connect()

const getAuditLogs = async () => {
    const res = await client.query('SELECT * FROM audit.logged_actions where is_synced = false')
    const data = res.rows
    return data
}

const updateFlagLog = async (id) => {
    await client.query('UPDATE audit.logged_actions SET is_synced = true where id = ' + id)
}

module.exports = {
    getAuditLogs,
    updateFlagLog
}
