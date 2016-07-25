angular.module('pokeMap').component('pokeMap', {
  templateUrl: 'poke-map/poke-map.template.html',
  controller: function PokeMapController($scope, $http, $interval,
                                          $mdMedia, $mdDialog, NgMap){
    $scope.pokeMarks = [];
    $scope.user = {};
    $scope.isBusy = false;

    // Callback to set the map after map initializes
    NgMap.getMap().then(function(map) {
      $scope.map = map;
    });

    $scope.refresh = function(){
      $scope.pokeMarks = [];
      getLocation();
      $scope.query();
    }

    $scope.query = function(){
      $scope.isBusy = true;
      var data = {};
      data.lat = $scope.user.lat;
      data.lon = $scope.user.lon;
      data.username = $scope.user.name;
      data.password = $scope.user.password;

      $http({
        method: 'POST',
        url: 'api/pokemon',
        data: data
      }).then(function(data) {
        console.log(data);
        // Populate the map!
        
        for (poke in data.data) {
          var poke = data.data[poke];
          var newMark = {};
          newMark.pokemon = poke.name;
          newMark.pokeNum = poke.id;
          newMark.coords = poke.lat + ',' + poke.lng;
          $scope.pokeMarks.push(newMark);
          $scope.isBusy = false;
        }
      }, function(err) {
        console.log(err);
      });
    }



    var getLocation = function() {
      // TODO should this be in a promise?
      // NOTE this might not even need to be a service

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position){
          console.log(position.coords);
          $scope.user.lat = position.coords.latitude;
          $scope.user.lon = position.coords.longitude;
        }, function(error) {
          switch(error.code) {
            case error.PERMISSION_DENIED:
              if (error.message.indexOf("Only secure origins are allowed") == 0) {
                tryAPIGeolocation();
              }
              else {
                console.log("User denied the request for Geolocation.");
              }
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

        }, {enableHighAccuracy: true});
      }
      else {
        console.log("Geolocation is not supported by this browser.");
        tryAPIGeolocation();
      }
    }
    var tryAPIGeolocation = function() {
      jQuery.post( "http://maps.google.com/maps/api/js?key=AIzaSyAQ8ids03AVpJ8EDcom5Qdu2cQOCdkC9VY&libraries=geolocate", function(success) {
        console.log(position.coords);
        $scope.user.lat = position.coords.latitude;
        $scope.user.lon = position.coords.longitude;
      })
      .fail(function(err) {
        console.log("API Geolocation error: "+err);
      });
    };
    getLocation();


    $scope.showLogin = function() {
      var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
      $mdDialog.show({
        controller: function DialogController($scope, $mdDialog, locals){
          $scope.user = locals.user;
          $scope.hide = function() {
            $mdDialog.hide();
          };
          $scope.cancel = function() {
            $mdDialog.cancel();
          };
          $scope.answer = function() {
            $mdDialog.hide($scope.user);
          };
        },
        templateUrl: 'poke-map/user-dialog.template.html',
        parent: angular.element(document.body),
        clickOutsideToClose: false,
        escapeToClose: false,
        locals: {user: $scope.user},
        fullscreen: useFullScreen
      })
      .then(function(answer) {
        $scope.user = {};
        $scope.user.name = answer.name;
        $scope.user.password = answer.password;
        $scope.user.lat = answer.lat;
        $scope.user.lon = answer.lon;
        $scope.refresh();
      }, function() {
        // TODO errors
      });
      $scope.$watch(function() {
        return $mdMedia('xs') || $mdMedia('sm');
      }, function(wantsFullScreen) {
        $scope.customFullscreen = (wantsFullScreen === true);
      });
    }
    if (!$scope.user.name) $scope.showLogin(); 

  }
});
