# rethinkdb-on-change

> 🔌 Run a function when RethinkDB detects a [change](https://rethinkdb.com/docs/changefeeds/javascript/)

[![Build Status](https://travis-ci.org/gsandf/rethinkdb-on-change.svg?branch=master)](https://travis-ci.org/gsandf/rethinkdb-on-change)
[![Greenkeeper badge](https://badges.greenkeeper.io/gsandf/rethinkdb-on-change.svg)](https://greenkeeper.io/)

**Don't [changefeeds](https://rethinkdb.com/docs/changefeeds/javascript/) already cover this?**

Yes, but we wanted a way of more easily looking for changes on multiple databases and tables with a whitelist/blacklist without writing the same thing multiple times.

Also, this comes with the feature of [debouncing](https://css-tricks.com/debouncing-throttling-explained-examples/) changes so you can run your logic only when needed.

**✨ Features:**

* **Simple:** specifying a connection and a function to run is all that's needed
* **[Tested](https://travis-ci.org/gsandf/rethinkdb-on-change)**

## Usage

**Simple example:**

```js
import dbOnChange from 'rethinkdb-on-change';

function changeFn(newData) {
  console.log('Received new data:', newData);
}

const options = {
  rethinkdb: { host: '127.0.0.1', port: 28015 },
  tables: [{ db: 'megacorp', table: 'users' }]
};

dbOnChange(changeFn, options);
```

**Everything:**

```js
import dbOnChange from 'rethinkdb-on-change';

function changeFunction({
  db, /* The database where the change occurred */
  previousData, /* The old document data (if `previousData` is true).  Otherwise `undefined`. */
  nextData, /* The new document data (if `nextData` is true).  Otherwise `undefined`. */
  table /* The table where the change occurred */
}) {

}

await dbOnChange(changeFunction, {
  // Connection details for the RethinkDB instance to be copied
  // See `rethinkdbdash` (https://github.com/neumino/rethinkdbdash) for all possible options.
  rethinkdb: {
    // (optional) The host name. Defaults to '127.0.0.1'.
    host: '127.0.0.1',
    // (optional) The port to connect to the host to. Default is 28015.
    port: 28015,
    // (optional) protocol for connection (`http` or `https`).  Defaults to `http`.
    protocol: 'http'
  },

  // (optional) If the document's new data should be a property of the argument
  // sent to the change function.
  nextData: false,

  // (optional) If the document's previous data should be a property of the argument
  // sent to the change function.
  previousData: false,

  // Tables to duplicate and watch for changes
  tables: [
    {
      // Database containing table
      db: 'megacorp',
      // Table to copy
      table: 'users'
    }
  ]
});
```

## Install

With [Yarn](https://yarnpkg.com/en/) _or_ [npm](https://npmjs.org/) installed, run:

```bash
yarn add rethinkdb-on-change

# ...or, if using `npm`
npm install rethinkdb-on-change
```

## See Also

* [`rethinkdb-elasticsearch-stream`](https://github.com/gsandf/rethinkdb-elasticsearch-stream)
* [RethinkDB changefeeds](https://rethinkdb.com/docs/changefeeds/javascript/)

## License

MIT
