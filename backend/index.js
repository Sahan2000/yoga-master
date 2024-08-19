const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection 
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@yoga-master.2s32u.mongodb.net/?retryWrites=true&w=majority&appName=yoga-master`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();

    // Create a database and collections
    const db = client.db("yoga-master");
    const usersCollection = db.collection("users");
    const classesCollection = db.collection("classes");
    const cartCollection = db.collection("cart");
    const paymentCollection = db.collection("payment");
    const enrolledCollection = db.collection("enrolled");
    const appliedCollection = db.collection("applied");

    // Classes routes
    app.post('/new-class', async (req, res) => {
      const newClass = req.body;
      const result = await classesCollection.insertOne(newClass);
      res.send(result);
    });

    app.get('/classes', async (req, res) => {
      const query = { status: 'approved' };
      const classes = await classesCollection.find(query).toArray();
      res.send(classes);
    });

    // get classes by instructor email address
    app.get('/classes/:email', async (req, res)=>{
      const email = req.params.email;
      const query = { instructorEmail: email };
      const classes = await classesCollection.find(query).toArray();
      res.send(classes);
    });

    // manage classes
    app.get('/classes-manage', async (req,res)=>{
      const classes = await classesCollection.find().toArray();
      res.send(classes);
    }); 

    // update classes status and reason
    app.patch('/change-status/:id', async (req,res) => {
      const id = req.params.id;
      const status = req.body.status;
      const reason = req.body.reason;
      const filter = {_id: new ObjectId(id)};
      const option = { upsert: true };
      const updateDoc = { 
        $set: {
            status: status,
            reason: reason,
          }, 
      };
      const result = await classesCollection.updateOne(filter,updateDoc,option);
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (err) {
    console.error(err);
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello Developers 2024!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
