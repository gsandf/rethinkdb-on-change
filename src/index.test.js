import test from 'ava';
import merge from 'lodash.merge';
import defaultOptions from './default-options';
import { data, delay, r } from './test-helpers';
import dbOnChange from '.';

const options = merge({}, defaultOptions, { rethinkdb: { host: 'rethinkdb' } });

test('runs function when RethinkDB data changes', async t => {
  const dbPrefix = 'data_change';
  const table = 'dattabletho';
  let numberChanges = 0;

  const onChangeFn = changeData => {
    t.is(changeData.nextData, undefined);
    t.is(changeData.previousData, undefined);
    numberChanges++;
    t.pass();
  };

  const testTableInfo = [
    { db: `${dbPrefix}_1`, table },
    { db: `${dbPrefix}_2`, table }
  ];

  // Create tables
  const [db1, db2] = testTableInfo.map(table => table.db);
  await r.dbCreate(db1);
  await r.dbCreate(db2);
  await r.db(db1).tableCreate(table);
  await r.db(db2).tableCreate(table);

  // Register for change events
  dbOnChange(onChangeFn, { ...options, tables: testTableInfo });

  // Insert test data
  await r
    .db(db1)
    .table(table)
    .insert(data[0]);

  await r
    .db(db2)
    .table(table)
    .insert(data[1]);

  // Wait for changes to fire
  await delay(500);

  t.is(numberChanges, data.length);
});

test('runs function when RethinkDB data changes with document data if needed', async t => {
  const db = 'data_change_document';
  const table = 'dattabletho';

  const onChangeFn = changeData => {
    delete changeData.nextData.id;
    delete changeData.previousData.id;
    t.deepEqual(changeData.nextData, data[1]);
    t.deepEqual(changeData.previousData, data[0]);
  };

  // Create table
  await r.dbCreate(db);
  await r.db(db).tableCreate(table);

  // Insert initial data
  await r
    .db(db)
    .table(table)
    .insert(data[0]);

  // Register for change events
  dbOnChange(onChangeFn, {
    ...options,
    nextData: true,
    previousData: true,
    tables: [{ db, table }]
  });

  // Insert new test data
  await r
    .db(db)
    .table(table)
    .nth(0)
    .update(data[1]);

  // Wait for changes to fire
  await delay(500);
});

test('debounce changes works with no changefeed data requested', async t => {
  const dbPrefix = 'debounce_no_data';
  const table = 'dattabletho';
  let numberChanges = 0;

  const onChangeFn = changeData => {
    numberChanges++;
    t.pass();
  };

  const testTableInfo = [
    { db: `${dbPrefix}_1`, table },
    { db: `${dbPrefix}_2`, table }
  ];

  // Create tables
  const [db1, db2] = testTableInfo.map(table => table.db);
  await r.dbCreate(db1);
  await r.dbCreate(db2);
  await r.db(db1).tableCreate(table);
  await r.db(db2).tableCreate(table);

  // Register for change events
  dbOnChange(onChangeFn, { ...options, debounce: 5000, tables: testTableInfo });

  await delay(3000);

  // Insert test data
  await r
    .db(db1)
    .table(table)
    .insert(data[0]);

  await delay(3000);

  await r
    .db(db2)
    .table(table)
    .insert(data[1]);

  // Wait for changes to fire
  await delay(2000);

  t.is(numberChanges, 1);
});
