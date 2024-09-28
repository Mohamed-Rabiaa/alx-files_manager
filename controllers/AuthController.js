import sha1 from "sha1";
import { v4 as uuidv4 } from "uuid";
import dbClient from "../utils/db";
import redisClient from "../utils/redis";

class AuthController {
  static async getConnect(req, res) {
    const base64 = req.headers.authorization;
    if (base64) {
      const encoded = base64.split(" ")[1];
      const decoded = Buffer.from(encoded, "base64").toString("utf-8");
      const email = decoded.split(":")[0];
      const password = decoded.split(":")[1];
      const hashedPassword = sha1(password);
      const user = await dbClient.getObj("users", {
        email,
        password: hashedPassword,
      });
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const token = uuidv4();
      const key = `auth_${token}`;
      await redisClient.set(key, String(user._id), 24 * 60 * 60);
      return res.status(200).json({ token });
    }
    return res.status(401).json({ error: "Unauthorized" });
  }

  static async getDisconnect(req, res) {
    const token = req.headers["x-token"];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const key = `auth_${token}`;
    try {
      await redisClient.del(key);
      return res.status(204).json();
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

export default AuthController;
