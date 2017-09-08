'use strict';

var app = angular
    .module('gotboard',[
        'ui.router',
        'ngRoute',
        'ngMessages',
        'ngResource',
        'ngAnimate',
        'ngSanitize',
        'toastr',
        'oc.lazyLoad',
        'satellizer',
        'froala',
        'ngFileUpload',
        'ngImgCrop',
        'angularUtils.directives.dirPagination',
        'cl.paging',
        'yaru22.angular-timeago'
    ]);

app.config(function($stateProvider, $urlRouterProvider, $ocLazyLoadProvider, $authProvider){

    var skipIfLoggedIn = ['$q','$auth',function($q,$auth){
        var deferred = $q.defer();
        if($auth.isAuthenticated()){
            deferred.reject();
        }else{
            deferred.resolve();
        }
        return deferred.promise;
    }];

    var loginRequired = ['$q','$location','$auth',function($q,$location,$auth){
        var deferred = $q.defer();
        if($auth.isAuthenticated()){
            deferred.resolve();
        }else{
            $location.path('/login');
        }
        return deferred.promise;
    }]

    $stateProvider
        .state('root',{
            url: '',
            abstract : true,
            views : {
                'header' : {
                    templateUrl : 'templates/header.html',
                    controller : 'NavController'
                },
                'footer' : {
                    templateUrl : 'templates/footer.html'
                },
                'sidebar' : {
                    templateUrl : 'templates/sidebar.html',
                    controller: 'IndexController'
                }
            }
        })
        .state('root.home',{
            url:'/',
            views : {
                'container@' : {
                    templateUrl: 'home/index.html',
                    controller: 'IndexController',
                }
            }

        })
        .state('root.login',{
            url:'/login',
            views : {
                'container@' : {
                    templateUrl : 'home/views/login.html',
                    controller : 'LoginController'
                }
            },
            resolve : {
                skipIfLoggedIn : skipIfLoggedIn
            }
        })
        .state('root.signup',{
            url:'/signup',
            views : {
                'container@' : {
                    templateUrl : 'home/views/signup.html',
                    controller : 'SignupController'
                }
            },
            resolve : {
                skipIfLoggedIn : skipIfLoggedIn
            }
        })
        .state('root.myPage',{
            url : '/myPage',
            views : {
                'container@' : {
                    templateUrl : 'home/views/myPage.html',
                    controller : 'ProfileController'
                }
            },
            resolve : {
                loginRequired : loginRequired
            }
        })

    $urlRouterProvider.otherwise('/');
/*
    $authProvider.facebook({
        url:'/auth/facebook',
        clientId : '114994822549590',
        responseType : 'token',
    })
    $authProvider.google({
        clientId : '728532442564-uddcq7t8u9c8of6j5bila3bkkak2b0if.apps.googleusercontent.com',
        responseType : 'token',
        url:'/auth/google'
    })*/
    $authProvider.oauth2({
        name:'facebook',
        url:'/auth/facebook',
        clientId:'114994822549590',
        authorizationEndpoint: 'https://www.facebook.com/v2.5/dialog/oauth',
        redirectUri: window.location.origin + '/',
        requiredUrlParams: ['display', 'scope'],
        scope: ['email'],
        scopeDelimiter: ',',
        display: 'popup',
        popupOptions: { width: 580, height: 400 }
    })
});

app.value('froalaConfig',{
    toolbarInline:false,
    placeholderText : '내용을 입력하세요.'
})

angular.element(document).ready(function(){
    angular.bootstrap(document,['gotboard'])
})
angular.module('gotboard').run(function($rootScope, $window) {

  $rootScope.$on('$routeChangeSuccess', function () {

    var interval = setInterval(function(){
      if (document.readyState == 'complete') {
        $window.scrollTo(0, 0);
        clearInterval(interval);
      }
    }, 200);

  });
});