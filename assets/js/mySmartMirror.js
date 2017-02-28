(function (_) {
	'use strict';

	var app = angular.module('mySmartMirror', ['ngGrid', 'mySmartMirrorPlugins', 'ui.router']);

    app.constant('APPLICATION',{name:'mySmartMirror',version:'0.0.1'});
    app.constant('_',_);

    app.config(['$stateProvider','$urlRouterProvider',function($stateProvider, $urlRouterProvider){
        $stateProvider
        .state('home', {
            url: '/',
            templateUrl:'templates/main.html',
           // template: '<div>TOTO</div>',
           
            controller: function($scope,plugins,PluginsType,Plugin){
               
            }
        });

        $urlRouterProvider.otherwise('/');
    }]);

    app.directive('uiDashboard',['$log', '$compile', 'plugins','Plugin','PluginsType',function($log, $compile,plugins,Plugin,PluginsType){
        return{
            restrict:'E',
            //transclude:true,
            replace:true,
            template:'<div class="main-container flex-container" ></div>',
            link:function($scope,$elt,attrs){
                 $scope.plugins = plugins.all(/*PluginsType.DATASOURCE*/);
                $scope.widgets=[];
                var p=plugins.get('clock', PluginsType.DATASOURCE); $log.log('plugin clock:',p);
                var w=plugins.get('openweathermap',PluginsType.DATASOURCE); $log.log('plugin openweather:',w);
               
                var clockInstance=new Plugin({refresh:1},p,PluginsType.DATASOURCE);
                var weatherInstance = new Plugin({api_key:'d288da12b207992dd796241cf56014b1',location:'delle 90100',units:'metric',refresh:5},w,PluginsType.DATASOURCE);

                _.forEach(plugins.all(PluginsType.WIDGET),function(widget){
                    var instance=new Plugin({title:'Heure',ngModel:'',datasource:clockInstance,field:'time_string_value'},widget,PluginsType.WIDGET);
                    //instance.updateNow();
                    $scope.widgets.push(instance);
                    var widgetElement=instance.initializationData;
                    $log.log('widgetElement:',widgetElement);
                    $elt.append(widgetElement);
                    $log.log('uiDashboard element:',$elt);
                });

                var e=$compile($elt)($scope);
                $elt.replaceWith(e);
            }
        };
    }]);
    
    

    app.run(['$log',function($log){
        $log.log('MySmartMirror running');
    }]);
		
})(_);