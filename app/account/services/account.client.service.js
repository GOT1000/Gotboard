angular.module('gotboard')
	.factory('Account',function($http){
		return{
			getProfile : function(){
				return $http.get('api/users/currentUser');
			},
			updateProfile: function(profileData) {
		        return $http.put('/api/users/currentUser', profileData);
		    },
		    removeProfile: function(profileData) {
		    	return $http.post('/api/users/removeUser', profileData);
		    }
		}
	})