const EventEmitter = require('events');

class Queue extends EventEmitter {}
const queue = new Queue();

const JOB_CREATED = 'job_created';
const JOB_STARTED = 'job_started';
const JOB_DONE    = 'job_done';

let jobs = [];
let processed = [];
let processing = false;

queue.on(JOB_CREATED, (job) => {
    jobs.push(job);
    log('Job Created: ', job);
    if (!processing)
        processNextJob();
});

queue.on(JOB_STARTED, (job) => {
    processing = true;
    processed.push(job);
    log('Job Started: ', job);
});

queue.on(JOB_DONE, (job) => {
    processing = false;
    log('Job Done: ', job);
    processNextJob();
});

function processNextJob() {
    if (jobs.length === 0)
        return;
   
    let job = jobs.pop();
    queue.emit(JOB_STARTED, job);
    
    let timeout = 0;

    if (job.data.type === 'PDF')
        timeout = 10 * 1000;
    if (job.data.type === 'HTML')
        timeout = 5 * 1000;

    setTimeout(() => {
        queue.emit(JOB_DONE, job);
    }, timeout);
}

function createJob(item) {
    let job = {
        id: (jobs.length + processed.length) + 1,
        data: item
    };

    queue.emit(JOB_CREATED, job);
}

function log(msg, job) {
    console.log(msg + '#' + job.id + ' - ' + job.data.type + ' - ' + (new Date().toLocaleTimeString())); 
}

module.exports = {
    createJob
}
