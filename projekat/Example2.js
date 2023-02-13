
import { Quadstore } from 'quadstore';
import { ClassicLevel } from 'classic-level';
import { DataFactory } from 'rdf-data-factory';

const classicDB = new ClassicLevel('./DataBaseLocation/DB2');
const quadFactory = new DataFactory();

const quadDB = new Quadstore( {backend: classicDB, dataFactory: quadFactory} );
await quadDB.open();

var dbGetResult;

// print the content of empty DB
console.log('retrieving all entries from currently empty DB:');
dbGetResult = await quadDB.get({});
console.log(dbGetResult.items);
console.log('done');

// create Quad object and store it in DB
const quad1 = quadFactory.quad(
    quadFactory.namedNode('subject1'),
    quadFactory.namedNode('predicate1'),
    quadFactory.namedNode('object1'),
    quadFactory.defaultGraph(),
);
await quadDB.put(quad1)

dbGetResult = await quadDB.get({});
console.log('retrieving all entries from DB after storing single quad:');
console.log(dbGetResult.items);
console.log('done');

// create Quad object based on the first one, but change one of the attributes 
const quad1_new = quadFactory.quad(
    quad1.subject,
    quad1.predicate,
    quadFactory.namedNode('new_object1'),
    quad1.graph
);
await quadDB.patch(
    quad1,      // will be deleted
    quad1_new   // will be inserted
);

dbGetResult = await quadDB.get({});
console.log('retrieving all entries from DB after patching existing quad:');
console.log(dbGetResult.items);
console.log('done');

//delete only Quad stored in DB
await quadDB.del(quad1_new);

dbGetResult = await quadDB.get({});
console.log('retrieving all entries from DB after deleting previous quad:');
console.log(dbGetResult.items);
console.log('done');

quadDB.close();



