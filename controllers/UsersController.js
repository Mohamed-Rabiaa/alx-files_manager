import sha1 from 'sha1';
import ObjectId from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class UsersController {
  static async postNew(req, res) {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    try {
      const existingUser = await dbClient.getObj('users', { email });
      if (existingUser) {
        return res.status(400).json({ error: 'Already exists' });
      }

      const hashedPassword = sha1(password);

      const result = await dbClient.saveObj('users', { email, password: hashedPassword });

      return res.status(201).json({ id: result.insertedId, email });
    } catch (err) {
      console.error(err.toString());
      return res.status(500).json({ error: 'Internal Server Error', details: err });
    }
  }

  static async getMe(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    console.log({ userId });
    const user = await dbClient.getObj('users', { _id: ObjectId(userId) });
    return res.status(200).json({ id: userId, email: user.email });
  }
}

export default UsersController;
