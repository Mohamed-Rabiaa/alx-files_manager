import dbClient from "./utils/db";

const waitConnection = () =>
  new Promise((resolve, reject) => {
    let i = 0;
    const repeatFct = async () => {
      setTimeout(async () => {
        i += 1;
        if (i >= 10) {
          reject(new Error("Failed to connect to DB after 10 attempts."));
        } else if (!dbClient.isAlive()) {
          repeatFct();
        } else {
          resolve();
        }
      }, 1000);
    };
    repeatFct();
  });

(async () => {
  try {
    console.log(dbClient.isAlive()); // Initial state
    await waitConnection(); // Wait until DB is connected
    console.log(dbClient.isAlive()); // After connection
    console.log(await dbClient.nbUsers());
    console.log(await dbClient.nbFiles());
  } catch (error) {
    console.error("Error:", error.message);
  }
})();
