angular.module('gotboard').factory('Board', 
		function($http){
			return{
				getArticles : function(){
					return $http.get("/api/articles");
				},
				getArticle : function(id){
					return $http.get("/api/articles/"+id);
				},
				createArticle : function(article){
					return $http.post("/api/articles",article);
				},
				updateArticle : function(article){
					return $http.put("/api/articles/"+article._id,article);
				},
				deleteArticle : function(id){
					return $http.delete("/api/articles/"+id);
				},
				createComment : function(id,comment){
					return $http.post("/api/articles/"+id+"/comment",comment); 
				},
				deleteComment : function(id,commentId){
					return $http.delete("/api/articles/"+id+"/comment/"+commentId);
				},
				initLike : function(id,user){
					return $http.post("/api/articles/"+id+"/like",user);
				},
				like : function(id,user){
					return $http.put("/api/articles/"+id+"/like",user);
			}
			}
		}
);
