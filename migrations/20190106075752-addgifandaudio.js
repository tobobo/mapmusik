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
  await db.addColumn('videos', 'gif_url', { type: 'string', length: 255 });
  await db.addColumn('videos', 'audio_url', { type: 'string', length: 255 });
};

exports.down = async db => {
  await db.removeColumn('videos', 'gif_url');
  await db.removeColumn('videos', 'audio_url');
}

exports._meta = {
  version: 1,
};
