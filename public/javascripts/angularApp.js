var app = angular.module('flapperNews',['ui.router'])

app.config([
    '$stateProvider',
    '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: '/home.html',
                controller: 'MainCtrl',
                resolve: { // ensures posts are loaded to site
                    postPromise: ['posts', function(posts) {
                        return posts.getAll();
                    }]
                }
            })

            .state('posts', {
                url: '/posts/{id}',
                templateUrl: '/posts.html',
                controller:'PostsCtrl'
            });

        $urlRouterProvider.otherwise('home');
}]);

app.factory('posts', ['$http', function($http){ // inject the $http service
    // service body 
    var o = {
        posts: []
    };

    // this loads in our route for getting our posts from the server 
    o.getAll = function() {
        return $http.get('/posts').success(function(data){
            angular.copy(data, o.posts);
        });
    };

    // create a method for ensuring new posts added are persisent 
    o.create = function(post) {
        return $http.post('/posts/', post).success(function(data){
            o.posts.push(data);
        });
    };

    o.upvote = function(post) {
      return $http.put('/posts/' + post._id + '/upvote')
        .success(function(data){
          post.upvotes += 1;
        });
    };

    return o; 

}]);

app.controller('MainCtrl', [
    '$scope', // scope allows controllers to interact and share data with angular templates.
    'posts',
    function($scope, posts){  
        $scope.test = 'Hello world!';

        $scope.posts = posts.posts;

    $scope.addPost = function(){
        if(!$scope.title || $scope.title === '') { return; }
        posts.create({ // retrieves the create function for making posts
            title: $scope.title,
            link: $scope.link,
        });
        $scope.title = '';
        $scope.link = '';
    };

        $scope.incrementUpvotes = function(post) {
            posts.upvote(post);
        };
}]);

app.controller('PostsCtrl', [
    '$scope',
    '$stateParams',
    'posts',
    function($scope, $stateParams, posts) {
        $scope.post = posts.posts[$stateParams.id]; 

        $scope.addComment = function(){
        if($scope.body === '') { return; }
        $scope.post.comments.push({
            body: $scope.body,
            author: 'user',
            upvotes: 0
        });
        $scope.body = '';
        };
}]);

