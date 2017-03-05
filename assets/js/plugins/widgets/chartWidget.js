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
                            chart-labels="labels" chart-series="series"\
                            >\
                        </canvas</div>',
            link:function($scope,$elt,attrs){
              if(angular.isDefined($scope.datasource)){
                $scope.$watch('datasource.latestData',function(newData){
                  
                   if(angular.isDefined($scope.datasource.latestData)){
                        $log.log('Chart Datasource changed');
                        $scope.labels=$scope.datasource.latestData.datas.labels;
                        $scope.series=$scope.datasource.latestData.datas.series;
                        $scope.data=$scope.datasource.latestData.datas.datas;
                   }
                        
                });
                
                $scope.datasource.start();
                $scope.datasource.updateNow();
              }

            }

        }
    }]);

    widget.run(['$log','plugins','PluginsType',function($log,plugins,PluginsType){
		plugins.add(chartWidget, PluginsType.WIDGET);
		$log.log('Widget Text is running');
	}]);

    var chartWidget={
		name:"chartWidget",
		display:"Chart Widget",
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
            $log.log('chartWidget.newInstance.settings');$log.log(settings);
            newInstanceCallback(new ChartWidget(settings, startCallback, updateCallback, stopCallback, $interval,$injector));
        }
	};

    var ChartWidget = function(settings, startCallback, updateCallback, stopCallback, $interval,$injector){
        var $log = $injector.get('$log');
        var $compile=$injector.get('$compile');
        var $sce = $injector.get('$sce');
        var $rootScope = $injector.get('$rootScope');
        var $scope;
        this.init = function(){
            $log.log('ChartWidget initialization');
            $scope=$rootScope.$new(true);
            angular.extend($scope,settings);
            
            //$log.log('new Widget chart scope:',$scope);
            var elt= angular.element('<widget-chart></widget-chart>');
            var e=$compile(elt)($scope);
            return e;
        }

        this.start=function(){
            if(angular.isDefined(settings.datasource)){
                settings.datasource.start();
            }
            if (_.isFunction(startCallback))
                startCallback();
        };

        this.stop=function(){
            if(angular.isDefined(settings.datasource)){
                settings.datasource.stop();
            }
            if (_.isFunction(stopCallback))
             stopCallback();
        };

        this.updateNow = function(){
            $log.log('Chart Widget UpdateNow')
            if(angular.isDefined(settings.datasource)){
                settings.datasource.updateNow();
                $log.log('Chart Widget Datasource updated');
            }
            if (_.isFunction(updateCallback))
                updateCallback();
        };
       
    }

})(angular,_);