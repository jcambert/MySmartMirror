(function (angular,_) {
	'use strict';

	var Timer = function($interval) {
        var self = this;
        self._timer = null;
        self.$interval = $interval;
    }
    Timer.prototype = {
        start: function(time, callback) {
            this._timer = this.$interval(function() {
                callback();
            }, time);
        },
        stop: function() {
            if (angular.isDefined(this._timer)) {
                this.$interval.cancel(this._timer);
            }
        }
    };

	var pluginTimer = angular.module('ngPlugins');	

/*	pluginTimer.config(['pluginsProvider','PluginsType', function(plugins,PluginsType){
		plugins.add(clock, PluginsType.DATASOURCE);
	}]);*/


	pluginTimer.run(['$log','plugins','PluginsType',function($log,plugins,PluginsType){
		plugins.add(clock, PluginsType.DATASOURCE);
		$log.log('Datasource timer is running');
	}]);


	var clock={
		name:"clock",
		display:"Clock",
		settings: [{
            "name": "refresh",
            "display_name": "Refresh Every",
            "type": "integer",
            "suffix": "seconds",
            "min": 1,
            "placeholder": "Refresh Every",
            "default": 5
        }],
        newInstance: function(settings, newInstanceCallback, startCallback, updateCallback, stopCallback, $interval,$injector) {
            newInstanceCallback(new ClockDatasource(settings, startCallback, updateCallback, stopCallback, $interval,$injector));
        }
	};

	var ClockDatasource = function(settings, startCallback, updateCallback, stopCallback, $interval,$injector) {
        var self = this;
        var currentSettings = settings;
        self.timer = null;
        var $log=$injector.get('$log');
        $log.log('Clock Datasource Settings:',settings);
        this.stop = function() {
            self.timer.stop();
            if (_.isFunction(stopCallback))
                stopCallback();
        }

        this.start = function() {
            self.stop();
            //timer =  setInterval(self.updateNow, currentSettings.refresh * 1000);
            self.timer.start(currentSettings.refresh * 1000, self.updateNow);
            if (_.isFunction(startCallback))
                startCallback();
        }

        this.updateNow = function() {
            var date = new Date();

            var data = {
                numeric_value: date.getTime(),
                full_string_value: date.toLocaleString(),
                date_string_value: date.toLocaleDateString(),
                time_string_value: date.toLocaleTimeString(),
                date_object: date
            };

            updateCallback(data);
        }

        this.onDispose = function() {
            self.stop();
        }

        this.onSettingsChanged = function(newSettings) {
            currentSettings = newSettings;
            self.start();
        }
        self.timer = new Timer($interval);

    };

})(angular,_);