define([
  'text!./cam-tasklist-filters.html'
], function(
  template
) {
  'use strict';
  return [
  function(
  ) {


    function itemById(items, id) {
      var i, item;
      for (i in items) {
        item = items[i];
        if (item.id === id) { return item; }
      }
    }



    return {
      template: template,

      controller: [
        '$scope',
        '$rootScope',
        'camAPI',
      function (
        $scope,
        $rootScope,
        camAPI
      ) {
        var Filter = camAPI.resource('filter');

        $scope.filters = [];
        $scope.focusedId = null;
        $scope.loading = true;

        $scope.edit = function(filter) {
          $rootScope.$broadcast('filter.edit', filter);
        };

        $scope.delete = function(filter) {
          $rootScope.$broadcast('filter.delete', filter);
        };

        $scope.focus = function(filter) {
          if ($scope.focusedId === filter.id) { return; }
          $scope.focusedId = filter.id;
          $rootScope.currentFilter = filter;
          $rootScope.$broadcast('tasklist.filter.current');
        };



        function authed() {
          return $rootScope.authentication && $rootScope.authentication.name;
        }



        function listFilters() {
          if (!authed()) { return; }
          $scope.loading = true;

          Filter.list({}, function(err, res) {
            $scope.loading = false;
            if (err) { throw err; }

            $scope.filters = res;

            var first;
            angular.forEach(res, function(filter) {
              if (!first || filter.properties.priority < first.properties.priority) {
                first = filter;
              }
            });

            $rootScope.$broadcast('filters.loaded', res);
            $scope.focus(first);
          });
        }

        $rootScope.$watch('authentication', listFilters);

        $rootScope.$on('filter.saved', listFilters);

        $rootScope.$on('filter.deleted', listFilters);
      }]
    };
  }];
});
