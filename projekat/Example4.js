
import { Quadstore } from 'quadstore';
import { ClassicLevel } from 'classic-level';
import { DataFactory } from 'rdf-data-factory';
import FileSystem from 'fs';
import { RdfXmlParser } from "rdfxml-streaming-parser";
import { Engine } from 'quadstore-comunica';

const classicDB = new ClassicLevel('./DataBaseLocation/DB4');
const quadFactory = new DataFactory();

const quadDB = new Quadstore( {backend: classicDB, dataFactory: quadFactory} );
await quadDB.open();

const dataSourceLocation = './DataSourceLocation/IEEE13_Assets.xml';
const dataContentStream = FileSystem.createReadStream(dataSourceLocation);

const quadParser = new RdfXmlParser(); 
const quadStream = quadParser.import(dataContentStream);

await quadDB.putStream(quadStream);

// initialization of query engine 
// responsible for executing queries against Quadstore
const queryEngine = new Engine(quadDB);

// query in SPARQL format
const classTypesQuery =        
    'PREFIX class: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>'+
    'select distinct ?ClassType where {'+        
      '?subject class:type ?ClassType .'+    
    '}';

// execution of previous query    
const classTypesStream = await queryEngine.queryBindings(classTypesQuery);

// query result interpretation
const classTypesArray = await classTypesStream.toArray();
classTypesArray.forEach(ClassTypeIterator => {    
    const classType = ClassTypeIterator.entries.hashmap.node.value.value;  
    console.log(classType + ' ---> ' + getClassTypeFromCIM(classType))
});

function getClassTypeFromCIM(CIMClassType) {
    // example of CIMClassType string: http://iec.ch/TC57/CIM100#VoltageLimit
    // split it on # character and return right part    
    return CIMClassType.split("#")[1];
}




quadDB.close();



