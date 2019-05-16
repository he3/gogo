var program = require('commander');
var fs = require('fs');

String.prototype.toDash = function () {
    return this.replace(/([A-Z])/g, function ($1) { return "-" + $1.toLowerCase(); });
};

String.prototype.upperFirst = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

String.prototype.lowerFirst = function() {
    return this.charAt(0).toLowerCase() + this.slice(1);
}

program
    .version('0.0.1')
    .usage("[options] <name>")
    .option("-6, --es6", "Generate service in ES6.")
    .action(function (name) {
        console.log('Generating:');
        const appRoot = "src/app/";

        name = name.replace("Service","");
        name = name.lowerFirst();

        if (program.es6) {
            createES6Service("", name);
        } else {
            createService("", name);
        }
    })
    .parse(process.argv);




function createService(path, name) {
    console.log('  - ' + path + name + "Service.js");

    fs.writeFile(
        path + name + "Service.js",
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

function createES6Service(path, name) {
    console.log('  - ' + path + name + "Service.js");

    fs.writeFile(
        path + name + "Service.js",
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