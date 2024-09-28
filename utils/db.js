import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || '27017';
    const database = process.env.DB_DATABASE || 'files_manager';

    const url = `mongodb://${host}:${port}`;
    this.client = new MongoClient(url, { useUnifiedTopology: true });
    this.dbName = database;
    this.connect();
  }

  async connect() {
    try {
      await this.client.connect();
      this.db = this.client.db(this.dbName);
    } catch (error) {
      console.error('Could not connect to MongoDB:', error);
    }
  }

  isAlive() {
    return this.client && this.client.topology && this.client.topology.isConnected();
  }

  async nbUsers() {
    const users = this.db.collection('users');
    const usersNumber = await users.countDocuments({});
    return usersNumber;
  }

  async nbFiles() {
    const files = this.db.collection('files');
    const filesNumber = await files.countDocuments({});
    return filesNumber;
  }

  async getObj(collectionName, query) {
    const obj = await this.db.collection(collectionName).findOne(query);
    return obj;
  }

  async saveObj(collectionName, obj) {
    const result = await this.db.collection(collectionName).insertOne(obj);
    return result;
  }
}

const dbClient = new DBClient();
export default dbClient;
