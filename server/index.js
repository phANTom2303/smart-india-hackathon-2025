const express = require('express');
const app = express();

require('dotenv').config();
const port = process.env.PORT || 4000;
const mongourl = process.env.MONGO_URI;
const { connectMongoDB } = require("./connectMongoDB");

connectMongoDB(mongourl)
    .then(() => console.log("Mongo Connection successfull"))
    .catch((err) => console.log(`Mongo Connection failed : ${err}`));

app.get('/', (req, res) => {
    res.send('BlockChain MRV Backend')
})

app.listen(port, '0.0.0.0', () => {
    console.log(`BlockChain MRV Backend listening on port ${port}`)
})
