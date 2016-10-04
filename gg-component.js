var program = require('commander');
var fs = require('fs');

String.prototype.toDash = function () {
    return this.replace(/([A-Z])/g, function ($1) { return "-" + $1.toLowerCase(); });
};

program
    .version('0.0.1')
    .usage("[options] <name>")
    .option("-f, --folder", "Generate a folder with component and html template.")
    .option("-r, --route", "Add component route to app.js.")
    .action(function (name) {
        console.log('Generating:');
        const appRoot = "src/app/";

        if (program.folder) {
            const folderPath = appRoot + name + "/";
            console.log('  - ' + folderPath);
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath);
            }
            createTemplate(folderPath, name);
            createComponent(folderPath, name);
        } else {
            createComponent(appRoot, name);
        }

        if (program.route){
            createComponentRoute(appRoot, name);
        }
    })
    .parse(process.argv);




function createComponent(path, name) {
    console.log('  - ' + path + name + "Component.js");

    var templateUrl = path + name + ".html";

    fs.writeFile(
        path + name + "Component.js",
        `(function(){
    "use strict";
    
    angular
        .module("app")
        .component("${name}", { // ${name.toDash()}
            templateUrl: "${templateUrl}",
            controller: controller
        });

    function controller() {
        const ctrl = this;
    }
    controller.$inject = [];
    
})()`,
        function (error) {
            if (error) console.log("error creating component", error);
        });
}

function createTemplate(path, name) {
    console.log('  - ' + path + name + ".html");
    fs.writeFile(
        path + name + ".html",
        `<h5>${name}.html</h5>`,
        function (error) {
            if (error) console.log("error creating template", error);
        });
}

function createComponentRoute(appRoot, name) {
    console.log('  - Add route');
    const appJsPath = appRoot + "app.js";
    var array;
    fs.readFile(appJsPath, function (err, data) {
        if (err) throw err;
        array = data.toString().split("\r\n");
        for (var index = 0; index < array.length; index++) {
            if (array[index].indexOf('.when("/"') > -1) {
                array.splice(index + 1, 0, `            .when("/${name.toDash()}", { template: "<${name.toDash()}></${name.toDash()}>" })`)
            }
        }
        var file = fs.createWriteStream(appJsPath);
        file.on('error', function (err) { console.log("error writing to " + appJsPath, err); });
        array.forEach(function (v) { file.write(v + '\r\n'); });
        file.end();
    });

}

