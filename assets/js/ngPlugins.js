(function (angular,_,head,moment) {
	'use strict';


    function uuid () {
        var d = _.now();
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + _.random(16)) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    };
    function isUuid (uuid) {
        var re = /^([a-f\d]{8}(-[a-f\d]{4}){3}-[a-f\d]{12}?)$/i;
        return re.test(uuid);
    };



    var plugins = angular.module('ngPlugins', []);
    plugins.constant('PluginState',{CREATED:0,INSTANCIED:1,INIT:2,PAUSED:3,RUNNING:4})
    plugins.constant('PluginsType',{DATASOURCE:0,WIDGET:1,INPUT:2,OUTPUT:3})
    plugins.constant('_',_);

    
    plugins.service('plugins',['_',function(_){
        var self=this;
        self.plugins={};
        self._check = function(type){
            if( !(type in self.plugins))
                    self.plugins[type]=[];
        }
        self.add=function(plugin,type){
            self._check(type);
            self.plugins[type].push(plugin);
        }
        self.all=function(type){
            if(!angular.isDefined(type))
                return self.plugins;
            self._check(type);
            return self.plugins[type];
        };
        self.get=function(name,type){
            self._check(type);
            return _.find(self.plugins[type],function(plugin){return plugin.name==name;});
        };
        self.has=function(plugin,type){
            self._check(type);
            return _.find(self.plugins[type],function(p){return p.name==plugin.name;})!= undefined
        };
        
    }]);

    plugins.factory('Plugin',['$log','$interval','$injector','PluginsType','PluginState','plugins',function($log,$interval,$injector,PluginsType,PluginState,plugins){
        var $rootScope = $injector.get('$rootScope');
         function Plugin(settings,type,pluginType){
            var self = this;
            self.instance = undefined;
            self.settings = {};
            self.type = undefined;
            self.pluginType=pluginType;
            self.id=uuid();
            self.datasource=settings.datasource;
            
            function setType(type){
                $log.log('try to set type to:'+type);
                if(type == undefined)return;
            
                $log.log('Plugin.type change to:',type);
                self.disposeInstance();
                if(plugins.has(type,pluginType) && _.isFunction(type.newInstance)){
                    $log.log('try instantiate');
                    function finishLoad()
                        {
                            type.newInstance(self.settings,  function(instance)
                            {
                                self.instance = instance;
                                $log.log('Plugin instance');
                                $log.log(self.instance);
                                self.type = type;
                                //  instance.updateNow();
                                self.settings.state = PluginState.CREATED;
                                $log.log(type.display +' was created');
                                $log.log(self.instance);
                                $log.log('Settings:',self.settings);
                                self.init();
                                self.start();
                            },  self.startCallback,self.updateCallback,self.stopCallback ,$interval,$injector);
                        }
                    if(_.isArray(type.external_scripts) && type.external_scripts>0)
                    {
                        head.js(type.external_scripts.slice(0), finishLoad); // Need to clone the array because head.js adds some weird functions to it
                    }
                    else
                    {
                        finishLoad();
                    }
                } 
            }
            self.disposeInstance=function(){
                    if(!_.isUndefined(this.instance))
                    {
                        if(_.isFunction(this.instance.onDispose))
                        {
                            this.instance.onDispose();
                        }

                        this.instance = undefined;
                    }
                };
            
            self.startCallback = function(){
                self.isRunning = true;
                 if(self.type)
                $log.log(self.type.name+ " is started in callback");
            };
                
            self.updateCallback=function(newData){
                self.latestData=newData;
                var now = new Date();
                self.last_updated=now.toLocaleTimeString();
                //$log.log('self.settings',self.settings);
                //$log.log('updateCallback of '+self.type.name,newData);
                $rootScope.$broadcast('DATASOURCE.'+self.type.name.toUpperCase(),{object:self,data:newData});
               // self.stop();
            };
                
            self.stopCallback = function(){
                self.isRunning = false;
                if(self.type)
                    $log.log(self.type.name+ " is stopped in callback");
            };
                
            self.init = function(){
                 if(_.isUndefined(self.instance))return;
                 if(_.isFunction(self.instance.init)){
                    $log.log(self.type.name+ ' initialization');
                    self.initializationData=self.instance.init();
                    self.title=settings.title ||'';
                    self.settings.state = PluginState.INIT;
                    $log.log(self.type.name+ ' was initialized');
                 }
            }

            self.start = function(){
                if(_.isUndefined(self.instance))return;
                if(_.isFunction(self.instance.start)){
                    $log.log('start settings:',self.settings);
                    var result=self.instance.start();
                    self.settings.state = PluginState.RUNNING;
                    $log.log(self.type.name +' was running');
                    return result;
                }
            };
                
            self.stop = function(){
                if(_.isUndefined(self.instance))return;
                if(_.isFunction(self.instance.stop)){
                    self.instance.stop();
                    self.settings.state = PluginState.PAUSED;
                    $log.log(self.type.name +' was stopped');
                }
            };
                
                
            self.edit = function(callback){
                if(_.isUndefined(self.instance))return;
                var tmprunning=self.isRunning;
                self.stop();
                callback().then(function(){
                    if(tmprunning)
                        self.start();
                });
            
            };


            
            if (settings) {
                this.setSettings(settings);
            }
            setType(type);
        }
    Plugin.prototype = {
        
        
        setSettings: function(settings) {
            $log.log('setSettings',this.settings,settings);
            angular.extend(this.settings, settings);
        },

        serialize : function()
        {
            return {
                name    : this.name,
                type    : this.type,
                settings: this.settings
            };
        },
        deserialize : function(object)
        {
            this.settings=object.settings;
            this.name=object.name;
            this.type=object.type;
        },
         updateNow : function()
        {
            if(!_.isUndefined(this.instance) && _.isFunction(this.instance.updateNow))
            {
                this.instance.updateNow();
            }
        },
        dispose : function()
        {
            this.disposeInstance();
        }
      }
      
      return Plugin;
    }]);

    plugins.run(['$log',function($log){

        $log.log('Plugins Mechanism is running');

    }]);
})(angular,_,head,moment);