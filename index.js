const express = require("express");
const app = express();
const { MongoClient } = require("mongodb");
const uri = process.env.uri;
const client = new MongoClient(uri);
const port = parseInt(process.env.PORT);

app.post("/__space/v0/actions", async (req, res) => {
    const event = req.body.event;

    if (event.id === "cleanup") {
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
    }
});

app.listen(port, () => {
    console.log(`Background Worker listening on port ${port}`);
});
