import rethinkdbdash from 'rethinkdbdash';
import defaultOptions from './default-options';
import ensureTables from './ensure-tables';
import watchTable from './watch-table';
import merge from 'lodash.merge';

// Retain a reference to a RethinkDB driver instance
let r;

async function init(listener, extraOptions) {
  const options = merge({}, defaultOptions, extraOptions);

  r = rethinkdbdash(options.rethinkdb);

  // If an error is thrown, try to cleanup connection pool before throwing error to handler
  try {
    await ensureTables(r, options.tables);
  } catch (e) {
    await cleanup();
    throw e;
  }

  options.tables.forEach(tableDetails => {
    watchTable(r, {
      listener,
      nextData: options.nextData,
      previousData: options.previousData,
      ...tableDetails
    });
  });
}

async function cleanup() {
  return r.getPoolMaster().drain();
}

export default init;
