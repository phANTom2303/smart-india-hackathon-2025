const express = require('express');
const path = require('path');
const app = express();

require('dotenv').config();
const port = process.env.PORT || 4000;
const mongourl = process.env.MONGO_URI;
const { connectMongoDB } = require("./connectMongoDB");
const apiRoutes = require('./routes');

connectMongoDB(mongourl)
    .then(() => console.log("Mongo Connection successfull"))
    .catch((err) => console.log(`Mongo Connection failed : ${err}`));

app.use('/api', apiRoutes);

// Serve uploaded files (so filePath like 'uploads/monitoring/...' is accessible)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
    res.send('BlockChain MRV Backend')
})

app.listen(port, '0.0.0.0', () => {
    console.log(`BlockChain MRV Backend listening on port ${port}`)
})
