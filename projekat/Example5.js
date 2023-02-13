
import { Quadstore } from 'quadstore';
import { ClassicLevel } from 'classic-level';
import { DataFactory } from 'rdf-data-factory';
import FileSystem from 'fs';
import { RdfXmlParser } from "rdfxml-streaming-parser";
import { Engine } from 'quadstore-comunica';

const classicDB = new ClassicLevel('./DataBaseLocation/DB5');
const quadFactory = new DataFactory();

const quadDB = new Quadstore( {backend: classicDB, dataFactory: quadFactory} );
await quadDB.open();


const quadParser = new RdfXmlParser(); 

const dataSourcesArray = [
  './DataSourceLocation/IEEE13.xml',
  './DataSourceLocation/IEEE13_Assets.xml',
  './DataSourceLocation/IEEE37.CIMXML',
  './DataSourceLocation/IEEE123.CIMXML'
];

dataSourcesArray.forEach(dataSourcesIterator => {
  importDataSource(dataSourcesIterator);
});

async function importDataSource(dataSourceLocation) {    
  const dataContentStream = FileSystem.createReadStream(dataSourceLocation);
  const quadStream = quadParser.import(dataContentStream);
  await quadDB.putStream(quadStream);
}

// initialization of query engine 
// responsible for executing queries against Quadstore
const queryEngine = new Engine(quadDB);


const classTypesQuery =        
    'PREFIX class: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>'+
    'select distinct ?ClassType where {'+        
      '?subject class:type ?ClassType .'+    
    '}';

const classTypesStream = await queryEngine.queryBindings(classTypesQuery);
const classTypesArray = await classTypesStream.toArray();
classTypesArray.forEach(ClassTypeIterator => {    
    const classType = ClassTypeIterator.entries.hashmap.node.value.value;
    
    const countClassInstancesQuery =          
    'select (count(*) as ?cnt) where {'+        
      '?x ?y <' + classType + '>'+   
    '}';          
    ExecuteCountClassInstances(countClassInstancesQuery, GetClassTypeFromCIM(classType)); 
});

async function ExecuteCountClassInstances(CountClassInstancesQuery, ClassType) {
    const CountClassInstancesStream = await queryEngine.queryBindings(CountClassInstancesQuery);
    const CountClassInstancesArray = await CountClassInstancesStream.toArray();
    CountClassInstancesArray.forEach(CountClassInstancesIterator => {             
  
      console.log(
        ClassType + 
        ', instances counted: ' + 
        CountClassInstancesIterator.entries.hashmap.node.value.value
        )    
    });    
}

function GetClassTypeFromCIM(CIMClassType) {
    // example of CIMClassType string: http://iec.ch/TC57/CIM100#VoltageLimit
    // split it on # character and return right part    
    return CIMClassType.split("#")[1];
}



