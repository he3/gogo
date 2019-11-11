var program = require('commander');
var fs = require('fs');
var path = require("path");

String.prototype.toDash = function () {
    return this.replace(/([A-Z])/g, function ($1) { return "-" + $1.toLowerCase(); });
};

String.prototype.upperFirst = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

String.prototype.lowerFirst = function () {
    return this.charAt(0).toLowerCase() + this.slice(1);
}

program
    .version('0.0.1')
    .usage("[options] <name>")
    .option("-6, --noes6", "Do not generate component in ES6.")
    .option("-p, --noproject", "Do not add generated files to .csproj file.")
    .action(function (name) {
        console.log('Generating:');

        program.es6 = !program.noes6;
        program.project = !program.noproject;

        name = name.replace("Service", "");
        name = name.lowerFirst();
        const servicePath = name + "Service.js";

        const fullDirPath = process.cwd();

        const fullPackageDirPath = pathTo(fullDirPath, "package.json");

        let pathBackToRoot = fullDirPath.replace(fullPackageDirPath, "");
        if (pathBackToRoot.startsWith("\\"))
            pathBackToRoot = pathBackToRoot.substring(1);

        if (program.es6) {
            createES6Service(servicePath, name);
        } else {
            createService(servicePath, name);
        }

        if (program.project) {
            const fullPackageDirPath = pathTo(fullDirPath, "package.json");
            const projectFilePath = fullPackageDirPath + "\\" + fs.readdirSync(fullPackageDirPath).find(fileName => fileName.match(/.*\.csproj/ig));
            if (!projectFilePath)
                throw `Couldn't locate .csproj file in ${fullPackageDirPath}`;

            if (program.verbose) console.log(`projectFilePath: ${projectFilePath}`);
            addFilesToProject(projectFilePath, [servicePath], pathBackToRoot);
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


function createService(servicePath, name) {
    console.log('  - ' + servicePath);

    fs.writeFile(
        servicePath,
        `(function(){
    "use strict";
    
    angular
        .module("app")
        .service("${name}Service", service);

    function service($http) {
        const self = this;
    }
    service.$inject = ["$http"];
    
})();`,
        function (error) {
            if (error) console.log("error creating factory", error);
        });
}

function createES6Service(servicePath, name) {
    console.log('  - ' + servicePath);

    fs.writeFile(
        servicePath,
        `class ${name.upperFirst()}Service {
    static $inject = ["$http"];

    constructor($http) {
        this.$http = $http;

        this.baseApiUrl = "api/v1/";
    }

    search() {
        var url = this.baseApiUrl + "search";
        return this.$http.get(url, {
            params: {
            }
        }).then(response => response.data);
    }
}

angular
    .module("app")
    .service("${name}Service", ${name.upperFirst()}Service);
`,
        function (error) {
            if (error) console.log("error creating factory", error);
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
