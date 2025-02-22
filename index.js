require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;

app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://task-management-auth-bc9fc.web.app'
    ],
    credentials: true
}));

app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0nnvi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const userCollection = client.db("Task-Manager-DB").collection("Users");
    const taskCollection = client.db("Task-Manager-DB").collection("Tasks");

    app.post("/tasks", async (req, res) => {
        const task = req.body;
        task.timestamp = new Date();
        const result = await taskCollection.insertOne(task);
        res.send(result);
    });

    app.get("/tasks", async (req, res) => {
        const email = req.query.email;
        if (!email) {
          return res.status(400).send({ message: "Email is required" });
        }
      
        try {
          const tasks = await taskCollection.find({ email }).toArray();
          res.send(tasks);
        } catch (error) {
          res.status(500).send({ message: "Failed to fetch tasks", error });
        }
      });
      

    app.put("/tasks/:id", async (req, res) => {
        const { id } = req.params;
        const updatedTask = req.body;
        const filter = { _id: new ObjectId(id) };
        const updateDoc = { $set: updatedTask };
        const result = await taskCollection.updateOne(filter, updateDoc);
        res.send(result);
    });

    app.delete("/tasks/:id", async (req, res) => {
        const { id } = req.params;
        const result = await taskCollection.deleteOne({ _id: new ObjectId(id) });
        res.send(result);
    });

    app.post("/users", async (req, res) => {
        const user = req.body;
        const query = { email: user.email };
        const existingUser = await userCollection.findOne(query);
        if (existingUser) {
            return res.send({ message: "user already exists", insertedId: null });
        }
        const result = await userCollection.insertOne(user);
        res.send(result);
    });

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})