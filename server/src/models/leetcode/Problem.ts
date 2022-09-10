export type Problem = {
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
  }
  title?: string,
  titleSlug?: string,
  status?: string | null,
  difficulty?: "Easy" | "Medium" | "Hard",
  isPaidOnly?: boolean,
  categoryTitle?: string,
  stats?: string | { totalAccepted: "string", totalSubmission: "string", totalAcceptedRaw: number, totalSubmissionRaw: number, acRate: string },
  topicTags?: { name: string, slug: string }[];
  questionFrontendId?: string,
  likes?: number,
  dislikes?: number,
  isLiked?: number,
  article?: { id: number, url: string, topicId: number } | null,
  content?: string | null,
  link?: string
}