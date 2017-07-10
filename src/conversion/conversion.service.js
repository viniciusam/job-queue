const queueService = require('./queue.service');

let itemList = new Array();

function findAll() {
    return new Promise(function (resolve, reject) {
        resolve(itemList);
        // resolve([
        //     { name: 'PDF #1', createdAt: new Date(), type: 'PDF', status: 1 },
        //     { name: 'HTML #1', createdAt: new Date(), type: 'HTML', status: 3 },
        //     { name: 'PDF #2', createdAt: new Date(), type: 'PDF', status: 4 },
        //     { name: 'HTML #2', createdAt: new Date(), type: 'HTML', status: 2 }
        // ]);
    });
}

function addItem(item) {
    let validationErrors = new Array();

    if (!item.type || !(item.type === 'PDF' || item.type === 'HTML')) {
        validationErrors.push('Invalid item type: ' + item.type);
    }

    return new Promise(function (resolve, reject) {
        if (validationErrors.length > 0) {
            reject({
                msg: 'Validation Error',
                status: 400,
                errors: validationErrors
            });
        } else {
            item.id = itemList.length + 1;
            item.createdAt = new Date();
            item.status = 'In Queue';
            item.name = item.type + ' #' + item.id;

            itemList.push(item);
            queueService.createJob(item);

            resolve(item);
        }
    });
}

module.exports = {
    findAll,
    addItem
}
