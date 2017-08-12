'use strict';

angular.module('gotboard').controller('IndexController',
    [
        '$scope',
        '$ocLazyLoad',
        '$window',
        '$auth',
        '$q',
        '$location',
        '$state',
        'Posts',
        'toastr',
        function($scope,$ocLazyLoad,$window,$auth,$q,$location,$state,Posts,toastr){

            getPosts();
            $scope.text1 = 'test';
            $scope.isCurrentPath = function(path){
                return $location.path() == path;
            }
            $scope.goPost = function(){
                $window.scrollTo(0,0);
                $state.go('root.post',{},{reload:true})
            }
            function getPosts(){
                Posts.getPosts().then(function(res){
                $scope.posts = res.data;
                }).catch(function(err){
                    console.log(err);
                })
            }

            $scope.show = function(index){
                toastr.success(index);
            }
        }
    ]
);

angular.module('gotboard').controller('NavController',
    [
        '$scope',
        '$ocLazyLoad',
        '$location',
        '$auth',
        'toastr',
        function($scope,$ocLazyLoad,$location,$auth,toastr){
            $ocLazyLoad.load(['static/css/style.css','static/css/angular-toastr.css']);
            $scope.isCurrentPath = function (path){
                return $location.path() == path;
            };
            $scope.isAuthenticated = function(){
                return $auth.isAuthenticated();
            };
            $scope.logout = function(){
                $auth.logout()
                .then(function(){
                    toastr.info('로그아웃 했습니다.');
                    $location.path('/');
                })
            }
        }
    ]
)

app.filter('flatten',function(){
    return function(array){
    var flattenArray = [];
    angular.forEach(array, function(value, index){
      angular.forEach(value.comments, function(val, index){
        flattenArray.push(val);
      })
    })
    return flattenArray;
  }
})