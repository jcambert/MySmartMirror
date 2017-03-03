(function (angular,_,moment) {
	'use strict';

	var pluginWeather = angular.module('ngPlugins');	


	pluginWeather.run(['$log','plugins','PluginsType',function($log,plugins,PluginsType){
		plugins.add(weather, PluginsType.DATASOURCE);
		$log.log('Datasource Weather is running');
	}]);


	var weather={
		name: "openweathermap-forecast",
        display: "Open Weather Map Forecast API",
        settings: [{
            name: "api_key",
            display_name: "API Key",
            type: "text",
            placeholder: "Your personal API Key from Open Weather Map"
        }, {
            name: "location",
            display_name: "Location",
            type: "text",
            placeholder: "Example: London, UK"
        }, {
            name: "units",
            display_name: "Units",
            type: "option",
            default: "imperial",
            options: [{
                name: "Imperial",
                value: "imperial"
            }, {
                name: "Metric",
                value: "metric"
            }]
        }, {
            name: "refresh",
            display_name: "Refresh Every",
            type: "integer",
            suffix: "seconds",
            default_value: 5
        }],
        newInstance: function(settings, newInstanceCallback, startCallback, updateCallback, stopCallback, $interval,$injector) {
            newInstanceCallback(new WeatherDatasource(settings, startCallback, updateCallback, stopCallback, $interval,$injector));
        }
	};

	var WeatherDatasource = function(settings, startCallback, updateCallback, stopCallback, $interval,$injector) {
        var self = this;
        self.currentSettings = settings;
        self.timer = null;
        var $log=$injector.get('$log');
        var $http=$injector.get('$http');
        $log.log('Weather Datasource Settings:',settings);
        
       this.init = function(){}

        this.stop = function() {
            if (self.timer) {
                clearInterval(self.timer);
            }
            if (_.isFunction(stopCallback))
                stopCallback();
        }

        this.start = function() {
            //self.stop();
            self.timer = setInterval(function() {
                self.updateNow();
            },  self.currentSettings.refresh*1000);
            if (_.isFunction(startCallback))
                startCallback();
        }

        //@see http://jtblin.github.io/angular-chart.js/#top
        this.updateNow = function() {
            $log.log('Weather Forecast start update');
            var url="http://api.openweathermap.org/data/2.5/forecast?APPID=" + self.currentSettings.api_key + "&q=" + encodeURIComponent(self.currentSettings.location) + "&units=" + self.currentSettings.units;
            $http.jsonp(url)
            .then(function(result, status, headers, config){
                var data=result.data;
                $log.log('Forecast:',data);
                var labels=[];
                var datas={series:[],data:[]}
                _.forEach(data.list,function(step){
                    labels.push(moment.unix(step.dt).format('HH:mm'));
                })
                var newData = {
                        place_name: data.city.name,
                        labels:labels,
                        datas:datas,
                        list:data.list
                    };
                    $log.log(newData);
                    updateCallback(newData);
            },function(data, status, headers, config){
                $log.log(status);
            });

        }

        this.onDispose = function() {
            clearInterval(updateTimer);
            updateTimer = null;
        }

        this.onSettingsChanged = function(newSettings) {
            currentSettings = newSettings;
            self.updateNow();
            updateRefresh(currentSettings.refresh * 1000);
        }


         function updateRefresh(refreshTime) {
            self.stop();
            self.currentSettings.refresh=refreshTime;
            self.start();
           
        }

        function toTitleCase(str) {
            return str.replace(/\w\S*/g, function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        }

    };

})(angular,_,moment);