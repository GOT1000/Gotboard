angular.module('gotboard')
	.controller('Post.IndexController',
		function($scope,Posts,Account,$auth,toastr,$window,$stateParams,$state){
			$window.scrollTo(0,0);

			$scope.currentPage = 0;

			$scope.paging = {
				total : 10,
				current : $stateParams.page || 1,
				onPageChanged : loadPages,
				title : decodeURI($stateParams.title) || '',
				content : decodeURI($stateParams.content) || '',
				route : "post"
			}

			$scope.selectedOption = [
				{kind:'제목',val:1},
				{kind:'내용',val:2}
			]

			$scope.optSelected = $scope.selectedOption[0];

			function loadPages(){
				$scope.currentPage = $scope.paging.current;
				$scope.titleParam = $scope.paging.title;
				$scope.contentParam = $scope.paging.content;

				var data = {
					currentPage : $scope.currentPage,
					titleParam : $scope.titleParam,
					contentParam : $scope.contentParam
				}

				Posts.pagingPosts(data).then(function(res){
					$scope.posts = res.data;
					$scope.paging.total = res.data.pages;
				})
			}
			
			$scope.searchSubmit = function(){
				searchFUnc();
			}

			$scope.pressEnter = function(keyEvent){
				if(keyEvent.which === 13){
					searchFunc();
				}
			}

			function searchFunc(){
				var searchVal = {};

				searchVal.page = 1;

				searchVal.title = '';
				searchVal.content = '';

				if($scope.optSelected.val == 1){
					searchVal.title = $scope.search;
				}else if($scope.optSelected.val == 2){
					searchVal.content = $scope.search;
				}
				$state.go('root.post',searchVal,{reload:true});	
			}
			/*Posts.getPosts().then(function(res){
				$scope.posts = res.data;
			}).catch(function(err){
				console.log(err);
			})
			$scope.pageChangeHandler = function(num) {
			   console.log('going to page ' + num);
			};

			$scope.currentPage = 1;
			$scope.pageSize = 3;
*/
			if($auth.isAuthenticated()){
				Account.getProfile()
				.then(function(response){
					$scope.currentUser = response.data;
				})
				.catch(function(err){
					console.log(err);
				})
			}
		}
	)
	.controller('Post.CreateController',
		function($scope,Posts,$state,Account,Upload,toastr,$timeout,$window){

			$window.scrollTo(0,0);

			$scope.froalaOptions = {
					toolbarButtons : ["undo","redo","|","bold","italic","underline","strikeThrough","fontFamily","fontSize","color","|","align","indent","outdent","-","insertLink","insertImage","insertVideo","insertFile","insertTable","emoticons","html"],
					toolbarButtonsMD : ["undo","redo","|","bold","italic","underline","strikeThrough","fontFamily","fontSize","color","|","align","indent","outdent","-","insertLink","insertImage","insertVideo","insertFile","insertTable","emoticons","html"],
					toolbarButtonsSM : ["undo","redo","|","bold","italic","underline","strikeThrough","fontFamily","fontSize","color","|","align","indent","outdent","-","insertLink","insertImage","insertVideo","insertFile","insertTable","emoticons","html"],
					toolbarButtonsXS : ["undo","redo","|","bold","italic","underline","strikeThrough","fontFamily","fontSize","color","-","|","align","insertLink","insertImage","insertVideo","insertFile","insertTable","emoticons","html"],
					shortcutsAvailable:["bold","italic"],
					height:300
			};

			$scope.createPost = function(file){
				$scope.IsSubmit = true;
				if($scope.postForm.$valid){

					Account.getProfile()
		            .then(function(response){

		            	var post = {};

						post.title = $scope.title;
						post.content = $scope.content;
						post.creator = response.data;
						
						if($scope.cover !== undefined){
							post.file = $scope.cover;
						}


		                Upload.upload({
		                	url : '/api/posts',
		                	method : 'POST',
		                	data : post
		                }).then(function(res){
		                	if(res.data == 'created'){
								toastr.success('게시물이 작성되었습니다.');
								$state.go('root.post');
							}
		                },function(res){
		                	console.log('Error');
		                })
		                
					}).catch(function(err){
						toastr.error(err);
					})


					
				}
				
			}

		}
	)
	.controller('Post.ViewController',
		function($scope,Posts,$stateParams,$state,Account,toastr,$auth,$window){
			$window.scrollTo(0,0);
			var id = $stateParams.id;
			Posts.getPost(id).then(function(res){
				$scope.post = res.data;
			}).catch(function(err){
				console.log(err);
			})

			getProfile();

	//			initLike();

			$scope.maxlength = 300;


			$scope.createComment = function(){
				var comment = {};

				comment.creator = $scope.currentUser;
				comment.content = $scope.commentContent;
				comment.postId = id;

				Posts.createComment(id,comment)
				.then(function(response){
					toastr.success("댓글이 작성되었습니다.");
					$state.go($state.current, {}, {reload:true});
				})
				.catch(function(response){
					toastr.error(response);
				})
			}

			$scope.deleteComment = function(commentId){
				if(confirm("해당 댓글을 정말로 삭제하시겠습니까?")){
					Posts.deleteComment(id,commentId)
					.then(function(response){
						toastr.success("댓글이 삭제되었습니다.");
						$state.go($state.current,{},{reload:true});
					})
					.catch(function(response){
						toastr.error(response);
					})
				}
			}

			function getProfile(){
				if($auth.isAuthenticated()){
		            Account.getProfile()
		            .then(function(response){
		            	$scope.currentUser = response.data;
		            	initLike();
		            })
		            .catch(function(err){
		            	toastr.error(err);
		            })
		        }
			}

/*			$scope.like = initLike();*/

			function initLike(){
				var user = $scope.currentUser;

				$scope.liked = false;

				Posts.initLike(id,user)
				.then(function(response){
					if(response.data == "liked"){
						$scope.liked = true;
					}
				})
				.catch(function(response){
					toastr.error(response);
				})
			}

			$scope.like = function(userId){

				var userInfo = {};

				userInfo.userId = userId;
				userInfo.hasliked = $scope.liked;
				
				Posts.like(id,userInfo)
				.then(function(response){
					if(response.data == "liked"){
						$scope.liked = true;
						$scope.post.likes.length++;
					}else if(response.data == "canceled"){
						$scope.liked = false;
						$scope.post.likes.length--;
					}

				})
				.catch(function(response){
					toastr.error(response);
				})
			}

			$scope.delete = function(){
				if($scope.currentUser._id === $scope.post.creator._id){
	            	deletePost();
	            }else{
	            	toastr.error("게시물에 대한 권한이 없습니다.");
	    			return;
	            }
			}
           
            function deletePost(){
            	if(confirm('정말로 삭제하시겠습니까?')){
            		Posts.deletePost(id)
            		.then(function(res){
            			if(res.data == 'deleted'){
            				toastr.success('게시물이 삭제되었습니다.');
            				$state.go('root.post',{},{reload : true})
            			}
            		})
            		.catch(function(err){
            			toastr.error(err);
            		})
            	}
            }
		}
	)
	.controller('Post.EditController',
		function($scope,$auth,Posts,$stateParams,$state,Account,toastr,Upload,$window){

			$window.scrollTo(0,0);

			$scope.froalaOptions = {
					toolbarButtons : ["undo","redo","|","bold","italic","underline","strikeThrough","fontFamily","fontSize","color","|","align","indent","outdent","-","insertLink","insertImage","insertVideo","insertFile","insertTable","emoticons","html"],
					toolbarButtonsMD : ["undo","redo","|","bold","italic","underline","strikeThrough","fontFamily","fontSize","color","|","align","indent","outdent","-","insertLink","insertImage","insertVideo","insertFile","insertTable","emoticons","html"],
					toolbarButtonsSM : ["undo","redo","|","bold","italic","underline","strikeThrough","fontFamily","fontSize","color","|","align","indent","outdent","-","insertLink","insertImage","insertVideo","insertFile","insertTable","emoticons","html"],
					toolbarButtonsXS : ["undo","redo","|","bold","italic","underline","strikeThrough","fontFamily","fontSize","color","-","|","align","insertLink","insertImage","insertVideo","insertFile","insertTable","emoticons","html"],
					shortcutsAvailable:["bold","italic"],
					height:300
			};

			var id = $stateParams.id;
			var creator = {};

			var originalFileName = "";


			if($auth.isAuthenticated()){
				Account.getProfile()
				.then(function(response){
					creator = response.data;
				})
				.catch(function(err){
					toastr.error(err);
				})

				Posts.getPost(id).then(function(res){
					if(creator._id === res.data.creator._id){

						$scope.title = res.data.title;
						$scope.content = res.data.content;
						$scope.cover = res.data.cover;

						originalFileName = res.data.cover;

						$scope.ogFileName = originalFileName;
					}else{
						toastr.error('게시물에 대한 권한이 없습니다.');
						$state.go('root.post');
					}
					
				}).catch(function(err){
					console.log(err);
				})
				
				$scope.recoverFile = function(){
					$scope.cover = originalFileName;
				}

				$scope.updatePost = function(file){
					$scope.IsSubmit = true;
					if($scope.postForm.$valid){

						Account.getProfile()
			            .then(function(response){

			            	var post = {};

			            	var file = {};

							post.title = $scope.title;
							post.content = $scope.content;

							if($scope.cover !== undefined && $scope.cover !== originalFileName){
								file = $scope.cover;
							}else if($scope.cover === originalFileName){
								post.cover = $scope.cover;
							}
							


			                Upload.upload({
			                	url : '/api/posts/'+id,
			                	method : 'PUT',
			                	data : post,
			                	file : file
			                }).then(function(res){
			                	if(res.data == 'updated'){
									toastr.success('게시물이 수정되었습니다.');
									$state.go('root.post.read',{id : id});
								}
			                },function(res){
			                	console.log('Error');
			                })
			                
						}).catch(function(err){
							toastr.error(err);
						})


						
					}
					
				}

			}else{
				toastr.error('게시물에 대한 권한이 없습니다.');
				$state.go('root.post');
			}


		}
	)


