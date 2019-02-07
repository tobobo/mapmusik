import fs from 'fs';
import parse from 'csv-parse/lib/sync';
import uuidv4 from 'uuid/v4';
import { transcodeVideo } from './server/lib/coconutAdapter.mjs';
import config from './config/server.js';

const run = async () => {
  const filename = process.argv[2];

  const input = fs.readFileSync(filename);

  const records = parse(input);

  console.log(records);

  await Promise.all(
    records.map(([uploadId, createdAt, badUrl]) => {
      const url = badUrl.replace('uploads2', 'uploads/2');
      const upload = {
        id: uploadId,
        url,
      };

      const videoId = uuidv4();

      const transcodeOptions = config.webhookHost
        ? { webhook: `${config.webhookHost}/webhooks/coconut` }
        : {};

      const video = {
        id: videoId,
        encoder_job_id: null,
        upload_id: uploadId,
        created_at: new Date(createdAt),
      };

      console.log(upload, video, transcodeOptions);
    })
  );
};

run();
