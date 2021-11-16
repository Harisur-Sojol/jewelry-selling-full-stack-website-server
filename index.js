const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ptx5l.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();

    const database = client.db();
    const jewelryCollection = database.collection("jewelryCollection");
    const usersCollection = database.collection("users");
    const customer = database.collection("customer");
    const reviews = database.collection("reviews");
    
    // find data using id
    app.get("/jewelries/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const order = await jewelryCollection.findOne(query);
      res.send(order);
    });
    
    // get all data
    app.get("/jewelries", async (req, res) => {
      const cursor = jewelryCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });

    // show data based on email
    app.get("/placedOrder/:email", async (req, res) => {
      const myOrder = await customer
        .find({
          email: req.params.email,
        })
        .toArray();
      res.send(myOrder);
    });

    // user admin
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user?.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    // get admin using email
    app.get("/users/:email", async (req, res) => {
      let isAdmin = false;
      const user = await usersCollection.findOne({
        email: req.params.email,
      });
      if (user?.role == "admin") {
        isAdmin = true;
      }
      res.send({ admin: isAdmin });
    });

    // insert data one by one
    app.post("/jewelries", async (req, res) => {
      const cursor = req.body;
      const result = await jewelryCollection.insertOne(cursor);
      res.json(result);
    });

    //
    app.post("/placeOrder", async (req, res) => {
      const order = req.body;
      const result = await customer.insertOne(order);
      res.json(result);
    });

    // post all reviews
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const data = await reviews.insertOne(review);
      const result = data.toArray();
      res.json(result);
    });

    // get all reviews
    app.get("/reviews", async (req, res) => {
      const cursor = await reviews.find({});
      const result = await cursor.toArray();
      res.send(result);
    });

    //get all placed order item
    app.get("/placedOrder", async (req, res) => {
      const cursor = await customer.find({});
      const result = await cursor.toArray();
      res.send(result);
    });

    // delete order
    app.delete("/deleteOrder/:id", async (req, res) => {
      const id = req.params.id;
      const result = await customer.deleteOne({
        _id: ObjectId(id),
      });
      res.send(result);
    });

    // post users data
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });

    // get user data
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find({}).toArray();

      res.send(result);
    });

    // update user data
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    //Update Order status
    app.put("/updateOrder/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: "Shipped",
        },
      };
      const result = await customer.updateOne(filter, updateDoc);
      res.json(result);
    });

    // manage product delete 
    app.delete('/deleteProduct/:id',async (req,res) => {
      const id = req.params.id;
      console.log(id)
      const query = { _id: ObjectId(id) };
      const result = await jewelryCollection.deleteOne(query);
      console.log('delete fired...')
      res.json(result)
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("running jewellery store server");
});

app.listen(port, () => {
  console.log("running jewellery store", port);
});
