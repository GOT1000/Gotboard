angular.module('gotboard').config(
	function($stateProvider,$urlRouterProvider){

		var loginRequired = ['$q','$location','$auth',function($q,$location,$auth){
	        var deferred = $q.defer();
	        if($auth.isAuthenticated()){
	            deferred.resolve();
	        }else{
	            $location.path('/login');
	        }
	        return deferred.promise;
    	}];		
    	$urlRouterProvider.when('/board',function($state){
    		$state.go('root.board',{page:1})
    	});
    	$urlRouterProvider.when('/board/',function($state){
    		$state.go('root.board',{page:1})
    	});
		$stateProvider
			.state('root.board',{
	            url:'/board?page?title?author?content',
	            views : {
	                'container@' : {
	                    templateUrl: 'freeboard/views/board.list.html',
	                    controller : 'Board.IndexController as vm'
	                }
	            }
	        })
			.state('root.board.create',{
				url : '/create',
				views : {
					'container@' : {
						templateUrl: 'freeboard/views/board.create.html',
						controller : 'Board.CreateController'
					}
				},
				resolve : {
                	loginRequired : loginRequired
            	}
			})
			.state('root.board.read',{
				url : '/:id',
				views : {
					'container@' : {
						templateUrl: 'freeboard/views/board.read.html',
						controller : 'Board.ViewController'
					}
				}
			})
			.state('root.board.edit',{
				url : '/:id/edit',
				views : {
					'container@' : {
						templateUrl: 'freeboard/views/board.edit.html',
						controller : 'Board.EditController'
					}
				},
				resolve : {
                	loginRequired : loginRequired
				}
			})
	}
)