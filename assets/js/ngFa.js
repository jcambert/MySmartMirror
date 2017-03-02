(function (angular,_) {
	'use strict';

    var fa=angular.module('ngFa',[]);

   /* fa.directive('fa',[function(){
        return{
            restrict:'E',
            replace:true,
            template:'<i class="fa animated" ng-class="[icon,animation]"></i>',
            scope:{
                icon:'@',
                animation:'@'
            }
        }
    }]);*/

    fa.directive('fa',['$compile', function($compile){
        return{
            restrict:'E',
            replace:true,
             scope:{
                icon:'@',
                animation:'@',
                dom:'@?',
                hover:'@?',
                parent:'@?'
            },
            template:'<i class="fa fa-{{icon}} faa-{{animation}} "></i>',
            link:function($scope,$element,attrs){
                
                var e=angular.element($element);
                console.dir(e);
                if($scope.dom){
                    e.addClass('animated')
                }else if($scope.hover){
                    e.addClass('animated-hover');
                }else if($scope.parent){
                    e.parent().addClass('faa-parent');
                    e.parent().addClass('animated-hover');
                }
                $compile($element)($scope);
            }

        }
    }])
}(angular));