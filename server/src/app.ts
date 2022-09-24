//imports
import "module-alias/register";

import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();

console.log(process.env.MONGO_URI);
import "./db/MongoConnection";
import Leetcode from './models/leetcode/Leetcode';
import LeetcodeUser from "./models/leetcode/User";
import Notion from "./models/notion/Notion";
import NotionUser from "./models/notion/User";
import User from "./models/schema/User";
import allQuestions from "@app-lib/json/allQuestions.json";
import { Question } from "@app-root/types/leetcode";


const app: Application = express();
app.use(express.json());


app.get("/", async (req: Request, res: Response) => {
  let user = new LeetcodeUser(process.env.LEETCODE_COOKIE as string);
  console.log(user);
  let submittedQuestions = await Leetcode.getSubmittedQuestions(user);
  res.send(submittedQuestions);
})

app.get("/test", async (req, res) => {
  let user = new LeetcodeUser(process.env.LEETCODE_COOKIE as string);
  let submissions = await Leetcode.getAllSubmissions(user);
  let formattedSubmissions = Leetcode.formatSubmittedQuestions(submissions);

  res.send(formattedSubmissions);
})

app.get("/updateData", async (req, res) => {
  Leetcode.updateLeetcodeData();
  res.send("Updating started")
})

app.post("/register", async (req, res) => {
  const { name, image, email, googleId } = req.body;
  let user = await User.findOne({ email });
  if (!user) {
    let newUser: User = {
      name, image, email, googleId,
      submittedQuestions: [],
      notionQuestionPageMapping: {}
    }
    await User.create(newUser)
    user = await User.findOne({ email });
  }
  res.send(user);
})

app.post("/updateStatus", async (req, res, next) => {
  const { email, cookie } = req.body;
  let leetcodeUser: LeetcodeUser = new LeetcodeUser(cookie);
  let user = await User.findOne({ email });
  if (!user) {
    res.send("User not found");
    next();
    return;
  }
  let submittedQuestions = await Leetcode.getSubmittedQuestions(leetcodeUser);
  user.submittedQuestions = [...submittedQuestions];
  await user.save();
  res.send(user);
})


app.get("/addDatabase", async (req, res, next) => {
  let user = new NotionUser(process.env.NOTION_SECRET as string);
  let response = await Notion.createLeetcodeDatabase(user, process.env.NOTION_PAGE_ID);
  res.send(response);
})

app.get("/generateSlugIdMapping", (req, res) => {
  Leetcode.generateSlugIdMapping();
  res.send("generated");
})

app.get("/questionLists", async (req, res) => {
  let user = new LeetcodeUser(process.env.LEETCODE_COOKIE as string);
  let questionLists = await Leetcode.getQuestionLists(user);
  res.send(questionLists);
})

async function upload() {
  let notionUser = new NotionUser(process.env.NOTION_SECRET as string, process.env.NOTION_PAGE_ID);
  let leetcodeUser = new LeetcodeUser(process.env.LEETCODE_COOKIE as string);
  let createPageResponse = await Notion.createLeetcodeDatabase(notionUser);
  notionUser.databaseId = createPageResponse.id;
  let submissions = await Leetcode.getAllSubmissions(leetcodeUser);
  console.log("Submissions collected");
  let lists = await Leetcode.getQuestionLists(leetcodeUser);
  console.log("lists collected");
  let formattedSubmissions = Leetcode.formatSubmittedQuestions(submissions);
  let questions = Object.values(allQuestions);
  console.log("Uploading started");
  let response = await Notion.uploadSubmittedQuestions(notionUser, questions, lists, formattedSubmissions);
  return response;
}

async function uploadQuestions(){
  let notionUser = new NotionUser(process.env.NOTION_SECRET as string, process.env.NOTION_PAGE_ID);
  let createPageResponse = await Notion.createLeetcodeDatabase(notionUser);
  notionUser.databaseId = createPageResponse.id;
  let questions = Object.values(allQuestions);
  console.log("Uploading started");
  let response = await Notion.uploadQuestions(notionUser, questions);
  return response;
}

// app.get("/uploadSubmittedQuestions", async (req, res) => {
//   upload();
//   res.send("Uploading Started");
// })

app.post("/getPageId", async (req, res) => {
  let { email, questionId } = req.body;
  let pageId = await Notion.getPageId(email, questionId);
  res.send(pageId).status(200);
})

app.get("/uploadQuestions", async (req, res) => {
  uploadQuestions();
  res.send("Uploading Started");
});


const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`))