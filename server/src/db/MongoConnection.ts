import mongoose from "mongoose";

mongoose.connect(process.env.MONGO_URI as string);
let db = mongoose.connection;

db.on("open", () => {
  console.log("Mongodb Connected Successfully");
})

db.once("error", console.error.bind(console, "Connection error: "));