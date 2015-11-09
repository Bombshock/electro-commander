var proc = require('child_process');

var child = proc.spawn(__dirname + "/node_modules/electron-prebuilt/dist/electron.exe", ["main.js"], {stdio: 'inherit'});
child.on('close', function (code) {
    process.exit(code);
});
