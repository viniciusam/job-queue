const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Creates a new conversion service, using the server's socket.
const conversionService = require('./conversion/conversion.service')({
    queueService: require('./conversion/queue.service')(io),
});

// Routing configuration.
app.use(express.static(path.resolve(__dirname, '../build/public')));
app.use('/conversion', require('./conversion/conversion.routing')({
    conversionService: conversionService
}));

// Error handling middleware.
app.use(function (err, req, res, next) {
    console.log(err.stack);
    res.status(err.status || 500).send(err);
});

server.listen(3000, null, null, function() {
    console.log('Listening on port 3000!');
});
