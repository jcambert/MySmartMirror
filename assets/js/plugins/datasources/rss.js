(function (angular,_,moment) {
	'use strict';

	var pluginRss = angular.module('ngPlugins');	


	pluginRss.run(['$log','plugins','PluginsType',function($log,plugins,PluginsType){
		plugins.add(rss, PluginsType.DATASOURCE);
		$log.log('Datasource Rss is running');
	}]);


	var rss={
		name: "rss",
        display: "Rss Feeder",
        settings: [
             {
            name: "refresh",
            display_name: "Refresh Every",
            type: "integer",
            suffix: "seconds",
            default_value: 30
        }],
        newInstance: function(settings, newInstanceCallback, startCallback, updateCallback, stopCallback, $interval,$injector) {
            newInstanceCallback(new RssDatasource(settings, startCallback, updateCallback, stopCallback, $interval,$injector));
        }
	};

	var RssDatasource = function(settings, startCallback, updateCallback, stopCallback, $interval,$injector) {
        var self = this;
        var defaultOptions = {units:'metric',refresh:30};
        self.currentSettings =angular.extend({},defaultOptions,settings) ;
        self.timer = null;
        var $log=$injector.get('$log');
        var $http=$injector.get('$http');
        $log.log('Rss Datasource Settings:',settings);
        
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
       //     $log.log('Rss start update');
            var url='/rss?url='+ encodeURIComponent( self.currentSettings.url);

            io.socket.request({
                method:'GET',
                url:url
            },function(result, jwres){
                if (jwres.error) {
                    console.log(jwres.statusCode); // => e.g. 403
                    return;
                }
               // console.log(jwres.statusCode); // => e.g. 200
                //console.dir(result);
               //  $log.log('Rss:',result);
                var newData = {
                        feed: result,
                    };
                if (_.isFunction(updateCallback))
                    updateCallback(newData);

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