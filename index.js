const { app } = require('deta');
const { MongoClient } = require("mongodb");
const uri = process.env.uri;
const client = new MongoClient(uri);

app.lib.cron(async event => {
    const deletes = [];

    try {
        const rooms = client.db("db").collection("rooms");


        rooms.find().forEach(room => {
            let ms = Date.now() - room.lastUpdate;

            if (ms > 20 * 60 * 1000) {
                deletes.push(room._id);
            }
        });

        rooms.deleteMany({
            _id: {
                $in: deletes
            }
        });

    } finally {
        console.log(`Deleted ${deletes.length} inactive rooms`);
    }
});

module.exports = app;