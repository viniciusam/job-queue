angular.module('conversionApp', [])
    .controller('ConversionListController', [ '$scope', 'conversionService', function ($scope, conversionService) {       
        // Load initial data.
        conversionService.findAllItems()
            .then(res => $scope.items = res.data);
        
        // Adds a new item to the queue.
        $scope.addItem = function (type) {
            let newItem = { type: type };
            conversionService.addItem(newItem)
                .then(res => $scope.items.push(res.data))
                .catch(err => console.log(err.data));
        }
    }])
    .factory('conversionService', [ '$http', function ($http) {
        return {
            findAllItems: function () {
                return $http.get('/conversion/');
            },

            addItem: function (item) {
                return $http.post('/conversion/', item);
            }
        }
    }]);