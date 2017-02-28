(function (angular,_) {
	'use strict';


    
    var dash = angular.module('ngDashboard',['ngPlugins']);

    dash.directive('dashboardUi',['$log','dashboards', function($log,dashboards){

    }]);

    dash.directive('widget',[function(){

    }]);

    dash.service('dashboards',[function(){
        var self=this;
        self._dashboards=[];

        function _getPage(page){
            if(!angular.isDefined(page) || !_.isInteger(page))page=0;
            page=_.toInteger(page)
            return page>=0?page:0;
        }

        self.addDashboard = function(name,page){
            if(!angular.isDefined(name))return false;
            page=_getPage(page);
        };
        self.removeDashboard = function(name,page){
            if(!angular.isDefined(name))return false;
            page=_getPage(page);
        };
        self.getDashboard = function(name,page){
            if(!angular.isDefined(name))return undefined;
            page=_getPage(page);
        };

        
    }]);

    dash.factory('dashboard',['$log',function($log){
        $log.log('Create new Dashboard :',name);
        function Dashboard(name){

        }

        Dashboard.prototype={
            addPane:function(name,widget){

            },
            getPane:function(name){

            },
            getPanes:function(){

            },
            removePane:function(widgetOrName){

            },
            clear:function(){

            },
            serialize:function(){

            },
            deserialize : function(object, finishedCallback){
              
            },
            load:function(){

            },
            save:function(){

            },
            setEditing:function(editing){

            }
        };

        return Dashboard();
    }]);
    
}(angular,_))