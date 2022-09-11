import fs from "fs";
import axios from "axios";

import User from "./User";
import { Problem } from "./Problem";
import { Submission } from "./Submission";
import Query from "./Query";

import questionQuery from "./query.json";
import questionCompany from '@app-lib/json/questionCompany.json';
import questionFrequency from "@app-lib/json/questionFrequency.json";
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
        console.log(error.response)
      }
    };
    type QF = keyof typeof questionFrequency;
    type QC = keyof typeof questionCompany;

    for (let key of Object.keys(allQuestionsData)) {
      let frequency = questionFrequency[key as QF];
      allQuestionsData[key].frequency = frequency as number;

      const companyTags: { [company: string]: number } = {};
      let arr: { company: string, frequency: number }[] = questionCompany[key as QC] as { company: string, frequency: number }[];
      if (arr !== undefined)
        arr.forEach(item => {
          companyTags[item.company] = item.frequency as number;
        })
      allQuestionsData[key].companyTags = companyTags;
      allQuestionsData[key].link = `https://leetcode.com/problems/${allQuestionsData[key].titleSlug}`;
    }

    console.log(JSON.stringify(allQuestionsData));
    fs.writeFileSync("./src/lib/json/allQuestions.json", JSON.stringify(allQuestionsData));
    fs.writeFileSync("./dist/lib/json/allQuestions.json", JSON.stringify(allQuestionsData));
  }
}