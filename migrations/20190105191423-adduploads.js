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
  await db.createTable('uploads', {
    id: { type: 'string', length: 36, primaryKey: true },
    url: { type: 'string', length: 255 },
  });
  await db.addColumn('videos', 'upload_id', { type: 'string', length: 36 });
};

exports.down = async db => {
  await db.dropTable('uploads');
  await db.removeColumn('videos', 'upload_id');
}

exports._meta = {
  version: 1,
};
