//imports
import "module-alias/register";

import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();

console.log(process.env.MONGO_URI);
import "./db/MongoConnection";
import Leetcode from './models/leetcode/Leetcode';
import LeetcodeUser from "./models/leetcode/User";


const app: Application = express();


app.get("/", (req: Request, res: Response) => {
  res.send("Hello world");
})

app.get("/test", async (req, res) => {
  let user = new LeetcodeUser(process.env.LEETCODE_COOKIE as string);
  let submissions = await Leetcode.getAllSubmissions(user);
  console.log(submissions);
  res.send(submissions);
})

app.get("/updateData", async (req, res) => {
  Leetcode.updateLeetcodeData();
  res.send("Updating started")
})

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`))