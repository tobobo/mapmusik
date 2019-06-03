let dbm;
let type;
let seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = (options, seedLink) => {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async db => {
  await db.addColumn('videos', 'hidden_at', { type: 'datetime' });
};

exports.down = async db => {
  await db.removeColumn('videos', 'hidden_at');
}

exports._meta = {
  version: 1,
};
