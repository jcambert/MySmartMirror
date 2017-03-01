(function (angular,_) {
	'use strict';

    var widget = angular.module('ngPlugins');

    widget.directive('widgetText',['$log',function($log){
        return{
            restrict:'E',
            replace:true,
            transclude:false,
           /* scope:{
                title:'@',
                ngModel:'='
            },*/

            template:'<div class="widget flex-item"><div class="widget-header" ng-if="title" ng-bind="title"></div><div class="widget-content" ng-bind="ngModel"></div></div>',
           // template:'<div class="widget">toto</div>',
            link:function($scope,$elt,attrs){
              if(angular.isDefined($scope.datasource)){
                $scope.$watch('datasource.latestData',function(newData){
                    $log.log('Datasource changed',newData);
                    if(angular.isDefined($scope.field))
                        $scope.ngModel=$scope.datasource.latestData[$scope.field];
                    else
                        $scope.ngModel=$scope.datasource.latestData;
                });
                
                $scope.datasource.start();
                
              }

            }

        }
    }]);

    widget.run(['$log','plugins','PluginsType',function($log,plugins,PluginsType){
		plugins.add(textWidget, PluginsType.WIDGET);
		$log.log('Widget Text is running');
	}]);

    var textWidget={
		name:"textWidget",
		display:"Text Widget",
		settings: [/*{
            "name": "refresh",
            "display_name": "Refresh Every",
            "type": "integer",
            "suffix": "seconds",
            "min": 1,
            "placeholder": "Refresh Every",
            "default": 1
        }*/],
        newInstance: function(settings, newInstanceCallback, startCallback, updateCallback, stopCallback, $interval,$injector) {
            var $log = $injector.get('$log');
            $log.log('textWidget.newInstance.settings');$log.log(settings);
            newInstanceCallback(new TextWidget(settings, startCallback, updateCallback, stopCallback, $interval,$injector));
        }
	};

    var TextWidget = function(settings, startCallback, updateCallback, stopCallback, $interval,$injector){
        var $log = $injector.get('$log');
        var $compile=$injector.get('$compile');
        var $sce = $injector.get('$sce');
        var $rootScope = $injector.get('$rootScope');

        this.init = function(){
            $log.log('TextWidget initialization');
            var scope=$rootScope.$new(true);
            angular.extend(scope,settings);
            $log.log('new Widget text scope:',scope);
            var elt= angular.element('<widget-text></widget-text>');
            var e=$compile(elt)(scope);
            return e;
        }

        this.start=function(){
           
        };
        this.updateNow = function(){
            //var elt=angular.element('<widget-text></widget-text>');
           // var elt=angular.element('<div class="widget">{{title}}</div>');
           // settings.$scope.title='TEST';
           // elt.attr('title','WidgetTitle');
           // elt.attr('ng-model',settings.value);
         /*   var compiled=$compile('<div class="widget">toto</div>')(settings.$scope);
            $log.log(compiled.html());
            return $sce.trustAsHtml( compiled.html());
            return settings.value;*/
        };
       
    }

})(angular,_);