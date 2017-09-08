angular.module('gotboard').controller('LoginController',[
    '$scope',
    '$auth',
    '$location',
    '$rootScope',
    '$window',
    'Account',
    'toastr',
    function($scope,$auth,$location,$rootScope,$window,Account,toastr){
        $scope.login = function(){
            /*$auth.login($scope.user)
                .then(function(response){
                   toastr.success('로그인 했습니다!');
                   $location.path('/');
                })
                .catch(function(error){
                    toastr.error(error.data.message,error.status+"s");
                })*/

            Account.authenticate($scope.user)
            .then(function(response){
               $auth.setToken(response);
                toastr.success("로그인 했습니다.");
                $location.path('/');
            })
            .catch(function(error){
                toastr.error(error.data.message,error.status);
            })
        }

        $scope.authenticate = function(provider){
            $auth.authenticate(provider)
                .then(function(response){
                    toastr.success(response.data);
                    $window.localStorage.currentUser = JSON.stringify(response.data.user);
                    $rootScope.currentUser = JSON.parse($window.localStorage.currentUser);
                    toastr.success(provider+' 계정으로 로그인 했습니다.');
                    $location.path('/');
                })
                .catch(function(error){
                    if(error.message){
                        toastr.error(error.message);
                        console.log(error.message);
                    }else if(error.data){
                        toastr.error(error.data.message,error.status);
                        console.log(error.data.message)
                    }else{
                        toastr.error(error);
                    }
                });
        }

    }
])

angular.module('gotboard').controller('SignupController',[
    '$scope',
    '$auth',
    'toastr',
    '$location',
    function($scope,$auth,toastr,$location){
        $scope.signup = function(){
            $auth.signup($scope.user)
            .then(function(response){
                toastr.success('회원가입에 성공했습니다.');
                $location.path('/login');
            })
            .catch(function(error){
                toastr.error(error.data.message,error.status);
            })
        }
    }
    ]
)

angular.module('gotboard').controller('ProfileController',[
    '$scope',
    '$auth',
    'Account',
    'toastr',
    '$state',
    function($scope,$auth,Account,toastr,$state){

        getProfile();

        $scope.removeProfile = function(){
            Account.removeProfile($scope.user)
            .then(function(res){
                if(res.data == "deleted"){
                    $auth.removeToken();
                    toastr.success("회원 탈퇴에 성공했습니다.");
                        /*$auth.removeToken();*/
                     $state.go("root.home");
                }
                
            })
            .catch(function(response){
                toastr.error(response);
            })
        }

        function getProfile(){
            Account.getProfile()
            .then(function(response){
                console.log(response.data);
                $scope.user = response.data;
            })
            .catch(function(error){
                console.log(error);
            })
        }
    }
])

angular.module('gotboard').controller('Account.EditController',[
    '$scope',
    'Account',
    'toastr',
    'Upload',
    '$state',
    function($scope,Account,toastr,Upload,$state){
        getProfile();

        $scope.updateProfile = function(dataUrl,name){
            var file = {};

            if($scope.newPic !== undefined){
                file = Upload.dataUrltoBlob(dataUrl,name);
            }

            if(confirm('회원 정보를 수정하시겠습니까?')){ 
                 Upload.upload({
                    url : '/api/users/currentUser',
                    method : 'PUT',
                    data : $scope.user,
                    file : file
                }).then(function(){
                        toastr.success('회원 정보가 수정되었습니다.');
                        $state.go('root.myPage');
                    
                },function(response){
                   toastr.error(response.data.message,response.status);
                })
            }
        }

        $scope.removeProfilePic = function(){
            $scope.user.profilePic = "/static/img/profile_default.png";
        }

        function getProfile(){
            Account.getProfile()
            .then(function(response){
               $scope.user = response.data;
            })
            .catch(function(error){
                console.log(error);
            })
        }
    }
])

angular.module("gotboard").controller("Account.RemoveController",[
    '$scope',
    'toastr',
    'Account',
    '$state',
    '$auth',
    function($scope,toastr,Account,$state,$auth){
        getProfile();

        $scope.removeProfile = function(){
            Account.removeProfile($scope.user)
            .then(function(res){
                if(res.data == "deleted"){
                    $auth.removeToken();
                    toastr.success("회원 탈퇴에 성공했습니다.");
                        /*$auth.removeToken();*/
                     $state.go("root.home");
                }
                
            })
            .catch(function(response){
                toastr.error(response);
            })
        }

        function getProfile(){
            Account.getProfile()
            .then(function(response){
               $scope.user = response.data;
            })
            .catch(function(error){
                console.log(error);
            })
        }
    }
])