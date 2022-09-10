import User from "./User";
import { Problem } from "./Problem";
import { Submission } from "./Submission";
import axios, { AxiosError } from "axios";
import Query from "./Query";
import questionQuery from "./query.json";
import fs from "fs";

export default class Leetcode {
  private static readonly apiEndpoint = "https://leetcode.com/graphql"
  private static readonly submissionApi = "https://leetcode.com/api/submissions";

  static async getAllSubmissions(user: User): Promise<Submission[]> {
    let submissions: Submission[] = [];
    let offset = 0;
    let hasNext = true;
    while (hasNext) {
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

  static async getAcceptedProblems(user: User) {
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

  static async updateLeetcodeData() {
    let allQuestionsData: { [questionId: string]: Problem } = {};


    
    
    
    
    for (let [key, value] of Object.entries(questionQuery.allQuestions)) {
      let data = JSON.stringify({
        "operationName": "allQuestionsStatuses",
        "variables": {},
        "query": `query allQuestionsStatuses { allQuestions: allQuestions { questionId ${value} } }`
      });
  
      let config = {
        method: 'post',
        url: Leetcode.apiEndpoint,
        headers: {
          'Content-Type': 'application/json',
          'Cookie': 'csrftoken=uAeMOdkIDmThcgaoGVeSg65zJlNBi4IXPuLE2MAfBjsMHMW3Pi0vqxpU6FG9l3cS'
        },
        data: data
      };
      try {
        let { data: response } = await axios(config)
        let questions: Problem[] = response.data.allQuestions;
        questions.forEach(question => {
          if (!allQuestionsData[question.questionId]) {
            allQuestionsData[question.questionId] = { questionId: question.questionId };
          }
          allQuestionsData[question.questionId] = { ...allQuestionsData[question.questionId], ...question }
        })
        console.log("Updated " + key);
      } catch (error: any) {
        console.log(error.response.data)
      }
    };
    console.log(JSON.stringify(allQuestionsData));
    fs.writeFileSync("./json/allQuestions.json", JSON.stringify(allQuestionsData));
  }
}