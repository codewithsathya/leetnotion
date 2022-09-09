//imports
import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();
const app: Application = express();


app.get("/", (req: Request, res: Response) => {
  res.send("Hello world");
})

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`))