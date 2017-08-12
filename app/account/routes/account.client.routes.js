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

		$stateProvider
			.state('root.myPage.edit',{
				url : '/edit',
				views : {
					'container@' : {
						templateUrl: 'account/views/account.edit.html',
						controller : 'Account.EditController'
					}
				},
				resolve : {
                	loginRequired : loginRequired
				}
			})
			.state('root.myPage.remove',{
				url : '/remove',
				views : {
					'container@' : {
						templateUrl : 'account/views/account.remove.html',
						controller : 'Account.RemoveController'
					}
				},
				resolve : {
                	loginRequired : loginRequired
				}
			})
	}
)