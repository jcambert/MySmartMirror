(function (angular,_) {
	'use strict';
    var tools=angular.module('ngTool',['ngFa']);

    tools.directive('ngTool',['$document','$rootScope', function($document,$rootScope){
        return{
            restrict:'E',
            template:'<div class="tool"><a><fa icon="cog" animation="spin" parent="true" class="fa-2x"></a></fa></div>',
            scope:{
                target:'@'
            },
            link:function($scope,$element,attrs){
                var e=angular.element($element);
                var target=$document.find($scope.target);
                e.find("a").click(function(){
                  //  target.toggle();
                    $rootScope.settings=!$rootScope.settings;
                    console.log($rootScope.settings);
                    $scope.$apply();
                })
            }
        }
    }]);
}(angular,_))