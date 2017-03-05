(function (angular,_) {
	'use strict';
    
    var dash = angular.module('ngDashboard',['gridster', 'ngPlugins','ngFa','ngTool','ui.bootstrap','chart.js']);
    
    dash.constant('FormState',{ADD:0,MODIFY:1});

    dash.directive('dashboardUi',['$log','dashboards','FormState','plugins','PluginsType','Plugin', function($log,dashboards,FormState,plugins,PluginsType,Plugin){
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
                        enabled: true
                    },
                    resizable: {
                        enabled: true,
                        handles: ['n', 'e', 's', 'w', 'se', 'sw']
                    },
                    rowHeight:'125',
                };
                
                $scope.dashboard = undefined;
                $scope.dashboards = dashboards._dashboards;
                $scope.page = undefined;
                $scope.selectedDashboardId=-1;
                $scope.selectedPageId=-1;

                $scope.$watch('selectedPageId',function(newValue,oldValue){
                    $scope.selectPage(newValue);
                },true);

                $scope.$watch('selectedDashboardId',function(newValue,oldValue){
                    $scope.selectDashboard(newValue);
                },true);

                $scope.resetPage = function(){
                    $scope.page=undefined;
                    $scope.selectedPageId=-1;
                    $scope.selectedPageId=0;
                }
                $scope.selectPage = function(id){
                    if(id==-1)return;
                    $log.log('Try to change page to ',id);
                    if(!angular.isDefined($scope.dashboard))return;
                    $scope.page=$scope.dashboard.getPage(id);
                    if(!angular.isDefined($scope.page))return;
                    $log.log('Current Page is ',$scope.page.name);
                }

                $scope.selectDashboard = function(id){
                    $log.log('Try to change dashboard to ',id);
                    $scope.dashboard=dashboards.getDashboard(id);
                    if(!angular.isDefined($scope.dashboard))return;
                   // angular.extend($scope.gridsterOpts,$scope.dashboard.gridSettings);
                    $scope.resetPage();
                    $scope.selectPage($scope.selectedPageId);
                    $log.log('Current Dashboard is ',$scope.dashboard.name);
                }

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
                            _addDashboard(result.dashboard.name);
                        }, function () {
                            $log.info('New Dashboard Modal dismissed at: ' + new Date());
                        });
                };
                function _addDashboard(name){
                    $log.log('Dashboard Index before Adding',$scope.selectedDashboardId);
                    $scope.selectedDashboardId= dashboards.getIndex( dashboards.addDashboard(name) );
                    $scope.selectDashboard($scope.selectedDashboardId);
                    $scope.selectPage($scope.selectedPageId);
                    $log.log('Dashboard Index after Added',$scope.selectedDashboardId);
                }

                $scope.removeDashboard = function(nameOrIndex){
                    if(!dashboards.removeDashboard(nameOrIndex))return false;
                    $scope.dashboard=dashboards.getDashboard[0];
                    $scope.page = $scope.dashboard.firstPage();
                    return true;
                };

                $scope.changeDashboard = function(d){
                  //  $scope.dashboard=d;
                    $log.log('Dashbord change to',d);
                    $scope.selectedDashboardId=d;
                }

                 $scope.changePage = function(d){
                  //  $scope.dashboard=d;
                    $log.log('Page change to',d);
                    $scope.selectedPageId=d;
                }

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
                            _addPage(result.page.name);
                        }, function () {
                            $log.info('New Page Modal dismissed at: ' + new Date());
                        });
                };
                function _addPage(name){
                    $scope.selectedPageId=$scope.dashboard.getPageIndex( $scope.dashboard.addPage(name));
                    $scope.selectPage($scope.selectedPageId);
                    $log.log('new selected page id after adding',$scope.selectedPageId);
                }

                $scope.removePage = function(nameOrIndex){
                    if(!angular.isDefined($scope.dashboard))return false;
                    if(!$scope.dashboard.removePage(nameOrIndex))return false;
                    $scope.page = $scope.dashboard.firstPage();
                    return true;
                }

               $scope.addWidget = function(){
                   var c=plugins.get('clock', PluginsType.DATASOURCE); $log.log('plugin clock:',c);
                   var cinst=new Plugin({refresh:1},c,PluginsType.DATASOURCE);

                   var t=plugins.get('textWidget',PluginsType.WIDGET);
                   var tinst=new Plugin({title:'Heure',ngModel:'',datasource:cinst,field:'time_string_value'},t,PluginsType.WIDGET)
                    $scope.page.addWidget(tinst);

                   var w=plugins.get('openweathermap-weather', PluginsType.DATASOURCE); $log.log('plugin openweathermap:',w);
                    var winst=new Plugin({api_key:'b1b15e88fa797225412429c1c50c122a1',location:'delle 90100'},w,PluginsType.DATASOURCE);

                     var t1=plugins.get('textWidget',PluginsType.WIDGET);
                    var t1inst=new Plugin({title:'Temps',ngModel:'',datasource:winst,field:'current_temp'},t1,PluginsType.WIDGET)
                    $scope.page.addWidget(t1inst);

                    var w1=plugins.get('openweathermap-forecast', PluginsType.DATASOURCE); $log.log('plugin openweathermap:',w1);
                    //var w1inst=new Plugin({api_key:'d288da12b207992dd796241cf56014b1',location:'delle 90100'},w1,PluginsType.DATASOURCE);
                    var w1inst=new Plugin({api_key:'b1b15e88fa797225412429c1c50c122a1',location:'delle 90100'},w1,PluginsType.DATASOURCE);

                     var t2=plugins.get('chartWidget',PluginsType.WIDGET);
                    var t2inst=new Plugin({title:'Prévisions',ngModel:'',datasource:w1inst},t2,PluginsType.WIDGET)
                    $scope.page.addWidget(t2inst);


                     var w2=plugins.get('rss', PluginsType.DATASOURCE); $log.log('plugin Rss:',w2);
                    var w2inst=new Plugin({url:'http://www.eurosport.fr/football/rss.xml'},w2,PluginsType.DATASOURCE);
                
                    var t3=plugins.get('scrollableTextWidget',PluginsType.WIDGET);
                    var t3inst=new Plugin({title:'Rss',ngModel:'',datasource:w2inst,refresh:10},t3,PluginsType.WIDGET)
                    $scope.page.addWidget(t3inst);
                

                }

                _addDashboard('jcambert');
                _addPage('main');
                $scope.addWidget();
            }],
            link:function($scope,$element,attrs){
            }
        }
    }]);

    dash.controller('DashboardModalController',['$log','$scope','$uibModalInstance','FormState','options',function($log,$scope,$uibModalInstance,FormState,options){
        var self=$scope;
        self.mode=options.mode;
        self.dashboard=(self.mode == FormState.ADD?{}:options.dashboard);
        self.dashboard.name="jcambert";
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
        self.page.name='main';
        self.ok = function () {
            $uibModalInstance.close({dashboard:self.dashboard,page:self.page});
        };

        self.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }]);

    dash.directive('widget',['$compile', function($compile){
        return {
            restrict:'E',
            replace:true,
            template:'<div class="box" >\
                        <div class="box-header" ng-show="$root.settings">\
                           {{title}} {{lastUpdated}}\
                            <div class="box-header-btns pull-right">\
                                <a title="settings" ng-if="!widget.isRunning" ng-click="start()"><fa icon="play" animation="tada" parent="true"></fa></a>\
                                <a title="settings" ng-if="widget.isRunning" ng-click="stop()"><fa icon="pause" animation="tada" parent="true"></fa></a>\
                                <a title="settings" ng-click="updateNow()"><fa icon="refresh" animation="tada" parent="true"></fa></a>\
                                <a title="settings" ng-click="openSettings()"><fa icon="cog" animation="spin" parent="true"></fa></a>\
                                <a title="Remove widget" ng-click="remove()"><fa icon="trash" animation="tada" parent="true"></fa></a>\
                            </div>\
                        </div>\
                        <div class="box-content" ></div>\
                    </div>',
            scope:{
                widget:'=target'
            },
            link:function($scope,$element,attrs){
                $scope.content=$scope.widget.initializationData;
                $scope.title=$scope.widget.title;
                if(angular.isDefined($scope.widget.datasource)){
                    $scope.lastUpdated = $scope.widget.datasource.last_updated;

                    $scope.$watch('widget.datasource.last_updated',function(newValue,oldValue){
                        $scope.lastUpdated=newValue;
                    },true);
                }

                $scope.start = function(){
                    $scope.widget.start();
                };

                $scope.stop = function(){
                    $scope.widget.stop();
                };

                $scope.updateNow = function(){
                    console.dir($scope.widget);
                    $scope.widget.instance.updateNow();
                };

                console.dir($scope.widget);
                angular.element($element).find('.box-content').append($scope.content);
                $compile($element)($scope);
            }
        }
    }]);

    dash.service('dashboards',['$log', 'Dashboard', function($log,Dashboard){
        var self=this;
        self._dashboards=[];

        self.getIndex = function(nameOrIdOrObject){
            if(_.isInteger(nameOrIdOrObject))return nameOrIdOrObject;
            if(_.isObject(nameOrIdOrObject))return _.findIndex(self._dashboards,function(dashboard){return dashboard.name===nameOrIdOrObject.name;});
            return _.findIndex(self._dashboards,function(dashboard){return dashboard.name===nameOrIdOrObject;});
        }

        
        self.count = function(){
            return self._dashboards.length;
        };
        self.addDashboard = function(name){
            if(!angular.isDefined(name))return undefined;

            var dashboard= _.find(self._dashboards,function(dashboard){return dashboard.name===name;});
            if(!angular.isDefined(dashboard)){
                dashboard=new Dashboard(name);
                self._dashboards.push(dashboard);
                dashboard.id=self.getIndex(name);
                $log.log(dashboard);
            }
            return dashboard;
            
        };
        self.removeDashboard = function(nameOrIndex){
            if(!angular.isDefined(nameOrIndex))return false;
            var idx= self.getIndex(nameOrIndex);
            self._dashboards.splice(idx,1);
            return true;
        };
        self.getDashboard = function(nameOrId){
            if(!angular.isDefined(nameOrId))return undefined;
             return self._dashboards[self.getIndex(nameOrId)];
        };

        
    }]);

    dash.factory('Dashboard',['$log','Page',function($log,Page){
        
        function Dashboard(name){
            $log.log('Create new Dashboard :',name);
            this.name=name;
            this.pages=[];
           /* this.gridSettings={
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
            };*/
        }

        Dashboard.prototype={
            
            addPage:function(name){
                if(!angular.isDefined(name))return false;
                var page=this.pages[this.getPageIndex(name)];
                if(!angular.isDefined(page)){
                    page=new Page(name);
                    this.pages.push(page);
                    page.id= this.pages.indexOf(page);
                }

                return page;
            },
            _getPage:function(page){
                if(!angular.isDefined(page) || !_.isInteger(page))page=0;
                page=_.toInteger(page)
                return page>=0?page:0;
            },
            getPageIndex:function(nameOrId){
                $log.log('try get page index',nameOrId);
                if(_.isInteger(nameOrId))return _.toInteger(nameOrId);
                if(_.isObject(nameOrId))return _.findIndex(this.pages,function(page){return page.name===nameOrId.name;});
                return _.findIndex(this.pages,function(page){return page.name===nameOrId;});
            },
            
            getPage:function(nameOrId){
                if(this.pages.length==0)return undefined;
                return this.pages[this.getPageIndex(nameOrId)];
            },
            firstPage:function(){
                return this.getPage(0);; 
            },
            lastPage:function(){
                return this.getPages(this.pages.length);
            },
            hasNextPage:function(nameOrId){
                return (this.getPageIndex(name)+1)<this.pages.count;
            },
            getNextPage:function(nameOrId){
                if(!this.hasNextPage(nameOrId))return this.getPage(nameOrId);
                return this.pages[this.getPageIndex(name)+1];
            },
            hasPreviousPage:function(nameOrId){
                return (this.getPageIndex(name)-1)>=0
            },
            getPreviousPage:function(nameOrId){
                if(!this.hasPreviousPage(nameOrId))return this.getPage(nameOrId);
                return this.pages[this.getPageIndex(name)-1];
            },
            getPages:function(){
                return self.pages;
            },
            removePage:function(nameOrId){
                this.pages.splice(this.getPageIndex(nameOrId),1);
            },
            clear:function(){
                self.pages=[];
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

        return Dashboard;
    }]);
    
    dash.factory('Page',['$log',function($log){

        function Page(name){
            $log.log('Create new Page :',name);
            this.name=name;
            this.widgets=[];
        }
        Page.prototype={
            addWidget:function(widget){
                this.widgets.push(widget);
            },
            
        }
        return Page;
    }]);

    dash.filter('object2Array', [function() {
        return function(input) {
        if (Object.prototype.toString.call(input) === '[object Array]') {
            return input;
        }

        var out = [];
        for(var i in input){
            out.push(input[i]);
        }

        return out;
        };
  }])
}(angular,_))