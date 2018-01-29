import { obj as objectStream } from 'through2';

/**
 * Call a registered function with changes from a RethinkDB table changefeed
 * @param  {[type]} r            A handle to the RethinkDB driver
 * @param  {[type]} db           The RethinkDB database to watch for changes
 * @param  {[type]} listener     The function to call when changes happen
 * @param  {[type]} nextData     New document data after a change
 * @param  {[type]} previousData Document data before a change
 * @param  {[type]} table        The RethinkDB table to watch for changes
 */
function watchTable(
  r,
  {
    db,
    listener,
    nextData: shouldHaveNextData,
    previousData: shouldHavePreviousData,
    table
  }
) {
  const dataStream = r
    .db(db)
    .table(table)
    .changes()
    .toStream();

  return dataStream.pipe(
    objectStream(
      async ({ new_val: nextData, old_val: previousData }, enc, cb) => {
        try {
          listener({
            db,
            nextData: shouldHaveNextData ? nextData : undefined,
            previousData: shouldHaveNextData ? previousData : undefined,
            table
          });
        } catch (e) {
          cb(e);
        }

        cb();
      }
    )
  );
}

export default watchTable;
