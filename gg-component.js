var program = require('commander');
var fs = require('fs');
var path = require("path");

String.prototype.toDash = function () {
    return this.replace(/([A-Z])/g, function ($1) { return "-" + $1.toLowerCase(); });
};

String.prototype.upperFirst = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

program
    .version('0.0.1')
    .usage("[options] <name>")
    .option("-r, --route", "Add component route to app.js.")
    .option("-f, --nofolder", "Do not create a folder for component and html template.")
    .option("-6, --noes6", "Do not generate component in ES6.")
    .option("-p, --noproject", "Do not add generated files to .csproj file.")
    .option("-v, --verbose", "Verbose logging.")
    .action(function (name) {
        console.log('Generating:');

        program.folder = !program.nofolder;
        program.es6 = !program.noes6;
        program.project = !program.noproject;

        if (program.folder) {
            console.log('  - ' + name);
            if (!fs.existsSync(name)) {
                fs.mkdirSync(name);
            }
        }

        // This is hideous...
        const fullDirPath = process.cwd() + (program.folder ? "\\" + name : "");
        if (program.verbose) console.log("fullDirPath:" + fullDirPath);

        const fullPackageDirPath = pathTo(fullDirPath, "package.json");
        if (program.verbose) console.log("fullPackageDirPath:" + fullPackageDirPath);

        const fullAppDirPath = pathTo(fullDirPath, "app.js");
        if (program.verbose) console.log("fullAppDirPath:" + fullAppDirPath);

        const fullAppPath = fullAppDirPath + "\\app.js";
        if (program.verbose) console.log("fullAppPath:" + fullAppPath);

        let pathBackToRoot = fullDirPath.replace(fullPackageDirPath, "");
        if (pathBackToRoot.startsWith("\\"))
            pathBackToRoot = pathBackToRoot.substring(1);
        if (program.verbose) console.log("pathBackToRoot:" + pathBackToRoot);

        const componentPath = (program.folder ? name + "\\" : "") + name + ".component.js";
        if (program.verbose) console.log("componentPath:" + componentPath);

        const templatePath = (program.folder ? name + "\\" : "") + name + ".html";
        if (program.verbose) console.log("templatePath:" + templatePath);

        let templateUrl = pathBackToRoot.replace(/\\/g, "/") + "/" + name + ".html";
        if (templateUrl.startsWith("\\"))
            templateUrl = templateUrl.substring(1);
        if (program.verbose) console.log("templateUrl:" + templateUrl);

        createTemplate(templatePath, name);

        if (program.es6) {
            createES6Component(componentPath, name, templateUrl);
        } else {
            createComponent(componentPath, name, templateUrl);
        }

        if (program.route) {
            createComponentRoute(fullAppPath, name);
        }

        if (program.project) {
            const projectFilePath = fullPackageDirPath + "\\" + fs.readdirSync(fullPackageDirPath).find(fileName => fileName.match(/.*\.csproj/ig));
            if (!projectFilePath)
                throw `Couldn't locate .csproj file in ${fullPackageDirPath}`;

            if (program.verbose) console.log(`projectFilePath: ${projectFilePath}`);
            addFilesToProject(projectFilePath, [templatePath, componentPath], pathBackToRoot);
        }
    })
    .parse(process.argv);

function pathTo(testPath, fileName) {
    if (fs.existsSync(`${testPath}\\${fileName}`))
        return testPath;
    const newPath = testPath.substring(0, testPath.lastIndexOf("\\"));
    if (newPath === "\\" || newPath === "")
        throw fileName + " not found in " + testPath;
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

        $ctrl.$onInit = () => {

        };
    }
    controller.$inject = [];
    
})();`,
        function (error) {
            if (error) console.log("error creating component", error);
        });
}

function createES6Component(componentPath, name, templateUrl) {
    console.log('  - ' + componentPath);

    fs.writeFile(
        componentPath,
`class ${name.upperFirst()}Controller {
    static $inject = ["stToast"];

    constructor(stToast) {
        this.toast = stToast;
    }

    $onInit() {
    }
}

angular
    .module("app")
    .component("${name}", { // ${name.toDash()}
        templateUrl: "${templateUrl}",
        controller: ${name.upperFirst()}Controller
    });
`,
        function (error) {
            if (error) console.log("error creating component", error);
        });
}

function createTemplate(templatePath, name) {
    console.log('  - ' + templatePath);
    writeFile(templatePath, [`<h5>${name}.html</h5>`]);
}

function createComponentRoute(fullAppPath, name) {
    console.log('  - Add route');
    fs.readFile(fullAppPath, function (err, data) {
        if (err) throw err;
        const lines = data.toString().split("\r\n");
        const lineIdx = lines.findIndex(line => line.match(/otherwise/));
        if (lineIdx >= 0) {
            lines.splice(lineIdx, 0, `            .when("/${name.toDash()}", { template: "<${name.toDash()}></${name.toDash()}>" })`)
        } else {
            throw `Couldn't find reference to 'otherwise' route in ${fullAppPath}`;
        }
        writeFile(fullAppPath, lines);
    });
}

function addFilesToProject(projectFilePath, filesToAdd, pathBackToRoot) {
    console.log('  - Add files to project');
    fs.readFile(projectFilePath, function (err, data) {
        if (err) throw err;
        const lines = data.toString().split("\r\n");
        const lineIdx = lines.findIndex(line => line.match(/package\.json/ig));
        if (lineIdx >= 0) {
            filesToAdd.forEach(fileToAdd => {
                lines.splice(lineIdx, 0, `    <None Include="${pathBackToRoot}\\${path.basename(fileToAdd)}" />`);
            });
            writeFile(projectFilePath, lines);
        } else {
            throw `Couldn't find reference to package.json in ${projectFilePath}`;
        }
    });
}

function writeFile(filePath, lines) {
    var file = fs.createWriteStream(filePath);
    file.on('error', function (err) { console.log("error writing to " + filePath, err); });
    lines.forEach(function (v) { file.write(v + '\r\n'); });
    file.end();
}
