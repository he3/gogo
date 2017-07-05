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
    .action(function (name) {
        console.log('Generating:');
        const appRoot = "src/app/";

        name = name.replace("Service","");
        name = name.lowerFirst();

        createService("", name);
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
    
})()`,
        function (error) {
            if (error) console.log("error creating factory", error);
        });
}