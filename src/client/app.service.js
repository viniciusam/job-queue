const appModule = require('./app.module');

appModule.factory('conversionService', [ '$http', function ($http) {
    return {
        findAllItems: function () {
            return $http.get('/conversion/');
        },

        addItem: function (item) {
            return $http.post('/conversion/', item);
        }
    }
}]);
