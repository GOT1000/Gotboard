angular.module('gotboard')
	.controller('Board.IndexController',
		function($scope,Board,Account,$auth,toastr){
			Board.getArticles().then(function(res){
				$scope.articles = res.data;
			}).catch(function(err){
				console.log(err);
			})
			$scope.pageChangeHandler = function(num) {
			   console.log('going to page ' + num);
			};



			$scope.currentPage = 1;
			$scope.pageSize = 3;

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
	.controller('Board.CreateController',
		function($scope,Board,$state,Account,Upload,toastr,$timeout){
			$scope.froalaOptions = {
					toolbarButtons : ["undo","redo","|","bold","italic","underline","strikeThrough","fontFamily","fontSize","color","|","align","indent","outdent","-","insertLink","insertImage","insertVideo","insertFile","insertTable","emoticons","html"],
					toolbarButtonsMD : ["undo","redo","|","bold","italic","underline","strikeThrough","fontFamily","fontSize","color","|","align","indent","outdent","-","insertLink","insertImage","insertVideo","insertFile","insertTable","emoticons","html"],
					toolbarButtonsSM : ["undo","redo","|","bold","italic","underline","strikeThrough","fontFamily","fontSize","color","|","align","indent","outdent","-","insertLink","insertImage","insertVideo","insertFile","insertTable","emoticons","html"],
					toolbarButtonsXS : ["undo","redo","|","bold","italic","underline","strikeThrough","fontFamily","fontSize","color","-","|","align","insertLink","insertImage","insertVideo","insertFile","insertTable","emoticons","html"],
					shortcutsAvailable:["bold","italic"],
					height:300
			};

			$scope.createArticle = function(){
				$scope.IsSubmit = true;
				if($scope.boardForm.$valid){

					Account.getProfile()
		            .then(function(response){

		            	var article = {};

						article.title = $scope.title;
						article.content = $scope.content;
						article.creator = response.data;


		                Upload.upload({
		                	url : '/api/articles',
		                	method : 'POST',
		                	data : article
		                }).then(function(res){
		                	if(res.data == 'created'){
								toastr.success('게시물이 작성되었습니다.');
								$state.go('root.board');
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
	.controller('Board.ViewController',
		function($scope,Board,$stateParams,$state,Account,toastr,$auth,$window){
			$window.scrollTo(0,0);
			var id = $stateParams.id;
			Board.getArticle(id).then(function(res){
				$scope.article = res.data;
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
				comment.articleId = id;

				Board.createComment(id,comment)
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
					Board.deleteComment(id,commentId)
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

				Board.initLike(id,user)
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
				
				Board.like(id,userInfo)
				.then(function(response){
					if(response.data == "liked"){
						$scope.liked = true;
						$scope.article.likes.length++;
					}else if(response.data == "canceled"){
						$scope.liked = false;
						$scope.article.likes.length--;
					}

				})
				.catch(function(response){
					toastr.error(response);
				})
			}

			$scope.delete = function(){
				if($scope.currentUser._id === $scope.article.creator._id){
	            	deleteArticle();
	            }else{
	            	toastr.error("게시물에 대한 권한이 없습니다.");
	    			return;
	            }
			}
           
            function deleteArticle(){
            	if(confirm('정말로 삭제하시겠습니까?')){
            		Board.deleteArticle(id)
            		.then(function(res){
            			if(res.data == 'deleted'){
            				toastr.success('게시물이 삭제되었습니다.');
            				$state.go('root.board',{},{reload : true})
            			}
            		})
            		.catch(function(err){
            			toastr.error(err);
            		})
            	}
            }
		}
	)
	.controller('Board.EditController',
		function($scope,$auth,Board,$stateParams,$state,Account,toastr,Upload){
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

				Board.getArticle(id).then(function(res){
					if(creator._id === res.data.creator._id){

						$scope.title = res.data.title;
						$scope.content = res.data.content;

					}else{
						toastr.error('게시물에 대한 권한이 없습니다.');
						$state.go('root.board');
					}
					
				}).catch(function(err){
					console.log(err);
				})
				
				$scope.updateArticle = function(){
					$scope.IsSubmit = true;
					if($scope.boardForm.$valid){

						Account.getProfile()
			            .then(function(response){

			            	var article = {};

							article.title = $scope.title;
							article.content = $scope.content;

			                Upload.upload({
			                	url : '/api/articles/'+id,
			                	method : 'PUT',
			                	data : article
			                }).then(function(res){
			                	if(res.data == 'updated'){
									toastr.success('게시물이 수정되었습니다.');
									$state.go('root.board.read',{id : id});
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
				$state.go('root.board');
			}


		}
	)


