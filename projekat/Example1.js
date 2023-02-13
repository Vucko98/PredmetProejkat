
import { Quadstore } from 'quadstore';
import { ClassicLevel } from 'classic-level';
import { DataFactory } from 'rdf-data-factory';

const classicDB = new ClassicLevel('./DataBaseLocation/DB1');
const quadFactory = new DataFactory();

const quadDB = new Quadstore( {backend: classicDB, dataFactory: quadFactory} );
await quadDB.open();

quadDB.close();



