var tsFileStruct = require("ts-file-parser");
var fs = require('fs');
var format = require("string-template");

var parseRecords = require("./parse_records");
var recordGen = require("./create_record_gen");
var IDL = require("./idlTypes");
var AS = require("./asTypes");

var inputArgs = process.argv.slice(2);

var inputFile = inputArgs[0];
var recordsFile = inputArgs[1];
var outputIndexFile = 'assembly/index.ts'
var outputRecordFile = 'assembly/index.records.ts'

var decls = fs.readFileSync(inputFile).toString();
var jsonStructure = tsFileStruct.parseStruct(decls, {}, inputFile);

var recordDecls = fs.readFileSync(recordsFile).toString();
var recordsJsonStructure = tsFileStruct.parseStruct(recordDecls, {}, recordsFile);

var recordMap = parseRecords.buildRecordMap(recordsJsonStructure);

var did_template = `service : {
{did_methods}
}
`

var template = `
// *************************************
// THIS IS GENERATED BY THE ACTOR PARSER
// *************************************
import * as CALL from "./lib/api/call"
import * as API from "./lib/api";
import { getType } from "./lib/candid/idl/types";
import { {actor_class_name} } from "./example";
import { Encoder } from "./lib/candid/encode";
{model_imports}
import { initRegistry } from "./index.records";

initRegistry();

var actor: {actor_class_name};
{canister_init}
{canister_methods}


export function canister_pre_upgrade(): void {
    var currentTime = API.time();
    API.print("[canister_pre_upgade] called " + currentTime.toString());
    actor.preUpgrade();
}

export function canister_post_upgrade(): void {
    var currentTime = API.time();
    API.print("[canister_post_upgade] called " + currentTime.toString());
    actor.postUpgrade();
}

function dfxSeed(): f64 { return <f64>API.time(); }

`

var model_import_template = `import { {typeNames} } from "./models";`

var canister_init_template = `
export function canister_init(): void {
    var text: string = "[init] Hello DFINITY from AssemblyScript";
    API.print(text);
    actor = new {actor_class_name}(API.caller(), API.time());
}
`

var canister_method_template = `
export function {func_type}_{func_name}(): void {
    //recieve inputs
    {recieve}

    //call function
    {actor_call}

    //respond
    {response}
}
`

var actor_call_void_template = `actor.{func_name}({params});`

var actor_call_template = `let response = actor.{func_name}({params});`

//TODO: search for the first class that extends the Actor class
var actorClass = jsonStructure.classes[0];

var method_template = "";
var did_methods_template = "";

actorClass.methods.forEach(m => {

    var funcType = getFunctionType(m.text);

    if (funcType) {

        let recieve = m.arguments.length == 0 ?
            "CALL.receive();" :
            "var decoder = CALL.receive();";

        //Compute input types
        let inputArgs = [];
        var inputArgTypes = [];
        m.arguments.forEach(arg => {
            var inputType = AS.buildASFieldType(arg.type);

            recieve += format(`
    let {name} = decoder.decode<{type}>();`, {
                name: arg.name,
                type: inputType
            })
            inputArgs.push(arg.name);
            inputArgTypes.push(buildDIDType(arg.type));
        })

        let actor_call = "";
        let response = "CALL.reply(new Encoder([]));"

        //Compute return types
        if (m.returnType.typeName == 'void') {
            actor_call = format(actor_call_void_template, {
                func_name: m.name,
                params: inputArgs.join(",")
            })
        } else {
            actor_call = format(actor_call_template, {
                func_name: m.name,
                params: inputArgs.join(",")
            })

            response = format(`let encoder = new Encoder([getType<{type}>()]);
    encoder.write<{type}>(response);
    CALL.reply(encoder);`, {
                type: AS.buildASFieldType(m.returnType)
            })
        }

        method_template += format(canister_method_template, {
            func_name: m.name,
            func_type: funcType,
            actor_call: actor_call,
            response: response,
            recieve: recieve,
        });

        //Build DID
        var returnType = AS.buildASFieldType(m.returnType);

        did_methods_template += format(
            `\t{func_name}: ({input_types}) -> ({return_type}){call_type};\n`, {
            func_name: m.name,
            input_types: inputArgTypes.map(x => IDL.toIDLType(x)).join(","),
            return_type: returnType == 'void' ? '' : buildDIDType(m.returnType),
            call_type: getIDLCallType(funcType, returnType)
        }
        )
    }
});

function recordMapContains(records, name){
    for(var i = 0; i < records.length; i++) {
        if (records[i].name == name) {
            return records[i];
        }
    }
    return null;
}

function getIDLCallType(funcType, returnType){
    if(returnType == 'void'){
        return ' oneway'
    }
    if(funcType == 'canister_query'){
        return ' query'
    } 
    return '';
}

function buildDIDType(types) {
    
    var result = IDL.buildDIDFieldType(types);
    //remove vec - a hack
    var vecLess = result.replace(/vec/g,'').replace(/opt/g,'').trim();
    var record = recordMapContains(recordMap, vecLess);
    if(record){
        return result.replace(vecLess, record.did);
    }

    return result;
}

function getFunctionType(text) {
    if (text.indexOf("@query") != -1) {
        return "canister_query";
    } else if (text.indexOf("@update") != -1) {
        return "canister_update";
    }
    return null;
}

canister_init_template = format(canister_init_template, {
    actor_class_name: actorClass.name
})

var output = format(template, {
    canister_init: canister_init_template,
    canister_methods: method_template,
    actor_class_name: actorClass.name,
    model_imports: format(model_import_template, {typeNames: recordMap.map(x => x.name).join(",")})
})

fs.writeFile(outputIndexFile, output, function (err) {
    if (err) return console.log(err);
});


var record_gen = recordGen.buildRecordGenerator(recordMap);
fs.writeFile(outputRecordFile, record_gen, function (err) {
    if (err) return console.log(err);
});


var did_output = format(did_template, {
    did_methods: did_methods_template
});

fs.writeFile(".dfx/local/canisters/ashello/ashello.did", did_output, function (err) {
    if (err) return console.log(err);
});
