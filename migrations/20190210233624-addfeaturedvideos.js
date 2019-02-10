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
  await db.createTable('featured_videos', {
    order: { type: 'int', primaryKey: true },
    video_id: { type: 'string', length: 36 },
  });
}

exports.down = async db => {
  await db.dropTable('featured_videos');
};

exports._meta = {
  version: 1,
};
