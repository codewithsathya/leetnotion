import mongoose, { Schema } from "mongoose";
import { Question } from "@app-root/types/leetcode/Question";

const questionSchema = new Schema<Question>({
  questionId: {
    type: String, required: true
  },
  hints: {
    type: [String]
  },
  solution: {
    id: String,
    canSeeDetail: Boolean,
    paidOnly: Boolean,
    hasVideoSolution: Boolean,
    paidOnlyVideo: Boolean,
    content: String,
    rating: {
      id: String,
      count: Number,
      average: String
    }
  },
  title: String,
  titleSlug: String,
  status: String,
  difficulty: String,
  isPaidOnly: Boolean,
  categoryTitle: String,
  stats: {
    totalAccepted: String,
    totalSubmission: String,
    totalAcceptedRaw: Number,
    totalSubmissionRaw: Number,
    acRate: String
  },
  topicTags: [
    {
      name: String,
      slug: String
    }
  ],
  companyTags: {
    type: Map,
    of: Number
  },
  frequency: Number,
  questionFrontendId: String,
  likes: Number,
  dislikes: Number,
  article: {
    type: {
      id: Number,
      url: String,
      topicId: Number,
    },
  },
  content: String,
  link: String
});

const Question = mongoose.model("Question", questionSchema);
export default Question;