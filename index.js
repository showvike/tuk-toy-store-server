const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    /*await*/ client.connect();

    const tukToyStoreDB = client.db("tukToyStoreDB");
    const toysCollection = tukToyStoreDB.collection("toysCollection");

    // get api various get operations
    app.get("/toys", async (req, res) => {
      const queries = req.query;
      const { sub_category, limit, name, seller_email, price } = queries;

      let query = {};
      let lt = 20;
      let options = {};
      let sort = {};

      if (name) {
        query = { name };
      } else if (sub_category && limit) {
        query = { sub_category };
        lt = parseInt(limit);
        options = {
          projection: { picture_url: 1, name: 1, price: 1, rating: 1 },
        };
      } else if (seller_email) {
        query = { seller_email };
      }
      if (price) {
        sort = { price: parseInt(price) };
      }

      const cursor = toysCollection.find(query, options).limit(lt).sort(sort);
      const result = await cursor.toArray();
      res.send(result);
    });

    // get api for only one toy
    app.get("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.findOne(query);
      res.send(result);
    });

    // post api for adding a toy
    app.post("/add", async (req, res) => {
      const toy = req.body;
      const result = await toysCollection.insertOne(toy);
      res.send(result);
    });

    // patch api for updating a toy
    app.patch("/update/:id", async (req, res) => {
      const id = req.params.id;
      const toy = req.body;
      const { price, available_quantity, detail_description } = toy;
      const filter = { _id: new ObjectId(id) };
      const updatedToy = {
        $set: {
          price,
          available_quantity,
          detail_description,
        },
      };
      const result = await toysCollection.updateOne(filter, updatedToy);
      res.send(result);
    });

    // delete api for deleting a toy
    app.delete("/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.deleteOne(query);
      res.json(result);
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
