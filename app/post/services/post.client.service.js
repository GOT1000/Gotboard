angular.module('gotboard')
	.factory('Posts', function($http){
		return {
			getPosts : function(){
				return $http.get('/api/posts');
			},
			getPost : function(id){
				return $http.get('/api/posts/'+id);
			},
			deletePost : function(id){
				return $http.delete('/api/posts/'+id);
			},
			createComment : function(id,comment){
				return $http.post('/api/posts/'+id+'/comment'); 
			},
			deleteComment : function(id,commentId){
				return $http.delete('/api/posts/'+id+'/comment/'+commentId);
			},
			initLike : function(id,user){
				return $http.post('/api/posts/'+id+'/like',user);
			},
			like : function(id,user){
				return $http.put('/api/posts/'+id+'/like',user);
			}
		}
	});



	/*function($resource){
		return $resource('api/posts/:id',{
			id : '@_id'
		},{
			get : {
				method : 'GET'
			},
			update : {
				method : 'PUT'
			}
		})
	}*/
