export default class Query {
  static readonly problem = `query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
    problemsetQuestionList: questionList(
      categorySlug: $categorySlug
      limit: $limit
      skip: $skip
      filters: $filters) {
      questions: data {
        acRate
        difficulty
        frontendQuestionId: questionFrontendId
        questionId
        paidOnly: isPaidOnly
        status
        title
        titleSlug
        topicTags {
          name
          id
          slug
        }
      }
    }
  }`;
  static readonly user = `query getUserProfile($username: String!) {
    matchedUser(username: $username) {
      submitStats: submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
        }
      }
    }
    allQuestionsCount {
      difficulty
      count
    }
  }`;
  static readonly submission = `query Submissions($offset: Int!, $limit: Int!, $lastKey: String, $questionSlug: String!) {
    submissionList(offset: $offset, limit: $limit, lastKey: $lastKey, questionSlug: $questionSlug) {
      submissions {
        id
        statusDisplay
        lang
        url
      }
    }
  }`;
}