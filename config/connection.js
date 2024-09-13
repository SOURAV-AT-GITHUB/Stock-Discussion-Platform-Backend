const mongoose = require ("mongoose")
require('dotenv').config()
dbUrl = process.env.DB_URL

const DBConnection = mongoose.connect(dbUrl)

module.exports = DBConnection
