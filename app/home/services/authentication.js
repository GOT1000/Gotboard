
'use strict';

angular.module('gotboard').factory('Auth',
    function($q,$timeout,$http,$rootScope,$location,$window){
        var deferred = $q.defer();

        $http.get('/api/users/currentUser')
            .then(function(user){
                $rootScope.currentUser = user
                /*if(user !== '0'){
                    $rootScope.currentUser = user;
                    deferred.resolve();
                }else{
                    deferred.reject();
                    $window.location('/login');
                }*/
            })
        return deferred.promise;
    }
);
