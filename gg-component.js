var program = require('commander');
var fs      = require('fs');

const angularRoot = 'src/app/';

program
  .version('0.0.1')
  .usage('[options] <name ...>')
  .action(function(name){
      console.log('Generating:');
      createComponent(name);
  })
  .parse(process.argv);
  



function createComponent(name){
    console.log('  - component ' + name);
    if (!fs.existsSync(angularRoot + name)){
        fs.mkdirSync(angularRoot + name);
    }
    fs.writeFile(
        angularRoot + name + "/" + name + "Component.js",
        `(function(){
            "use strict";
            
            angular
                .module("app")
                .component("${name}", {
                    templateUrl: "${angularRoot}${name}/${name}.html",
                    controller: ${name}Controller
                });

            function ${name}Controller() {
                const ctrl = this;
            }
            ${name}Controller.$inject = [];
            
        })()`, 
        function(error){
           if(error) console.log("error creating component", error); 
        });
        
    createTemplate(name);
    createComponentRoute(name);
}

function createTemplate(name){
    fs.writeFile(
        angularRoot + name + "/" + name + ".html",
        `${name}.html`, 
        function(error){
           if(error) console.log("error creating template", error); 
        });
}

function createComponentRoute(name){
    var array;
    fs.readFile(angularRoot + 'app.js', function(err, data) {
        if(err) throw err;
        array = data.toString().split("\r\n");
        for (var index = 0; index < array.length; index++) {
            if(array[index].indexOf('.when("/"') > -1){
                array.splice(index+1, 0, `            .when("/${name}", { template: "<${name.toDash()}></${name.toDash()}>" })`)
            }
        }
        var file = fs.createWriteStream(angularRoot + 'app.js');
        file.on('error', function(err) { console.log("error writing to app.js", err); });
        array.forEach(function(v) { file.write(v + '\r\n'); });
        file.end();
    });
    
}

String.prototype.toDash = function(){
	return this.replace(/([A-Z])/g, function($1){return "-"+$1.toLowerCase();});
};