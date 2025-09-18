const express = require('express');
const path = require('path');
const cors = require('cors'); 2
const app = express();

require('dotenv').config();
const port = process.env.PORT || 4000;
const mongourl = process.env.MONGO_URI;
const { connectMongoDB } = require("./connectMongoDB");
const apiRoutes = require('./routes');

// CORS for a single React frontend
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const corsOptions = {
    origin: (origin, cb) => {
        // allow non-browser clients (no Origin header)
        if (!origin) return cb(null, true);
        return origin === frontendUrl
            ? cb(null, true)
            : cb(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Disposition'],
    maxAge: 86400,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

connectMongoDB(mongourl)
    .then(() => console.log("Mongo Connection successfull"))
    .catch((err) => console.log(`Mongo Connection failed : ${err}`));

app.use('/api', apiRoutes);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
    res.send('BlockChain MRV Backend')
})

app.listen(port, '0.0.0.0', () => {
    console.log(`BlockChain MRV Backend listening on port ${port}`)
})
