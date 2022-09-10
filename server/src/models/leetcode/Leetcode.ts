import User from "./User";
import Problem from "./Problem";
import { Submission } from "./Submission";
import axios from "axios";
import Query from "./Query";

export default class Leetcode {
  private static readonly apiEndpoint = "https://leetcode.com/graphql"
  private static readonly submissionApi = "https://leetcode.com/api/submissions";

  static async getAllSubmissions(user: User): Promise<Submission[]> {
    let submissions: Submission[] = [];
    let offset = 0;
    let hasNext = true;
    while(hasNext){
      let config = {
        method: 'get',
        url: `${Leetcode.submissionApi}?offset=${offset}`,
        headers: { 
          "Cookie": user.cookie
        }
      };
      const { data } = await axios(config);
      let currentSubmissions: Submission[] = data["submissions_dump"];
      currentSubmissions = currentSubmissions.filter(submission => submission.status_display === "Accepted");
      submissions = [...submissions, ...currentSubmissions];
      hasNext = data.has_next;
      offset += 20;
      console.log(offset);
    }
    return submissions;
  }
  
  static async getAcceptedProblems(user: User){
    let config = {
      method: 'post',
      url: Leetcode.apiEndpoint,
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
            "status": "AC"
          }
        }
      })
    };
    let { data: response } = await axios(config);
    return response.data["problemsetQuestionList"]["questions"];
  }

  static async updateLeetcodeData(){
    
  }
}