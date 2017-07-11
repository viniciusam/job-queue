const assert = require('assert');

module.exports = function ({ queueService }) {
    assert(queueService, 'queueService is required');

    /**
     * Returns all jobs in the Queue.
     */  
    function findAll() {
        return new Promise(function (resolve, reject) {
            let jobs = queueService.getJobList();
            resolve(jobs);
        });
    }

    /**
     * Adds a new job to the Queue.
     * @param {*} jobData 
     */
    function addJob(jobData) {
        return new Promise(function (resolve, reject) {
            let errorList = new Array();

            if (!jobData.type || !(jobData.type === 'PDF' || jobData.type === 'HTML')) {
                errorList.push('Invalid job type: ' + jobData.type);
            }

            if (errorList.length > 0) {
                reject({
                    msg: 'Validation Error',
                    status: 400,
                    errors: errorList
                });
            } else {
                let job = queueService.createJob(jobData);
                resolve(job);
            }
        });
    }

    return {
        findAll,
        addJob
    }
}
