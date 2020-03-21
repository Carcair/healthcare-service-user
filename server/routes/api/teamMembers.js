const express = require('express');
const amqp = require('amqplib');
const mongodb = require('mongodb');

const router = express.Router();

// Connecting to RabbitMQ server and getting the message
loadRabbitConnection();

// Get members from MongoDB
router.get('/', async (req, res) => {
  const members = await loadMDBConnection();
  res.send(await members.find({}).toArray());
});

// Connecting to MongoDB
async function loadMDBConnection() {
  try {
    const client = await mongodb.MongoClient.connect(
      "mongodb+srv://root:rootpassword@cluster0-hwrkh.mongodb.net/test?retryWrites=true&w=majority",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    );
    return client.db('healthcare-service-user').collection('team-members');
  } catch (error) {
    throw error;
  }
}

// Connect to RabbitMQ
async function loadRabbitConnection() {
	try {
		const connection = await amqp.connect("amqp://localhost:5672");
		const channel = await connection.createChannel();
    const result = await channel.assertQueue("members");
    
    // Fetching array of objects of team members sent from admin
		await channel.consume("members", async results => {
      const input = await results.content.toString();
      const output = await JSON.parse(input);

      const members = await loadMDBConnection();
      
      await members.deleteMany({});
      await members.insertMany(output);

      console.log(output);
      await channel.ackAll(results);
		});
		
    console.log("Waiting for info.");
	} catch (err) {
    console.log(err);
    throw error;
  }
}

module.exports = router;