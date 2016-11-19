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

        name = name.replace("Factory","");
        name = name.lowerFirst();

        createFactory("", name);
    })
    .parse(process.argv);




function createFactory(path, name) {
    console.log('  - ' + path + name + "Factory.js");

    fs.writeFile(
        path + name + "Factory.js",
        `(function(){
    "use strict";
    
    angular
        .module("app")
        .factory("${name}Factory", factory);

    function factory($http) {
        return {
            getAll${name.upperFirst()}s: () => $http.get("")
        };
    }
    factory.$inject = ["$http"];
    
})()`,
        function (error) {
            if (error) console.log("error creating factory", error);
        });
}