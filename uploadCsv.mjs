import fs from 'fs';
import parse from 'csv-parse/lib/sync';
import uuidv4 from 'uuid/v4';
import axios from 'axios';
import mysql from 'promise-mysql';
import { transcodeVideo } from './server/lib/coconutAdapter.mjs';
import config from './config/server.js';
import createMysqlAdapter from './server/lib/mysqlAdapter.mjs';

const run = async () => {
  const connection = await mysql.createPool({ ...config.mysql, connectionLimit: 10 });
  const mysqlAdapter = createMysqlAdapter(connection);

  const fileUrl = process.argv[2];

  const { data: input } = await axios.get(fileUrl);

  const records = parse(input);

  await Promise.all(
    records.map(async ([uploadId, createdAt, url]) => {
      const upload = {
        id: uploadId,
        url,
      };

      await mysqlAdapter.createUpload(upload);

      const videoId = uuidv4();

      const transcodeOptions = config.webhookHost
        ? { webhook: `${config.webhookHost}/webhooks/coconut` }
        : {};

      const encoderJobId = await transcodeVideo(videoId, url, transcodeOptions);

      const video = {
        id: videoId,
        encoder_job_id: encoderJobId,
        upload_id: uploadId,
        created_at: new Date(createdAt),
      };

      await mysqlAdapter.createVideo(video);

      console.log('created video', videoId, 'with encoder job id', encoderJobId);
    })
  );
};

run();
