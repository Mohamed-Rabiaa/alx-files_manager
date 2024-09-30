import Queue from "bull";
import dbClient from "./utils/db";
import { ObjectId } from "mongodb";
import { writeFileSync } from "fs";
import { join } from "path";
import imgThumbnail from "image-thumbnail";

const fileQueue = new Queue("file queue");

fileQueue.process(async (job, done) => {
  try {
    const { fileId, userId } = job.data;

    if (!fileId) {
      throw new Error("Missing fileId");
    }
    if (!userId) {
      throw new Error("Missing userId");
    }

    const file = await dbClient.getObj("files", {
      _id: ObjectId(fileId),
      userId: ObjectId(userId),
    });

    if (!file) {
      throw new Error("File not found");
    }

    const sizes = [500, 250, 100];
    for (const size of sizes) {
      const thumbnail = await imgThumbnail(file.data, { width: size });
      const path = join(file.localPath, `_${size}.png`);
      writeFileSync(path, Buffer.from(thumbnail));
    }

    done();
  } catch (error) {
    done(error);
  }
});
