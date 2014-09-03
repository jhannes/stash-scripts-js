module.exports = require("./.config");

if (!module.exports.password || !module.exports.username) {
    console.log("Create username and password in .config.js");
    process.exit(1);
}

if (!module.exports.targetDir) {
    console.log("targetDir must be set in .config.js");
    process.exit(1);
}

if (!module.exports.stashUrl) {
    console.log("stashUrl must be set in .config.js");
    process.exit(1);
}
