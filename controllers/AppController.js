import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
  static getStatus(req, res) {
    if (redisClient.isAlive() && dbClient.isAlive()) {
      res.status(200).send({ redis: true, db: true });
    }
  }

  static async getStats(req, res) {
    const data = {};
    try {
      const [usersNumber, filesNumber] = await Promise.all([
        dbClient.nbUsers(),
        dbClient.nbFiles(),
      ]);
      data.users = usersNumber;
      data.files = filesNumber;
      return res.status(200).send(data);
    } catch (error) {
      return res.status(500).send({ error });
    }
  }
}

export default AppController;
