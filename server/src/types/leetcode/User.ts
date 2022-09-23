export type User = {
  name: string,
  image: string,
  email: string,
  googleId: string,
  submittedQuestions: string[],
  notionQuestionPageMapping: {
    [questionId: string]: string
  }
}