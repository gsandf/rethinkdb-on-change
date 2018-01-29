import rethinkdbdash from 'rethinkdbdash';
import defaultOptions from '../default-options';

export const r = rethinkdbdash({
  ...defaultOptions.rethinkdb,
  host: 'rethinkdb'
});

export { default as data } from './data';
export { default as delay } from './delay';
