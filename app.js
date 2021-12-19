const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const PORT = 8000;
const MONGO_URI = "mongodb://127.0.0.1:27017"
const route = require("./routes/route");

const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.on("error", console.error.bind(console, "MongoError: "));
mongoose.connection.once("open", () => console.log("Connected to Mongodb"));

app.use("/", route);

app.listen(PORT, () => console.log(`Server is at port ${PORT}`));
