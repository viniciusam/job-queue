const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routing configuration.
app.use(express.static(path.join(__dirname, 'public')));
app.use('/conversion', require('./conversion/conversion.routing'));

// Error handling middleware.
app.use(function (err, req, res, next) {
    console.log('error handler');
    res.status(err.status || 500).send(err);
});

app.listen(80, function() {
    console.log('Listening on port 80!');
});
