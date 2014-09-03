var child_process = require('child_process');
var projectmap = require("./mvn-projectmap");
var _ = require("underscore");

var targetDir = require('./git-config').targetDir;

var buildOrdering = function(map, target) {var targetDir = require('./git-config').targetDir;

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


var buildAll = function(buildList, map, command) {
    if (buildList.length == 0) return;
    var target = buildList.shift();

    var dir = map[target].dir;
    command(dir, function(err) {
        if (err) {
            console.log("Build failed!", dir);
            return;
        }
        buildAll(buildList, map, command);
    });
};

projectmap(targetDir).then(function(map) {
    var buildList = buildOrdering(map, "bmweb");
    buildAll(buildList, map, function(dir, done) {
        child_process.exec("git branch --remote", { cwd: dir}, function(error, stdout, stderr) {
            if (error) {
                console.log(dir);
                console.log(stdout);
                return done(error);
            }

            var branches = _.filter(stdout.split("\n"), function(text) {
                return text !== "  origin/HEAD -> origin/master" &&
                    text !== "" &&
                    text !== "  origin/master";
            });
            if (branches.length > 0) {
                console.log(dir, branches);
            }


            done();
        });

    });
}).fail(function(error) {
    console.log("Failed", error)
});


