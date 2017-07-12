const app = require('./app.module');

app.controller('ConversionListController', [ '$scope', '$location', '$timeout', 'conversionService', function ($scope, $location, $timeout, conversionService) {
    this.socket = io.connect($location.protocol() + '://' + $location.host() + ':' + $location.port());

    $scope.items = [];
    $scope.notifications = [];
    
    // Load initial data.
    conversionService.findAllItems()
        .then(res => $scope.items = res.data);
    
    // Adds a new item to the queue.
    $scope.addItem = function (type) {
        let newItem = { type: type };
        conversionService.addItem(newItem)
            .catch(err => console.log(err.data));
    }

    $scope.getJobTypeClass = function (job) {
        switch (job.status) {
            case 'In Queue': return 'glyphicon-time';
            case 'Processing': return 'glyphicon-refresh';
            case 'Processed': return 'glyphicon-ok';
        }
    }

    $scope.getNotificationTypeClass = function (notification) {
        switch (notification.job.status) {
            case 'Processing': return 'alert-info';
            case 'Processed': return 'alert-success';
        }
    }

    $scope.getNotificationIconClass = function (notification) {
        switch (notification.job.status) {
            case 'Processing': return 'glyphicon-info-sign';
            case 'Processed': return 'glyphicon-ok-sign';
        }
    }

    function editItem(item) {
        let idx = $scope.items.findIndex((el) => el.id === item.id);
        if (idx >= 0) {
            $scope.items.splice(idx, 1, item);
            $scope.$apply();
        }
    }

    function removeNotification() {
        let msg = $scope.notifications.pop();
        $scope.$apply();
    }

    function addNotification(job, msg) {
        $scope.notifications.splice(0, 0, { job, msg });
        $scope.$apply();
        $timeout(removeNotification, 5000);
    }

    // Watch for queue status updates.
    this.socket.on('job_created', function (job) {
        $scope.items.push(job);
    });
    this.socket.on('job_started', function (job) {
        editItem(job);
        addNotification(job, 'Request "' + job.name + '" started processing.');
    });
    this.socket.on('job_done', function (job) {
        editItem(job);
        addNotification(job, 'Request "' + job.name + '" processed.');
    });
}]);

app.factory('conversionService', [ '$http', function ($http) {
    return {
        findAllItems: function () {
            return $http.get('/conversion/');
        },

        addItem: function (item) {
            return $http.post('/conversion/', item);
        }
    }
}]);
