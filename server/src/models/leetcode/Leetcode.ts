import { LeetcodeUser } from "./LeetcodeUser";
import axios from "axios";
import Query from "./Query";

export default class Leetcode {
  private static readonly leetcode_api_endpoint = "https://leetcode.com/graphql"
  private static readonly leetcode_submission_api = "https://leetcode.com/submissions/latest/";

  static async getAllSubmissions(user: LeetcodeUser) {
  }
  
  static async getAcceptedProblems(user: LeetcodeUser){
    let config = {
      method: 'post',
      url: Leetcode.leetcode_api_endpoint,
      headers: {
        'Cookie': user.cookie,
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({
        "query": Query.problem,
        "variables": {
          "username": user.username,
          "limit": 2403,
          "categorySlug": "",
          "filters": {
          }
        }
      })
    };
    let { data } = await axios(config);
    return data;
  }

  static getSubmission(user: LeetcodeUser, questionId: string, lang: string) {
    return "";
  }
}