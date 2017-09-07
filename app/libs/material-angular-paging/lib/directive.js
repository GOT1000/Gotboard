/**
 *
 * The MIT License (MIT)
 * Copyright (c) 2016 Crawlink
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions
 * of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 *
 */


(function () {
    'use strict';

    var app = angular.module("cl.paging", []);

    app.directive('clPaging', ClPagingDirective);

    ClPagingDirective.$inject = [];
    function ClPagingDirective() {
        return {
            restrict: 'EA',
            scope: {
                clPages: '=',
                clAlignModel: '=',
                clPageChanged: '&',
                clSteps: '=',
                clCurrentPage: '=',
                clTitle:'=',
                clAuthor:'=',
                clContent:'=',
                clRoute:'='
            },
            controller: ClPagingController,
            controllerAs: 'vm',
            template: [
                '<button title="처음 페이지" class="md-icon-button md-raised md-warn" aria-label="First" ng-click="vm.gotoFirst()"><span>{{ vm.first }}</span></button>',
                '<button title="이전" class="md-icon-button md-raised md-check" aria-label="Previous" ng-click="vm.gotoPrev()" ng-show="vm.index - 1 >= 0"><span>&#60;</span></button>',
                '<button title="이동" class="md-icon-button md-raised" aria-label="Go to page {{i+1}}" ng-repeat="i in vm.stepInfo"',
                ' ng-click="vm.goto(vm.index + i)" ng-show="vm.page[vm.index + i]" ',
                ' ng-class="{\'md-primary\': vm.page[vm.index + i] == clCurrentPage,\'md-currentPage\':isCurrentPage(vm.index+i+1)}">',
                ' <span>{{ vm.page[vm.index + i] }}</span>',
                '</button>',
                '<button title="다음" class="md-icon-button md-raised md-check" aria-label="Next" ng-click="vm.gotoNext()" ng-show="vm.index + vm.clSteps < clPages"><span>&#62;</span></button>',
                '<button title="끝 페이지" class="md-icon-button md-raised md-warn" aria-label="Last" ng-click="vm.gotoLast()"><span>{{ vm.last }}</span></button>',
            ].join('')
        };
    }

    ClPagingController.$inject = ['$scope','$stateParams','$state'];
    function ClPagingController($scope,$stateParams,$state) {
        var vm = this;

        vm.first = '<<';
        vm.last = '>>';

        vm.index = 0;

        vm.clSteps = $scope.clSteps;

        $scope.isCurrentPage = function(page){
            return $stateParams.page == page;
        }

        vm.goto = function (index) {
            $scope.clCurrentPage = vm.page[index];
            if($scope.clRoute == 'board'){
                $state.go("root.board",{page:$scope.clCurrentPage},{reload:true});
            }else if($scope.clRoute == 'post'){
                $state.go("root.post",{page:$scope.clCurrentPage},{reload:true});
            }
        };

        vm.gotoPrev = function () {
            $scope.clCurrentPage = vm.index;
            vm.index -= vm.clSteps;
            if($scope.clRoute == 'board'){
                $state.go("root.board",{page:$scope.clCurrentPage},{reload:true});
            }else if($scope.clRoute == 'post'){
                $state.go("root.post",{page:$scope.clCurrentPage},{reload:true});
            }
        };

        vm.gotoNext = function () {
            vm.index += vm.clSteps;
            $scope.clCurrentPage = vm.index + 1;
            if($scope.clRoute == 'board'){
                $state.go("root.board",{page:$scope.clCurrentPage},{reload:true});
            }else if($scope.clRoute == 'post'){
                $state.go("root.post",{page:$scope.clCurrentPage},{reload:true});
            }
        };

        vm.gotoFirst = function () {
            vm.index = 0;
            $scope.clCurrentPage = 1;
            if($scope.clRoute == 'board'){
                $state.go("root.board",{page:1},{reload:true});
            }else if($scope.clRoute == 'post'){
                $state.go("root.post",{page:1},{reload:true});
            }
            
        };

        vm.gotoLast = function () {
            vm.index = parseInt($scope.clPages / vm.clSteps) * vm.clSteps;
            vm.index === $scope.clPages ? vm.index = vm.index - vm.clSteps : '';
            $scope.clCurrentPage = $scope.clPages;
            if($scope.clRoute == 'board'){
                $state.go("root.board",{page:$scope.clCurrentPage},{reload:true});
            }else if($scope.clRoute == 'post'){
                $state.go("root.post",{page:$scope.clCurrentPage},{reload:true});
            }
        };

        $scope.$watch('clCurrentPage', function (value) {
            vm.index = parseInt((value - 1) / vm.clSteps) * vm.clSteps;
            $scope.clPageChanged();
        });

        $scope.$watch('clPages', function () {
            vm.init();
        });

        vm.init = function () {
            vm.stepInfo = (function () {
                var result = [];
                for (var i = 0; i < vm.clSteps; i++) {
                    result.push(i)
                }
                return result;
            })();

            vm.page = (function () {
                var result = [];
                for (var i = 1; i <= $scope.clPages; i++) {
                    result.push(i);
                }
                return result;
            })();

        };
    };


})();