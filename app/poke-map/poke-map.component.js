angular.module('pokeMap').component('pokeMap', {
  templateUrl: 'poke-map/poke-map.template.html',
  controller: function PokeMapController($scope, $http, $interval,
                                          $mdMedia, $mdDialog, NgMap){
    $scope.pokeMarks = [];
    $scope.user = {};
    $scope.isBusy = false;
    $scope.addressFail = false;


    $http({
      method: 'GET',
      url: 'api/user',
    }).then(function(data) {
      if (data.status === 200) {
        $scope.user = data.data;
      }
      $scope.showLogin(); 
    }, function(err) {
      // TODO ?
      $scope.showLogin(); 
    });


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
      $scope.error = "";
      var data = $scope.user;

      $http({
        method: 'POST',
        url: 'api/pokemon',
        data: data
      }).then(function(data) {
        if (data.status === 200) {
          console.log(data);
          // Populate the map!
          for (poke in data.data) {
            var poke = data.data[poke];
            var newMark = {};
            newMark.pokemon = poke.name;
            newMark.pokeNum = poke.id;
            newMark.coords = poke.lat + ',' + poke.lng;
            // newMark.expire = Math.round(poke.disappear_time / 6000000)/100;
            $scope.pokeMarks.push(newMark);
            $scope.isBusy = false;
          }
        }
        else {
          $scope.error = "Error!"
        }
      }, function(err) {
        console.log(err);
        $scope.isBusy = false;
        $scope.error = err.data;
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
          geocodeAddress();
        }, function(error) {
          switch(error.code) {
            case error.PERMISSION_DENIED:
              if (error.message.indexOf("Only secure origins are allowed") == 0) {
                geocodeAddress();
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
        geocodeAddress();
      }
    }
    var tryAPIGeolocation = function() {
      // Horribly innaccurate fallback
      if ((typeof google == 'object') && google.loader && google.loader.ClientLocation) {
        var coords = google.loader.ClientLocation; 
        console.log("API " + coords);
        $scope.user.lat = coords.latitude;
        $scope.user.lon = coords.longitude;
      }
    };
    var geocodeAddress = function(){
      $scope.addressFail = true;
    }
    $scope.placeChanged = function() {
      // console.log(this.getPlace());
      var place = this.getPlace();
      if (place.geometry) {
        var coords = place.geometry.location;
        $scope.user.lat = coords.lat();
        $scope.user.lon = coords.lng();
      }
    }

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

    $scope.toggleInfo = function(ev, poke){
      console.log(ev);
      console.log(poke);
      poke.active = false;
    }
  }
});
