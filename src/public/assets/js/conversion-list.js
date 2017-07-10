const app = angular.module('conversionApp', []);

app.controller('ConversionListController', [ '$scope', 'conversionService', function ($scope, conversionService) {       
    this.socket = io.connect('http://localhost:3001');
    $scope.items = [];
    
    // Load initial data.
    conversionService.findAllItems()
        .then(res => $scope.items = res.data);
    
    // Adds a new item to the queue.
    $scope.addItem = function (type) {
        let newItem = { type: type };
        conversionService.addItem(newItem)
            .catch(err => console.log(err.data));
    }

    function editItem(item) {
        let idx = $scope.items.findIndex((el) => el.id === item.id);
        if (idx >= 0) {
            $scope.items.splice(idx, 1, item);
            $scope.$apply();
        }
    }

    // Watch for queue status updates.
    this.socket.on('job_created', function (job) {
        $scope.items.push(job.data);
    });
    this.socket.on('job_started', function (job) {
        editItem(job.data);
    });
    this.socket.on('job_done', function (job) {
        editItem(job.data);
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

app.component('alert', {
    template: '<div class="alert alert-info" role="alert">{{ $scope.text }}</div>',
    bindings: {
        text: '<'
    }
});
