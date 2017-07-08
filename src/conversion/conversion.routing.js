const express = require('express');
const router = express.Router();
const service = require('./conversion.service');

router.get('/', function (req, res, next) {
    service.findAll()
        .then(items => res.send(items))
        .catch(error => next(error));
});

router.post('/', function (req, res, next) {
    service.addItem(req.body)
        .then(response => res.send(response))
        .catch(error => next(error));
});

module.exports = router;
