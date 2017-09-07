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
        'Board',
        'toastr',
        '$route',
        function($scope,$ocLazyLoad,$window,$auth,$q,$location,$state,Posts,Board,toastr,$route){

            $ocLazyLoad.load(['static/css/style.css','static/css/angular-toastr.css']);
            getPosts();
            getArticles();
            recentComment();

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
            function getArticles(){
                Board.getArticles().then(function(res){
                    $scope.articles = res.data;
                }).catch(function(err){
                    console.log(err);
                })
            }
            function recentComment(){
                var merged = [];
                var count = 0;
                Posts.recentComment().then(function(res){
                    for(var i=0;i<res.data.length;i++){
                        if(res.data[i].comments.length > 0){
                            for(var j=0;j<res.data[i].comments.length;j++){
                                res.data[i].comments[j].title = res.data[i].title;
                                merged.push(res.data[i].comments[j]);
                            }
                        }
                    }
                    $scope.merged = merged;
                    console.log(merged);
                }).catch(function(err){
                    console.log(err);
                })
            }
            $scope.show = function(index){
                toastr.success(index);
            }
             $scope.isCurrentPath = function (path){
                var currentPath = '';
                if($location.path().indexOf('/',1) != -1){
                    currentPath = $location.path().substring(0,$location.path().indexOf('/',1))
                }else{
                    currentPath = $location.path();
                }
                return currentPath == path;
            };
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
            $scope.$on('$stateChangeSuccess', function (event, next) {
                $scope.isCollapsed = true;
            });
            $scope.expanded = false;
            $scope.isCurrentPath = function (path){
                var currentPath = '';
                if($location.path().indexOf('/',1) != -1){
                    currentPath = $location.path().substring(0,$location.path().indexOf('/',1))
                }else{
                    currentPath = $location.path();
                }
                return currentPath == path;
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

app.directive('backImg', function(){
    return function(scope, element, attrs){
        attrs.$observe('backImg', function(value) {
            element.css({
                'background-image': 'url(' + value +')',
                'background-size' : 'cover'
            });
        });
    };
});

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