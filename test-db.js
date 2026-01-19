import { MongoClient } from "mongodb";

const uri = "mongodb://localhost:27017/astrodb";
const client = new MongoClient(uri);

async function testConnection() {
  try {
    await client.connect();
    const db = client.db(); // or db("your-db-name")
    const collections = await db.listCollections().toArray();
    for (const coll of collections) {
      console.log("Collection:", coll.name);
    }
    console.log("Collections:", collections);

    // Example: fetch documents from a collection
    // const docs = await db.collection("yourCollection").find({}).limit(5).toArray();
    // console.log("Sample docs:", docs);
  } catch (err) {
    console.error("Connection error:", err);
  } finally {
    await client.close();
  }
}

testConnection();