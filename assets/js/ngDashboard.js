(function (angular,_) {
	'use strict';
    
    var dash = angular.module('ngDashboard',['gridster', 'ngPlugins','ui.bootstrap']);
    
    dash.constant('FormState',{ADD:0,MODIFY:1});

    dash.directive('dashboardUi',['$log','dashboards','FormState', function($log,dashboards,FormState){
        return{
            restrict:'E',
            replace:true,
            templateUrl:'templates/dashboard.html',
            controller:[ '$scope','$uibModal',function($scope,$uibModal){

                $scope.gridsterOpts = {
                    margins: [20, 20],
                    outerMargin: false,
                    pushing: true,
                    floating: true,
                    draggable: {
                        enabled: false
                    },
                    resizable: {
                        enabled: false,
                        handles: ['n', 'e', 's', 'w', 'se', 'sw']
                    }
                };
                
                $scope.dashboard = undefined;
                $scope.page = undefined;
                $scope.selectedDashboardId=-1;
                $scope.selectedPageId=-1;

                $scope.$watch('selectedDashboardId',function(newValue,oldValue){
                    $scope.dashboard=dashboards.getDashboard(newValue);
                    $scope.page = $scope.dashboard.firstPage();
                });

                $scope.$watch('selectedPageId',function(newValue,oldValue){
                    $scope.page=$scope.dashboard.getPage(newValue);
                });

                $scope.addDashboard = function(){
                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: 'templates/modals/dashboard.html',
                        controller: 'DashboardModalController',
                        size: 'lg',
                        resolve: {
                            options:function() {
                                return{
                                    mode: FormState.ADD
                                    }
                                }
                            }
                        });
                     modalInstance.result.then(function (result) {
                            $scope.dashboard = dashboards.addDashboard(result.dashboard.name);
                            
                        }, function () {
                            $log.info('New Dashboard Modal dismissed at: ' + new Date());
                        });
                };

                $scope.removeDashboard = function(nameOrIndex){
                    if(!dashboards.removeDashboard(nameOrIndex))return false;
                    $scope.dashboard=dashboards.getDashboard[0];
                    $scope.page = $scope.dashboard.firstPage();
                    return true;
                };

                $scope.addPage = function(){
                    if(!angular.isDefined($scope.dashboard))return false;
                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: 'templates/modals/page.html',
                        controller: 'PageModalController',
                        size: 'lg',
                        resolve: {
                            options:function() {
                                return{
                                    dashboard:$scope.dashboard,
                                    mode: FormState.ADD
                                    }
                                }
                            }
                        });
                     modalInstance.result.then(function (result) {
                            $scope.dashboard.addPage(result.page.name);
                        }, function () {
                            $log.info('New Page Modal dismissed at: ' + new Date());
                        });
                };

                $scope.removePage = function(nameOrIndex){
                    if(!angular.isDefined($scope.dashboard))return false;
                    if(!$scope.dashboard.removePage(nameOrIndex))return false;
                    $scope.page = $scope.dashboard.firstPage();
                    return true;
                }
            }]
        }
    }]);

    dash.controller('DashboardModalController',['$log','$scope','$uibModalInstance','FormState','options',function($log,$scope,$uibModalInstance,FormState,options){
        var self=$scope;
        self.mode=options.mode;
        self.dashboard=(self.mode == FormState.ADD?{}:options.dashboard);
        self.ok = function () {
            $uibModalInstance.close({dashboard:self.dashboard});
        };

        self.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }]);

    dash.controller('PageModalController',['$log','$scope','$uibModalInstance','FormState','options',function($log,$scope,$uibModalInstance,FormState,options){
        var self=$scope;
        self.mode=options.mode;
        self.dashboard=options.dashboard;
        self.page=(self.mode == FormState.ADD?{}:options.page);
        self.ok = function () {
            $uibModalInstance.close({dashboard:self.dashboard,page:self.page});
        };

        self.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }]);

    dash.directive('widget',[function(){
        return {
            restrict:'E',
            replace:true,
            transclude:true,
            template:'<div class="box" ng-controller="CustomWidgetCtrl">\
                        <div class="box-header">\
                            <h3>{{ widget.name }}</h3>\
                            <div class="box-header-btns pull-right">\
                                <a title="settings" ng-click="openSettings(widget)"><i class="glyphicon glyphicon-cog"></i></a>\
                                <a title="Remove widget" ng-click="remove(widget)"><i class="glyphicon glyphicon-trash"></i></a>\
                            </div>\
                        </div>\
                        <div class="box-content" ng-transclude>toto</div>\
                    </div>'
        }
    }]);

    dash.service('dashboards',['Dashboard', function(Dashboard){
        var self=this;
        self._dashboards=[];

        function _getIndex(nameOrId){
            if(_.isInteger(nameOrId))return nameOrId;
            return _.findIndex(this._dashboards,function(dashboard){return dashboard.name===nameOrId;});
        }

        

        self.addDashboard = function(name){
            if(!angular.isDefined(name))return undefined;

            var dashboard= _.find(self.dashboard,function(dashboard){return dashboard.name===name;});
            if(!angular.isDefined(dashboard)){
                dashboard=new Dashboard(name);
                self.dashboards.push(dashboard);
            }
            return dashboard;
            
        };
        self.removeDashboard = function(nameOrIndex){
            if(!angular.isDefined(nameOrIndex))return false;
            var idx= _getIndex(nameOrIndex);
            self._dashboards.splice(idx,1);
            return true;
        };
        self.getDashboard = function(nameOrId){
            if(!angular.isDefined(nameOrId))return undefined;
             return self._dashboards[self.getIndex(nameOrId)];
        };

        
    }]);

    dash.factory('Dashboard',['$log',function($log){
        var self=this;
        self._pages=[];
        function Dashboard(name){
            $log.log('Create new Dashboard :',name);
            self.name=name;
        }

        Dashboard.prototype={
            addPage:function(name){
                if(!angular.isDefined(name))return false;
                var page=self._pages[this.getIndex(name)];
                if(!angular.isDefined(page)){
                    page=new Page(name);
                    self._pages.push(page);
                }

                return page;
            },
            _getPage:function(page){
                if(!angular.isDefined(page) || !_.isInteger(page))page=0;
                page=_.toInteger(page)
                return page>=0?page:0;
            },
            getIndex:function(nameOrId){
                if(_.isInteger(nameOrId))return _.toInteger(nameOrId);
                return _.findIndex(this._pages,function(page){return page.name===nameOrId;});
            },
            
            getPage:function(nameOrId){
                return this._pages[this.getIndex(nameOrId)];
            },
            firstPage:function(){
                return this.getPage(0);; 
            },
            lastPage:function(){
                return this.getPages(this._pages.length);
            },
            hasNextPage:function(nameOrId){
                return (this.getIndex(name)+1)<this._pages.count;
            },
            getNextPage:function(nameOrId){
                if(!this.hasNextPage(nameOrId))return this.getPage(nameOrId);
                return this._pages[this.getIndex(name)+1];
            },
            hasPreviousPage:function(nameOrId){
                return (this.getIndex(name)-1)>=0
            },
            getPreviousPage:function(nameOrId){
                if(!this.hasPreviousPage(nameOrId))return this.getPage(nameOrId);
                return this._pages[this.getIndex(name)-1];
            },
            getPages:function(){
                return self._pages;
            },
            removePage:function(nameOrId){
                this._pages.splice(this.getIndex(nameOrId),1);
            },
            clear:function(){
                self._pages=[];
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
    
    dash.factory('Page',['$log',function($log){
        var self=this;
        self._widgets=[];
        function Page(name){
            $log.log('Create new Dashboard :',name);
            self.name=name;
            
        }
        Page.prototype={

        }
        return Page;
    }]);

}(angular,_))