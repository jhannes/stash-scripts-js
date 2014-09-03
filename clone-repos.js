var request = require('request');
var _ = require('underscore');
var child_process = require('child_process');
var exec = require('child_process').exec;
var fs = require('fs');

var config = require('./git-config');

var clone_repo = function(repo) {
    var link = _.find(repo.links.clone, function(clone) { return clone.name === "ssh"; })
        || { href: repo.cloneUrl };
    var repoDir = repo.project.key + "/" + repo.slug;
    console.log("git clone", link.href, repoDir);
}

request.get({
        url: config.stashUrl + '/rest/api/1.0/repos?limit=100', 
        auth: { username: config.username, password: config.password }
    },
    function(err, res, body) {
        var body = JSON.parse(body);
        process.stdout.setMaxListeners(body.values.length+1);
        _.each(body.values, clone_repo);
    });
