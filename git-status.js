var Q = require('q');
var child_process = require('child_process');
var fs = require('fs');

var targetDir = require('./git-config').targetDir;

var executeOnAllSubdirectories = function(dir, callback) {
    var result = [];
    var files = fs.readdirSync(dir);
    for (var i=0; i<files.length; i++) {
        var project = files[i];
        var subdir = dir + "/" + project;
        if (!fs.statSync(subdir).isDirectory()) continue;  
        var repos = fs.readdirSync(subdir);
        for (var j=0; j<repos.length; j++) {
            var repoDir = dir + "/" + project + "/" + repos[j];
            if (fs.statSync(repoDir).isDirectory()) {
                result.push(callback(repoDir));
            }
        }
    }
    return Q.all(result);
};


function gitStatus(dir) {
    var deferred = Q.defer();
    child_process.exec("git status -s", {cwd: dir}, function(err, stdout, stderr) {
        if (err) {
            return deferred.reject(err, stderr);
        } else {
            return deferred.resolve({dir:dir,changes:stdout});
        }
    });
    return deferred.promise;
}

function gitPull(dir) {
    var deferred = Q.defer();
    child_process.exec("git pull", {cwd: dir}, function(err, stdout, stderr) {
        if (err) {
            console.log("Error when pulling", dir);
            return deferred.reject(err, stderr);
        } else {
            console.log("Pulled " + dir + " " + stdout);
            return deferred.resolve({dir:dir,result:stdout});
        }
    });
    return deferred.promise;
}



Q.all(executeOnAllSubdirectories(targetDir, gitStatus)).then(function(result) {
    for (var i = 0; i < result.length; i++) {
        console.log(result[i].dir);
        console.log(result[i].changes);
    }
}).fail(function(error) {
    console.log("Failure", error);
});
