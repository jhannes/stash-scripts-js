var child_process = require('child_process');
var projectmap = require("./mvn-projectmap");
var config = require('./git-config');

var targetDir = config.targetDir;

var buildOrdering = function(map, target) {
    var result = [];

    var pushDependencies = function(module) {
        if (result.indexOf(module) != -1) return;
        for (var i = 0; i < map[module].dependencies.length; i++) {
            pushDependencies(map[module].dependencies[i]);
        };
        result.push(module);
    };

    pushDependencies(target);
    return result; 
};



projectmap(targetDir).then(function(map) {
    var buildList = buildOrdering(map, "bmweb");
    for (var i = 0; i < buildList.length; i++) {
        console.log("<module>" + buildList[i] + "</module>");
    };
}).fail(function(error) {
    console.log("Failed", error)
});


