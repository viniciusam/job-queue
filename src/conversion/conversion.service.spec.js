const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('conversion service', function () {
    const mockItem = { id: 1 };
    const mockQueueService = {
        getJobList: () => [mockItem],
        createJob: () => mockItem
    }
    const conversionService = require('./conversion.service')({
        queueService: mockQueueService
    });

    describe('when querying all jobs', function() {

        it('should return an array', function () {
            return expect(conversionService.findAll())
                .to.eventually.become([mockItem]);
        });

    });

    describe('when adding new jobs', function() {

        it('should accept PDF item type', function () {
            return expect(conversionService.addJob({ type: 'PDF' }))
                .to.eventually.become(mockItem);
        });

        it('should accept HTML item type', function () {
            return expect(conversionService.addJob({ type: 'HTML' }))
                .to.eventually.become(mockItem);
        });

        it('should fail with empty item', function () {
            return expect(conversionService.addJob({}))
                .to.eventually.be.rejected;
        });

        it('should fail with invalid item type', function () {
            return expect(conversionService.addJob({ type: 'XML' }))
                .to.eventually.be.rejected;
        });

    });

});
