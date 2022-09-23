export type Question = {
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
  questionFrontendId: string,
  likes?: number,
  dislikes?: number,
  isLiked?: number | null,
  article?: { id: number, url: string, topicId: number } | {} | string | null,
  content?: string | null,
  link?: string
}