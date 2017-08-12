angular.module('gotboard').factory('Board', Service);

var apiAddr = 'http://localhost:3000/api';

Service.$inject = ['$http'];

function Service($http){
	var url = "";
	return {
		getArticles : function(){
			url = apiAddr + '/articles';
			return $http.get(url);
		},
		getArticle : function(id){
			url = apiAddr + '/articles/' + id;
			return $http.get(url);
		},
		createArticle : function(article){
			url = apiAddr + '/articles';
			return $http.post(url,article);
		},
		updateArticle : function(article){
			url = apiAddr + '/articles/'+article._id;
			return $http.put(url,article);
		},
		deleteArticle : function(id){
			url = apiAddr + '/articles/' + id;
			return $http.delete(url);
		},
		createComment : function(id,comment){
			url = apiAddr + '/articles/' + id + '/comment';
			return $http.post(url,comment); 
		},
		deleteComment : function(id,commentId){
			url = apiAddr + '/articles/' + id + "/comment/" + commentId;
			return $http.delete(url);
		},
		initLike : function(id,user){
			url = apiAddr + '/articles/' + id + '/like';
			return $http.post(url,user);
		},
		like : function(id,user){
			url = apiAddr + '/articles/' + id + '/like';
			return $http.put(url,user);
		}
	}
}

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
