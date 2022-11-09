const source = (pgClient) => {
    const getAuditLogs = async () => {
        const res = await pgClient.query('SELECT * FROM audit.logged_actions where is_synced = false')
        const data = res.rows
        return data
    }
    
    const updateFlagLog = async (id) => {
        await pgClient.query('UPDATE audit.logged_actions SET is_synced = true where id = ' + id)
    }

    return {
        getAuditLogs,
        updateFlagLog
    }
}

module.exports = source
