var Q = require("q");
var fs = require("fs");
var _ = require("underscore");
var parseString = require('xml2js').parseString;
var child_process = require('child_process');



function readPom(repoDir) {
    var deferred = Q.defer();
    fs.readFile(repoDir + "/pom.xml", function (error, data) {
        if (error) {
            deferred.reject(new Error(error));
        } else {
            parseString(data, function (err, pom) {
                var project = {
                    project: pom.project.artifactId[0],
                    dir: repoDir,
                    dependencies: []
                };
                if (pom.project.parent) {
                    project.parent = pom.project.parent[0].artifactId[0];
                    project.dependencies.push(project.parent);
                }

                if (pom.project.dependencies) {
                    for (var i = 0; i < pom.project.dependencies[0].dependency.length; i++) {
                        var dependency = pom.project.dependencies[0].dependency[i];
                        if (dependency.groupId[0] === 'com.brandmaster') {
                            project.dependencies.push(dependency.artifactId[0]);
                        }
                    };        
                }
                deferred.resolve(project);
            });
        }
    });
    return deferred.promise;
}


var buildProjectMap = function(dir) {
    var result = [];
    var files = fs.readdirSync(dir);
    for (var i=0; i<files.length; i++) {
        var project = files[i];
        if (!fs.statSync(dir + "/" + project).isDirectory()) continue;  
        var repos = fs.readdirSync(dir + "/" + project);
        for (var j=0; j<repos.length; j++) {
            var repoDir = dir + "/" + project + "/" + repos[j];
            if (fs.existsSync(repoDir + "/pom.xml")) {
                result.push(readPom(repoDir));                
            }
        }
    }
    return Q.all(result);
};


module.exports = function(targetDir) {
    var deferred = Q.defer();
    buildProjectMap(targetDir).then(function(data) {
        var map = {};
        _.each(data, function(p) {
            map[p.project] = {
                dir: p.dir,
                parent: p.parent,
                dependencies: p.dependencies
            }
        });
        deferred.resolve(map);
    }).fail(function(err) { deferred.reject(error); });
    return deferred.promise;
};


