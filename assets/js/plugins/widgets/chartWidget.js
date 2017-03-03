(function (angular,_) {
	'use strict';

    var widget = angular.module('ngPlugins');

    widget.directive('widgetChart',['$log',function($log){
        return{
            restrict:'E',
            replace:true,
            transclude:false,

            template:'<div class="widget">\
                        <div class="widget-header" ng-if="subtitle" ng-bind="subtitle"></div>\
                        <canvas id="line" class="chart chart-line" chart-data="data"\
                            chart-labels="labels" chart-series="series" chart-options="options"\
                            chart-dataset-override="datasetOverride" chart-click="onClick">\
                        </canvas</div>',
            link:function($scope,$elt,attrs){
              if(angular.isDefined($scope.datasource)){
                $scope.$watch('datasource.latestData',function(newData){

                   if(angular.isDefined($scope.datasource.latestData)){
                       
                   }
                        
                });
                
                $scope.datasource.start();
                $scope.datasource.updateNow();
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
            $log.log('Text Widget UpdateNow')
            if(angular.isDefined(settings.datasource)){
                settings.datasource.updateNow();
                $log.log('Text Widget Datasource updated');
            }

        };
       
    }

})(angular,_);