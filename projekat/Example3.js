
import { Quadstore } from 'quadstore';
import { ClassicLevel } from 'classic-level';
import { DataFactory } from 'rdf-data-factory';
import FileSystem from 'fs';
import { RdfXmlParser } from "rdfxml-streaming-parser";

const classicDB = new ClassicLevel('./DataBaseLocation/DB3');
const quadFactory = new DataFactory();

const quadDB = new Quadstore( {backend: classicDB, dataFactory: quadFactory} );
await quadDB.open();

const dataSourceLocation = './DataSourceLocation/SingleBaseBolatage.xml';
const dataContentStream = FileSystem.createReadStream(dataSourceLocation);

const quadParser = new RdfXmlParser(); 
const quadStream = quadParser.import(dataContentStream);

await quadDB.putStream(quadStream);

const dbGetResult = await quadDB.get({});
console.log(
    'Exemple object is represented by [' 
    + dbGetResult.items.length 
    + '] Quads'
);
console.log(dbGetResult.items);

quadDB.close();



