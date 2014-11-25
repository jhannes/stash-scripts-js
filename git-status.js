var Q = require('q');

var path = require('path');
var fs2 = require('fs2');
var fs = require('fs');

var exec = Q.nfbind(require('child_process').exec);

var targetDir = require('./git-config').targetDir;


var getSubdirs = function(dir) {
  var isSubdirectory = function(f) {
    return f.indexOf(path.sep) != -1 && fs.statSync(targetDir + f).isDirectory();
  };
  var absolutePath = function(f) {
    return dir + f;
  };

  return fs2.readdir(targetDir, {depth: 1}).then(function(result) {
    return result.filter(isSubdirectory).map(absolutePath);
  });
};


function gitStatus(dir) {
    return exec("git status -s", {cwd: dir})
        .then(function(result) {
            console.log(dir);
            process.stdout.write(result[0]);
        });
}

function gitPull(dir) {
    return exec("git pull", {cwd: dir})
      .then(function(result) {
        console.log(dir);
        process.stdout.write(result[0]);
      }, function(err) {
        console.log("Error", dir);
        console.log(err);
      });
}

Q.all(getSubdirs(targetDir).map(gitPull)).done(function(result) {
    console.log("Done");
});
