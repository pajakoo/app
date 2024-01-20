const Role = require('./models/Role');
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://georgievkn82:S2UNdFGTzPCVz9TE@cluster0.udwqatw.mongodb.net/ShoppingApp?retryWrites=true&w=majority&ssl=true";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


const dbName = process.env.DB_NAME;
const db = client.db(dbName);


async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");


        try {
            const roles = ['admin', 'user', 'hunter'];

            for (const roleName of roles) {
                const collection = db.collection('role');
                const existingRoleCount = await collection.find({}, { name: 1 }).toArray();

                if (existingRoleCount.length === 0) {
                    await Role.create({ name: roleName });
                } else {
                    console.log('rolr not created');
                }
            }
        } catch (error) {
            console.error('Error seeding roles:', error);
        } finally {
            await client.close();
        }


    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
run().catch(console.dir);
