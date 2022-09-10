//imports
import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import Leetcode from './models/leetcode/Leetcode';
import { LeetcodeUser } from "./models/leetcode/LeetcodeUser";

dotenv.config();
const app: Application = express();


app.get("/", (req: Request, res: Response) => {
  res.send("Hello world");
})

app.get("/test", async (req, res) => {
  let user: LeetcodeUser = new LeetcodeUser("csrftoken=ciJrlsPzxvGrdjAforq6g73PufKQAXRO1vAmvGx081SSQjD5Z6Y2Gz7DpnrdVcnR; LEETCODE_SESSION=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfYXV0aF91c2VyX2lkIjoiNDM0NTA3MiIsIl9hdXRoX3VzZXJfYmFja2VuZCI6ImFsbGF1dGguYWNjb3VudC5hdXRoX2JhY2tlbmRzLkF1dGhlbnRpY2F0aW9uQmFja2VuZCIsIl9hdXRoX3VzZXJfaGFzaCI6IjEwYzFlZWRlMTNmMjJlOTBjOWQwMWI2ZDI3MTQxM2I4MjQ1M2U4OWEiLCJpZCI6NDM0NTA3MiwiZW1haWwiOiJjb2Rld2l0aHNhdGh5YUBnbWFpbC5jb20iLCJ1c2VybmFtZSI6ImNvZGV3aXRoc2F0aHlhIiwidXNlcl9zbHVnIjoiY29kZXdpdGhzYXRoeWEiLCJhdmF0YXIiOiJodHRwczovL2Fzc2V0cy5sZWV0Y29kZS5jb20vdXNlcnMvY29kZXdpdGhzYXRoeWEvYXZhdGFyXzE2MjIxNzQ2NzkucG5nIiwicmVmcmVzaGVkX2F0IjoxNjYyNzI4MDE4LCJpcCI6IjE0LjEzOS4yMDQuMjEwIiwiaWRlbnRpdHkiOiIyY2NiOWY2MDViYjI4OGRhNjc3ZWUzMTNkYjM3OWI5NCIsInNlc3Npb25faWQiOjI0NTU1MjcwfQ.5eVjvffUATDiylksUuVq1KSqCB6Z26yvOESOmRaDBE0;");
  let submissions = await Leetcode.getAllSubmissions(user);
  console.log(submissions);
  res.send(submissions);
})

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`))