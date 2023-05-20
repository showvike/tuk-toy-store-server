const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send({ message: "Server is running." });
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.03pjgrw.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const tukToyStoreDB = client.db("tukToyStoreDB");
    const toysCollection = tukToyStoreDB.collection("toysCollection");

    app.get("/toys", async (req, res) => {
      const queries = req.query;
      const { sub_category, limit, name } = queries;

      let query = {};
      let lt = 20;
      let options = {};

      if (name) {
        query = { name };
      } else if (sub_category && limit) {
        query = { sub_category };
        lt = parseInt(limit);
        options = {
          projection: { picture_url: 1, name: 1, price: 1, rating: 1 },
        };
      }

      const cursor = toysCollection.find(query, options).limit(lt);
      const result = await cursor.toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});
