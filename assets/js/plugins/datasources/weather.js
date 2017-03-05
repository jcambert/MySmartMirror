(function (angular,_,moment) {
	'use strict';

	var pluginWeather = angular.module('ngPlugins');	


	pluginWeather.run(['$log','plugins','PluginsType',function($log,plugins,PluginsType){
		plugins.add(weather, PluginsType.DATASOURCE);
		$log.log('Datasource Weather is running');
	}]);


	var weather={
		name: "openweathermap-weather",
        display: "Open Weather Map API",
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
            default_value: 30
        }],
        newInstance: function(settings, newInstanceCallback, startCallback, updateCallback, stopCallback, $interval,$injector) {
            newInstanceCallback(new WeatherDatasource(settings, startCallback, updateCallback, stopCallback, $interval,$injector));
        }
	};

	var WeatherDatasource = function(settings, startCallback, updateCallback, stopCallback, $interval,$injector) {
        var self = this;
        var defaultOptions = {units:'metric',refresh:30};
        self.currentSettings =angular.extend({},defaultOptions,settings) ;
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

        this.updateNow = function() {
            $log.log('Weather start update');
            var url="https://openweathermap.org/data/2.5/weather?appid=" + self.currentSettings.api_key + "&q=" + encodeURIComponent(self.currentSettings.location) + "&units=" + self.currentSettings.units;
            $http.jsonp(url)
            .then(function(result, status, headers, config){
                var data=result.data;
                 $log.log('Weather:',data);
                 var unit=self.currentSettings.units=='metric'?'°C':'°F';
                var newData = {
                        place_name: data.name,
                        sunrise: moment.unix(data.sys.sunrise).format("HH:mm:ss"),
                        sunset: moment.unix(data.sys.sunset ).format("HH:mm:ss"),
                        conditions: toTitleCase(data.weather[0].description),
                        current_temp: data.main.temp+unit,
                        high_temp: data.main.temp_max+unit,
                        low_temp: data.main.temp_min+unit,
                        pressure: data.main.pressure+'Pa',
                        humidity: data.main.humidity+'%',
                        wind_speed: data.wind.speed,
                        wind_direction: data.wind.deg
                    };
                if (_.isFunction(updateCallback))
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