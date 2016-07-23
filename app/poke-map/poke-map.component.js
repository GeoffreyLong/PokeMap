
angular.module('pokeMap').component('pokeMap', {
  templateUrl: 'poke-map/poke-map.template.html',
  controller: function PokeMapController($scope, $http, $interval,
                                          $mdMedia, $mdDialog){
    // Call pokemon api with the coordinates
    var queryPoke = $interval(function(){
      if ($scope.lat && $scope.lon && $scope.user){
        var data = {};
        data.lat = $scope.lat;
        data.lon = $scope.lon;
        data.username = $scope.user.name;
        data.password = $scope.user.password;

        $http({
          method: 'POST',
          url: 'api/pokemon',
          data: data
        }).then(function(data) {
          console.log(data);
          // Populate the map!
          data.forEach(function(poke){
            
          })
        }, function(err) {
          console.log(err);
        });
        
        cancelTimer();
      }
    }, 1000);
    var cancelTimer = function(){
      $interval.cancel(queryPoke);
    }

    var getLocation = function() {
      // TODO should this be in a promise?
      // NOTE this might not even need to be a service

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position){
          console.log(position.coords);
          $scope.lat = position.coords.latitude;
          $scope.lon = position.coords.longitude;
        }, function(error) {
          switch(error.code) {
            case error.PERMISSION_DENIED:
              console.log("User denied the request for Geolocation.");
              break;
            case error.POSITION_UNAVAILABLE:
              console.log("Location information is unavailable.");
              break;
            case error.TIMEOUT:
              console.log("The request to get user location timed out.");
              break;
            case error.UNKNOWN_ERROR:
              console.log("An unknown error occurred.");
              break;
          }

          // TODO
          // In any error case have the user enter their address... possibly via a prompt
          // This may vary by what route it's called in though
          //    This is the best case for having it in a promise
          //    If this issue does arise

        });
      }
      else {
        console.log("Geolocation is not supported by this browser.");
      }
    }
    getLocation();


    var showLogin = function() {
      var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
      $mdDialog.show({
        controller: function DialogController($scope, $mdDialog){
          $scope.user = {};
          $scope.hide = function() {
            $mdDialog.hide();
          };
          $scope.cancel = function() {
            $mdDialog.cancel();
          };
          $scope.answer = function(answer) {
            $mdDialog.hide(answer);
          };
        },
        templateUrl: 'poke-map/user-dialog.template.html',
        parent: angular.element(document.body),
        clickOutsideToClose: false,
        escapeToClose: false,
        fullscreen: useFullScreen
      })
      .then(function(answer) {
        $scope.user = {};
        $scope.user.name = answer.name;
        $scope.user.password = answer.password;
      }, function() {
        // TODO errors
      });
      $scope.$watch(function() {
        return $mdMedia('xs') || $mdMedia('sm');
      }, function(wantsFullScreen) {
        $scope.customFullscreen = (wantsFullScreen === true);
      });
    }
    if (!$scope.user) showLogin(); 

  }
});
