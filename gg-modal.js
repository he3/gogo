var program = require('commander');
var fs = require('fs');
var path = require("path");

String.prototype.toDash = function () {
    return this.replace(/([A-Z])/g, function ($1) { return "-" + $1.toLowerCase(); });
};

program
    .version('0.0.1')
    .usage("[options] <name>")
    .action(function (name) {
        console.log('Generating:');

        console.log('  - ' + name);
        if (!fs.existsSync(name)) {
            fs.mkdirSync(name);
        }

        // This is hideous...
        const fullDirPath = process.cwd() + "\\" + name;
        //console.log("fullDirPath:" + fullDirPath);
        
        const fullPackageDirPath = pathTo(fullDirPath, "package.json");
        //console.log("fullPackageDirPath:" + fullPackageDirPath);
        
        let pathBackToRoot = fullDirPath.replace(fullPackageDirPath, "");
        if(pathBackToRoot.startsWith("\\"))
            pathBackToRoot = pathBackToRoot.substring(1);
        //console.log("pathBackToRoot:" + pathBackToRoot);

        const componentPath = name + "\\" + name + ".component.js";
        //console.log("componentPath:" + componentPath);

        const templatePath = name + "\\" + name + ".html";
        //console.log("templatePath:" + templatePath);
       
        let templateUrl = pathBackToRoot.replace(/\\/g, "/") + "/" + name + ".html";
        if(templateUrl.startsWith("\\"))
            templateUrl = templateUrl.substring(1);
        console.log("templateUrl:" + templateUrl);

        createTemplate(templatePath, name);
        createComponent(componentPath, name, templateUrl);
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
            controller: controller,
            bindings: {
                resolve: "<",
                close: "&",
                dismiss: "&"
            }
        });

    function controller() {
        const $ctrl = this;

        $ctrl.$onInit = () => {
            angular.extend($ctrl, $ctrl.resolve); // copy any resolved properties onto the controller
        };

        $ctrl.save = () => {
            // return something to the modal opener
            $ctrl.close({ $value: $ctrl.someResult });
        };

        /*
        // to open the modal (copy to some other controller)
        $ctrl.openModal = () => {
            $uibModal.open({
                    component: "${name}",
                    resolve: {
                        someValue: () => $ctrl.someValue
                    }
                }).result
                .then(someResult => {
                    console.log(someResult);
                })
                .catch(angular.noop); // suppress 'Possibly unhandled rejection' message in console, or handle the modal being dismissed some other way
        };
        */

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
`
<div class="modal-header">
    <h3 class="modal-title text-center">${name}</h3>
</div>
<div class="modal-body">
</div>
<div class="modal-footer">
    <button st-btn-type="cancel" ng-click="$ctrl.cancel()"></button>
    <button st-btn-type="save" ng-click="$ctrl.save()"></button>
</div>
`,
        function (error) {
            if (error) console.log("error creating template", error);
        });
}

