var program = require('commander');
var fs = require('fs');
var path = require("path");

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

        if (program.folder) {
            console.log('  - ' + name);
            if (!fs.existsSync(name)) {
                fs.mkdirSync(name);
            }
        }

        // This is hideous...
        const fullDirPath = process.cwd() + (program.folder ? "\\" + name : "");
        //console.log("fullDirPath:" + fullDirPath);
        
        const fullAppDirPath = pathTo(fullDirPath, "app.js");
        //console.log("fullAppDirPath:" + fullAppDirPath);
        
        const fullAppPath = fullAppDirPath + "\\app.js";
        //console.log("fullAppPath:" + fullAppPath);
        
        let pathBackToApp = fullDirPath.replace(fullAppDirPath, "");
        if(pathBackToApp.startsWith("\\"))
            pathBackToApp = pathBackToApp.substring(1);
        //console.log("pathBackToApp:" + pathBackToApp);

        const componentPath = (program.folder ? name + "\\" : "") + name + ".component.js";
        //console.log("componentPath:" + componentPath);

        const templatePath = (program.folder ? name + "\\" : "") + name + ".html";
        //console.log("templatePath:" + templatePath);
       
        let templateUrl = pathBackToApp + "\\" + name + ".html";
        if(templateUrl.startsWith("\\"))
            templateUrl = templateUrl.substring(1);
        console.log("templateUrl:" + templateUrl);

        createTemplate(templatePath, name);
        createComponent(componentPath, name, templateUrl);

        if (program.route) {
            createComponentRoute(fullAppPath, name);
        }
    })
    .parse(process.argv);

function pathTo(testPath, fileName) {
    if (fs.existsSync(`${testPath}\\${fileName}`))
        return testPath;
    const newPath = testPath.substring(0, testPath.lastIndexOf("\\"));
    if (newPath === "\\")
        throw ("app.js not found.");
    return pathTo(newPath, fileName);
}

function createComponent(componentPath, name, templateUrl) {
    console.log('  - ' + componentPath);

    fs.writeFile(
        componentPath,
        `(function(){
    "use strict";
    
    angular
        .module("app")
        .component("${name}", { // ${name.toDash()}
            templateUrl: "${templateUrl}",
            controller: controller
        });

    function controller() {
        const $ctrl = this;
    }
    controller.$inject = [];
    
})()`,
        function (error) {
            if (error) console.log("error creating component", error);
        });
}

function createTemplate(templatePath, name) {
    console.log('  - ' + templatePath);
    fs.writeFile(
        templatePath,
        `<h5>${name}.html</h5>`,
        function (error) {
            if (error) console.log("error creating template", error);
        });
}

function createComponentRoute(fullAppPath, name) {
    console.log('  - Add route');
    var array;
    fs.readFile(fullAppPath, function (err, data) {
        if (err) throw err;
        array = data.toString().split("\r\n");
        for (var index = 0; index < array.length; index++) {
            if (array[index].indexOf('otherwise') > -1) {
                array.splice(index, 0, `            .when("/${name.toDash()}", { template: "<${name.toDash()}></${name.toDash()}>" })`)
                index++;
            }
        }
        var file = fs.createWriteStream(fullAppPath);
        file.on('error', function (err) { console.log("error writing to " + fullAppPath, err); });
        array.forEach(function (v) { file.write(v + '\r\n'); });
        file.end();
    });

}

