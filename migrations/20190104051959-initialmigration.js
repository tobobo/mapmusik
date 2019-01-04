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
  await db.createTable('videos', {
    id: { type: 'string', length: 36, primaryKey: true },
    lat: { type: 'float' },
    lng: { type: 'float' },
    place_name: { type: 'string', length: 255 },
    video_url: { type: 'string', length: 255 },
    thumbnail_url: { type: 'string', length: 255 },
  });
  await db.addIndex('videos', 'lat_idx', ['lat']);
  await db.addIndex('videos', 'lng_idx', ['lng']);
}

exports.down = async db => {
  await db.dropTable('videos');
  await db.dropIndex('lat_idx');
  await db.dropIndex('lng_idx');
};

exports._meta = {
  version: 1,
};
