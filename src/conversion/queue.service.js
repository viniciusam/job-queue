module.exports = function(socket) {
    const EventEmitter = require('events');

    class Queue extends EventEmitter {}
    const queue = new Queue();

    const JOB_CREATED = 'job_created';
    const JOB_STARTED = 'job_started';
    const JOB_DONE    = 'job_done';

    const STATUS_IN_QUEUE = 'In Queue';
    const STATUS_PROCESSING = 'Processing';
    const STATUS_PROCESSED = 'Processed';

    let jobs = [];
    let processing = false;

    /**
     * Creates a new job.
     * @param {*} item 
     */
    function createJob(jobData) {
        let newId = jobs.length + 1;
        let job = {
            id: newId,
            priority: (jobData.type === 'HTML') ? 'high' : 'low',
            createdAt: new Date(),
            status: STATUS_IN_QUEUE,
            type: jobData.type,
            name: jobData.type + ' #' + newId
        };

        jobs.push(job);
        queue.emit(JOB_CREATED, job);
        
        return job;
    }

    /**
     * Get all jobs on the queue.
     */
    function getJobList() {
        return jobs;
    }

    /**
     * Notify the socket that a new job was created.
     * If it is not processing anything, start it.
     */
    queue.on(JOB_CREATED, (job) => {
        notifySocket(JOB_CREATED, job);
        log('Job Created: ', job);
        if (!processing)
            processNextJob();
    });

    /**
     * Notify the socket that a job was started to be processed.
     */
    queue.on(JOB_STARTED, (job) => {
        processing = true;
        notifySocket(JOB_STARTED, job);
        log('Job Started: ', job);
    });

    /**
     * Notify the socket that a job was done.
     */
    queue.on(JOB_DONE, (job) => {
        processing = false;
        notifySocket(JOB_DONE, job);
        log('Job Done: ', job);
        processNextJob();
    });

    /**
     * Process the next job on the queue.
     */
    function processNextJob() { 
        // Retrieve the new job from queue.
        let job = getNextJob();
        if (job === false)
            return;

        // Change the job status and notify.
        job.status = STATUS_PROCESSING;
        queue.emit(JOB_STARTED, job);
        
        // Change the job status and notify, after the artificial timeout expires.
        let timeout = getJobTimeout(job);
        setTimeout(() => {
            job.status = STATUS_PROCESSED;
            queue.emit(JOB_DONE, job);
        }, timeout);
    }

    /**
     * Return jobs at the order to be executed, considering its priority and age.
     * It adds higher priority tasks at front, unless the existing jobs age passed half of its timeout.
     * @param {*} job 
     */
    function getNextJob() {       
        let prevJobAge = -1;
        let prevJobPriority = -1;
        let nextJob;

        for (job of jobs) {
            if (job.status !== STATUS_IN_QUEUE)
                continue;
            
            // If the job already passed half of its timeout, select it.
            let jobAge = new Date() - job.createdAt;
            if (jobAge > getJobTimeout(job) / 2) {
                nextJob = job;
                break;
            }

            // Or select the job with the greater priority and age.
            let jobPriority = getPriorityValue(job.priority);
            if (jobPriority >= prevJobPriority && jobAge > prevJobAge) {
                nextJob = job;
            }

            prevJobAge = jobAge;
            prevJobPriority = jobPriority;
        };

        return nextJob || false;
    }

    /**
     * Get the artificial timeout value to mark the job as done.
     * @param {*} job 
     */
    function getJobTimeout(job) {
        if (job.type === 'PDF')
            return 100 * 1000;
        if (job.type === 'HTML')
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

    function notifySocket(event, data) {
        if (typeof socket !== 'undefined') {
            socket.emit(event, data);
        }
    }

    function log(msg, job) {
        console.log(msg + '#' + job.id + ' - ' + job.type + ' - ' + (new Date().toLocaleTimeString())); 
    }

    return {
        createJob,
        getJobList
    }

}
