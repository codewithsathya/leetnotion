import mongoose, { Schema } from "mongoose";

interface Question {
  questionId: string,
  hints?: string[],
  solution?: {
    id: string,
    canSeeDetail: boolean,
    paidOnly: boolean,
    hasVideoSolution: boolean,
    paidOnlyVideo: boolean,
    content: string | null,
    rating: { id: string, count: number, average: string } | null,
  } | null,
  title?: string,
  titleSlug?: string,
  status?: string | null,
  difficulty?: string,
  isPaidOnly?: boolean,
  categoryTitle?: string,
  stats?: { totalAccepted: string, totalSubmission: string, totalAcceptedRaw: number, totalSubmissionRaw: number, acRate: string } | string,
  topicTags?: { name: string, slug: string }[];
  companyTags?: {
    [company: string]: number
  },
  frequency?: number,
  questionFrontendId?: string,
  likes?: number,
  dislikes?: number,
  isLiked?: number | null,
  article?: { id: number, url: string, topicId: number } | {} | string | null,
  content?: string | null,
  link?: string
}

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