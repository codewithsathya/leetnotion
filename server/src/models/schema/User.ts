import mongoose, { Schema } from "mongoose";
interface User{
  name: string,
  image: string,
  email: string,
  googleId: string,
  submittedQuestions: string[],
  notionQuestionPageMapping: {
    [questionId: string]: string
  }
}

const userSchema = new Schema<User>({
  name: String,
  image: String,
  email: String,
  googleId: String,
  submittedQuestions: [String],
  notionQuestionPageMapping: {
    type: Map,
    of: String
  }
})

const User = mongoose.model("User", userSchema);
export default User;