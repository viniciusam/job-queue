const EventEmitter = require('events');
const io = require('socket.io')(3001);

class Queue extends EventEmitter {}
const queue = new Queue();

const JOB_CREATED = 'job_created';
const JOB_STARTED = 'job_started';
const JOB_DONE    = 'job_done';

let jobs = [];
let processed = [];
let processing = false;

/**
 * Creates a new job.
 * @param {*} item 
 */
function createJob(item) {
    let job = {
        id: (jobs.length + processed.length) + 1,
        priority: (item.type === 'HTML') ? 'high' : 'low',
        data: item
    };

    addOrdered(job);
    queue.emit(JOB_CREATED, job);
}

/**
 * Notify the socket that a new job was created.
 * If it is not processing anything, start it.
 */
queue.on(JOB_CREATED, (job) => {
    io.emit(JOB_CREATED, job);
    log('Job Created: ', job);
    if (!processing)
        processNextJob();
});

/**
 * Notify the socket that a job was started to be processed.
 */
queue.on(JOB_STARTED, (job) => {
    processing = true;
    io.emit(JOB_STARTED, job);
    log('Job Started: ', job);
});

/**
 * Notify the socket that a job was done.
 */
queue.on(JOB_DONE, (job) => {
    processing = false;
    io.emit(JOB_DONE, job);
    log('Job Done: ', job);
    processNextJob();
});

/**
 * Add new jobs at the order to be executed, considering its priority and age.
 * It adds higher priority tasks at front, unless the existing jobs age passed half of its timeout.
 * @param {*} job 
 */
function addOrdered(job) {
    if (jobs.length === 0) {
        jobs.push(job);
        return;
    }

    let newJobPriority = getPriorityValue(job.priority);
    let insertIndex = jobs.findIndex((queuedJob) => {
        let queuedJobPriority = getPriorityValue(queuedJob.priority);
        let queuedJobAge = new Date() - queuedJob.data.createdAt;

        if (queuedJobAge > (getJobTimeout(queuedJob) / 2)) {
            return true;
        } else {
            return queuedJobPriority < newJobPriority;
        }
    });

    if (insertIndex === -1) {
        jobs.push(job);
    } else {
        jobs.splice(insertIndex, 0, job);
    }
}

/**
 * Process the next job on the queue.
 */
function processNextJob() {
    if (jobs.length === 0)
        return;
   
    // Retrieve the new job from queue and add to processed job list.
    let job = jobs[0];
    jobs.splice(0, 1);
    processed.push(job);

    // Change the job status and notify.
    job.data.status = 'Processing';
    queue.emit(JOB_STARTED, job);
    
    // Change the job status and notify, after the artificial timeout expires.
    let timeout = getJobTimeout(job);
    setTimeout(() => {
        job.data.status = 'Processed';
        queue.emit(JOB_DONE, job);
    }, timeout);
}

/**
 * Get the artificial timeout value to mark the job as done.
 * @param {*} job 
 */
function getJobTimeout(job) {
    if (job.data.type === 'PDF')
        return 100 * 1000;
    if (job.data.type === 'HTML')
        return 10 * 1000;
}

/**
 * Get the job priority number.
 * @param {*} priority 
 */
function getPriorityValue(priority) {
    if (priority === 'high')
        return 3;
    if (priority === 'normal')
        return 2;
    if (priority === 'low')
        return 1;
}

function log(msg, job) {
    console.log(msg + '#' + job.id + ' - ' + job.data.type + ' - ' + (new Date().toLocaleTimeString())); 
}

module.exports = {
    createJob
}
