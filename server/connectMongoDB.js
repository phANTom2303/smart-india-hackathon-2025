const mongoose = require("mongoose");

async function connectMongoDB(mongourl) {
    return mongoose.connect(mongourl);
}

module.exports = {
    connectMongoDB,
}