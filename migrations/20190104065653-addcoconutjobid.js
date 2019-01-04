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

exports.up = db => db.addColumn('videos', 'encoder_job_id', { type: 'string' });

exports.down = async db => db.removeColumn('videos', 'encoder_job_id');

exports._meta = {
  version: 1,
};
