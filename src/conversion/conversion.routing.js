const assert = require('assert');

module.exports = function({ conversionService }) {
    assert(conversionService, 'conversionService is required');

    const express = require('express');
    const router = express.Router();

    router.get('/', function (req, res, next) {
        conversionService.findAll()
            .then(jobs => res.send(jobs))
            .catch(error => next(error));
    });

    router.post('/', function (req, res, next) {
        conversionService.addJob(req.body)
            .then(job => res.send(job))
            .catch(error => next(error));
    });

    return router;
}
