angular.module('app').controller('DataController', ['$rootScope', '$scope', 'Socket', 'myConfig', '$mdDialog', '$http',
    function($rootScope, $scope, Socket, myConfig, $mdDialog, $http) {

        var self = this;

        $rootScope.myConfig = myConfig;
        $rootScope.recentHourData = {};
        $rootScope.machineData = [{
            type: 'M',
            panId: "0013A20040B09A44",
            xCoordinate: 220,
            yCoordinate: 10,
            text: "Mill 1"
        }, {
            type: 'M',
            panId: "0013A20040D7B896",
            xCoordinate: 260,
            yCoordinate: 10,
            text: "Mill 2"
        }, {
            type: 'M',
            panId: "0013A20041629B6A",
            xCoordinate: 300,
            yCoordinate: 10,
            text: "Mill 3"
        }, {
            type: 'M',
            panId: "0013A20041629B72",
            xCoordinate: 340,
            yCoordinate: 10,
            text: "Mill 4"
        }, {
            type: 'M',
            panId: "0013A20041629B76",
            xCoordinate: 380,
            yCoordinate: 10,
            text: "Mill 5"
        }, {
            type: 'L',
            panId: "0013A20041629B77",
            xCoordinate: 120,
            yCoordinate: 10,
            text: "Lathe 1"
        }, {
            type: 'L',
            panId: "0013A20040D7B872",
            xCoordinate: 170,
            yCoordinate: 10,
            text: "Lathe 2"
        }, {
            type: 'L',
            panId: "0013A20041629B6C",
            xCoordinate: 120,
            yCoordinate: 70,
            text: "Lathe 3"
        }];




        $http({
            method: 'GET',
            url: '/api/devices'
        }).then(function successCallback(response) {
            $rootScope.machineData.forEach(function(machineUnitData) {
                 var panId = machineUnitData.panId;
                $rootScope.recentHourData[panId] = response.data.filter(function(data) {
                    return data.panId === panId;
                });
            })
        }, function errorCallback(errr) {
            console.log('retrieving database error!');
        });

        // function determineStatus()

        $rootScope.machineData.forEach(function(machineUnitData) {
            var panId = machineUnitData.panId;
            Socket.on(panId, function(updateMsg) {

                console.log("Date: ", new Date());
                console.log("new current", updateMsg);
                // var statusString="OFF";
                // if (updateMsg>0) {
                //     statusString = "ON";
                // }
                var parsedCurrent = parseFloat(updateMsg);
                var statusUpdate = {
                        panId: panId,
                        created: new Date(),
                        iRms: parsedCurrent
                    }   
                $rootScope.recentHourData[panId].shift();
                $rootScope.recentHourData[panId].push(statusUpdate);
                $rootScope.machineData = $rootScope.machineData.map(function(data) {
                    if (data.panId === panId) {
                        if (Math.abs(data.iRms-updateMsg)>1){
                            // statusChange
                            data.statusChangeMoment = new moment();
                        }
                        data.iRms = parsedCurrent;
                        data.status = 
                        data.datetime = new moment().format("h:mm:ssa");
                    }
                    return data;
                })

            });

        });



    }
]);
