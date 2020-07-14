const express = require('express');
const path = require('path');

const publicDirPath = path.join(__dirname, '../public');

const app = express();

app.use(express.static(publicDirPath));

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`)
});