(function (angular,_) {
	'use strict';

    var widget = angular.module('ngPlugins');

    widget.directive('widgetScrollText',['$log','$interval',function($log){
        return{
            restrict:'E',
            replace:true,
            transclude:false,

            template:'<div class="widget flex-item">\
                        <div class="widget-header" ng-if="subtitle" ng-bind="subtitle"></div>\
                        <div class="widget-content scroll-text-widget-content" ng-if="line" >\
                            <h4>{{index}} - {{line.title}}</h4>\
                            <h5>{{line.description}}</h5>\
                        </div>\
                    </div>',
            link:function($scope,$elt,attrs){
              if(angular.isDefined($scope.datasource)){
                $scope.$watch('datasource.latestData',function(newData){
                   
                   if(angular.isDefined($scope.datasource.latestData))
                        if(angular.isDefined($scope.field) )
                            $scope.ngModel=$scope.datasource.latestData[$scope.field];
                        else
                            $scope.ngModel=$scope.datasource.latestData;
                });
                
               

                

              }

            }

        }
    }]);

    widget.run(['$log','plugins','PluginsType',function($log,plugins,PluginsType){
		plugins.add(scrollableTextWidget, PluginsType.WIDGET);
		$log.log('Widget Text is running');
	}]);

    var scrollableTextWidget={
		name:"scrollableTextWidget",
		display:"Scrollable Text Widget",
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
            $log.log('scrollableTextWidget.newInstance.settings');$log.log(settings);
            newInstanceCallback(new ScrollableTextWidget(settings, startCallback, updateCallback, stopCallback, $interval,$injector));
        }
	};

    var ScrollableTextWidget = function(settings, startCallback, updateCallback, stopCallback, $interval,$injector){
        var self = this;
        var $log = $injector.get('$log');
        var $compile=$injector.get('$compile');
        var $sce = $injector.get('$sce');
        var $rootScope = $injector.get('$rootScope');
        var $interval = $injector.get('$interval');
        var $scope;
        var scrolltimer;
        var defaultOptions = {refresh:1,lines:[]};
        self.currentSettings =angular.extend({},defaultOptions,settings) ;

        this.init = function(){
            $log.log('ScrollableTextWidget initialization');
            $scope=$rootScope.$new(true);
            angular.extend($scope,settings);
            
            //$log.log('new Widget scrollable text scope:',$scope);
            var elt= angular.element('<widget-scroll-text></widget-scroll-text>');
            var e=$compile(elt)($scope);
            return e;
        }

        this.start=function(){
            if(angular.isDefined($scope.datasource)){
                $scope.datasource.start();
                $scope.datasource.updateNow();
                var index=-1;
                scrolltimer = $interval(function(){
                    index+=1;
                    if((index+1)>=$scope.datasource.latestData.feed.items.length) index=0;
                    $scope.line=$scope.datasource.latestData.feed.items[index];
                    $scope.index=index;
                   //$log.log($scope.lines);
                },self.currentSettings.refresh*1000);
            }else{
                $log.info('there is no datasource for Scrollable Text');
            }
            if (_.isFunction(startCallback))
                startCallback();
        };

        this.stop=function(){
            if (angular.isDefined(scrolltimer)) {
                $interval.cancel(scrolltimer);
                scrolltimer = undefined;
            }
            if(angular.isDefined($scope.datasource))
                $scope.datasource.stop();
            if (_.isFunction(stopCallback))
                stopCallback();
        }
        this.updateNow = function(){
            $log.log('Scrollable Text Widget UpdateNow')
            if(angular.isDefined($scope.datasource)){
                $scope.datasource.updateNow();
                $log.log('Scrollable Text Widget Datasource updated');
            }
            if (_.isFunction(updateCallback))
                updateCallback({});
        };
       
    }

})(angular,_);