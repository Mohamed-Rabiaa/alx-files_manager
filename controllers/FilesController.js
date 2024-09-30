import { ObjectId } from 'mongodb';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { promisify } from 'util';
import { writeFile, mkdir } from 'fs';
import { tmpdir } from 'os';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

const writeFileAsync = promisify(writeFile);
const mkDirAsync = promisify(mkdir);

class FilesController {
  static async postUpload(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    console.log({ userId });
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const user = await dbClient.getObj('users', { _id: ObjectId(userId) });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const name = req.body ? req.body.name : null;
    const type = req.body ? req.body.type : null;
    const parentId = req.body && req.body.parentId ? req.body.parentId : 0;
    const isPublic = req.body && req.body.isPublic ? req.body.isPublic : false;
    const data = req.body && (type === 'file' || type === 'image') && req.body.data
      ? req.body.data
      : null;

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    const validTypes = ['folder', 'file', 'image'];

    if (!type || !validTypes.includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }

    if (!data && type !== 'folder') {
      return res.status(400).json({ error: 'Missing data' });
    }

    if (parentId !== 0 && parentId !== '0') {
      const file = await dbClient.getObj('files', { parentId });
     /* if (!file) {
        return res.status(400).json({ error: 'Parent not found' });
      }
      if (file.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }*/
    }
    const newFile = {
      name,
      type,
	parentId: parentId === 0 || parentId === '0' ? 0 : ObjectId(parentId),
      isPublic,
      userId: ObjectId(userId),
    };

    const baseDir = `${process.env.FOLDER_PATH || ''}`.trim().length > 0
      ? process.env.FOLDER_PATH.trim()
      : join(tmpdir(), 'files_manager');

    await mkDirAsync(baseDir, { recursive: true });

    if (type !== 'folder') {
      const localPath = join(baseDir, uuidv4());
      await writeFileAsync(localPath, Buffer.from(data, 'base64'));
      newFile.localPath = localPath;
    }
    const result = await dbClient.saveObj('files', newFile);
    return res.status(201).json({
      id: result.insertedId.toString(),
      userId,
      name,
      type,
      isPublic,
	parentId: parentId === 0 || parentId === '0' ? 0 : parentId,
    });
  }

    static async getShow(req, res) {
	const token = req.headers['x-token'];
	if (!token) {
	    return res.status(401).json({ error: 'Unauthorized' });
	}
	const key = `auth_${token}`;
	const userId = await redisClient.get(key);
	if (!userId) {
	    return res.status(401).json({ error: 'Unauthorized' });
	}
	const user = await dbClient.getObj('users', { _id: ObjectId(userId) });
	if (!user) {
	    return res.status(401).json({ error: 'Unauthorized' });
	}
	const fileId = req.params.id;
	const file = await dbClient.getObj('files', { _id: fileId, userId: user._id });
	if (!file) {
	    return res.status(404).json({ error: 'Not found' });
	} else {
	    return res.status(200).json(file);
	}
    }

    static async getIndex(req, res) {
	const token = req.headers['x-token'];
	if (!token) {
	    return res.status(401).json({ error: 'Unauthorized' });
	}
	const key = `auth_${token}`;
	const userId = await redisClient.get(key);
	if (!userId) {
	    return res.status(401).json({ error: 'Unauthorized' });
	}
	const user = await dbClient.getObj('users', { _id: ObjectId(userId) });
	if (!user) {
	    return res.status(401).json({ error: 'Unauthorized' });
	}

	const parentId = req.query.paranetId ? req.query.paranetId : 0;
	const page = parseInt(req.query.page, 10) || 0;
	const limit = 20;
	const skip = page * limit;

	try {
	    const files = await dbClient.db.collection('files').aggregate([
		{ $match: { 
		    userId: ObjectId(userId),
		    parentId: parentId === 0 ? 0 : ObjectId(parentId),
		}
		},
		{ $skip: skip }, 
		{ $limit: limit }  
	    ]).toArray();

	    return res.status(200).json(files);
	} catch (err) {
	    console.error('Error fetching files:', err);
	    return res.status(500).json({ error: 'Server error' });
	}
    }	
}

export default FilesController;
