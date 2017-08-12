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
			.state('root.post',{
	            url:'/post',
	            views : {
	                'container@' : {
	                    templateUrl: 'post/views/post.list.html',
	                    controller : 'Post.IndexController as vm'
	                }
	            }
	        })
			.state('root.post.create',{
				url : '/create',
				views : {
					'container@' : {
						templateUrl: 'post/views/post.create.html',
						controller : 'Post.CreateController'
					}
				},
				resolve : {
                	loginRequired : loginRequired
            	}
			})
			.state('root.post.read',{
				url : '/:id',
				views : {
					'container@' : {
						templateUrl: 'post/views/post.read.html',
						controller : 'Post.ViewController'
					}
				}
			})
			.state('root.post.edit',{
				url : '/:id/edit',
				views : {
					'container@' : {
						templateUrl: 'post/views/post.edit.html',
						controller : 'Post.EditController'
					}
				},
				resolve : {
                	loginRequired : loginRequired
				}
			})
	}
)