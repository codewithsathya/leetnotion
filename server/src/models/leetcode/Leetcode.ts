import fs from "fs";
import axios from "axios";

import User from "./User";
import { Problem } from "./Problem";
import { Submission } from "./Submission";
import Query from "./Query";

import questionQuery from "./query.json";
import questionCompany from '@app-lib/json/questionCompany.json';
import questionFrequency from "@app-lib/json/questionFrequency.json";
import allQuestions from "@app-lib/json/allQuestions.json";
import slugIdMapping from "@app-lib/json/slugIdMapping.json";
import Question from "../schema/Question";

export default class Leetcode {
  private static readonly apiEndpoint = "https://leetcode.com/graphql"
  private static readonly submissionApi = "https://leetcode.com/api/submissions";

  static generateSlugIdMapping() {
    let slugIdMapping: {
      [titleSlug: string]: string
    } = {};
    for (let [key, value] of Object.entries(allQuestions)) {
      slugIdMapping[value.titleSlug] = key;
    }
    fs.writeFileSync("./src/lib/json/slugIdMapping.json", JSON.stringify(slugIdMapping));
  }

  static async getAllSubmissions(user: User): Promise<Submission[]> {
    let submissions: Submission[] = [];
    let offset = 0;
    let hasNext = true;
    let time = 0;
    while (hasNext) {
      let config = {
        method: 'get',
        url: `${Leetcode.submissionApi}?offset=${offset}`,
        headers: {
          "Cookie": user.cookie,
        }
      };
      try {
        const { data } = await axios(config);
        let currentSubmissions: Submission[] = data["submissions_dump"];
        currentSubmissions = currentSubmissions.filter(submission => submission.status_display === "Accepted");
        submissions = [...submissions, ...currentSubmissions];
        hasNext = data.has_next;
        offset += 20;
        console.log(offset);
      } catch (error: any) {
        time += 1000;
        await sleep(time);
        console.log(error.response.data);
      }
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
          'Cookie': `csrftoken=${process.env.DUMMY_CSRF}`
        },
        data: data
      };
      try {
        let response;
        try {
          let { data } = await axios(config);
          response = data;
        } catch (error) {

        }
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
    for (let [key, value] of Object.entries(allQuestionsData)) {
      allQuestionsData[key].stats = value.stats === null ? {} : JSON.parse(value.stats as string);
      allQuestionsData[key].article = value.article === null ? {} : JSON.parse(value.article as string)
    }
    type QF = keyof typeof questionFrequency;
    type QC = keyof typeof questionCompany;

    for (let key of Object.keys(allQuestionsData)) {
      let frequency = questionFrequency[key as QF];
      allQuestionsData[key].frequency = frequency === null ? 0 : frequency as number;

      const companyTags: { [company: string]: number } = {};
      let arr: { company: string, frequency: number }[] = questionCompany[key as QC] as { company: string, frequency: number }[];
      if (arr !== undefined)
        arr.forEach(item => {
          let companyName = item.company;
          companyName = companyName.replace(".", "_");
          companyTags[companyName] = item.frequency as number;
        })
      allQuestionsData[key].companyTags = companyTags;
      allQuestionsData[key].link = `https://leetcode.com/problems/${allQuestionsData[key].titleSlug}`;
    }

    let questions: Question[] = [];
    await Question.deleteMany();
    for (let value of Object.values(allQuestionsData)) {
      questions.push(value);
    }
    await Question.insertMany(questions);
    fs.writeFileSync("./src/lib/json/allQuestions.json", JSON.stringify(allQuestionsData));
    fs.writeFileSync("./dist/lib/json/allQuestions.json", JSON.stringify(allQuestionsData));
  }

  static async getSubmittedQuestions(user: User) {
    let data = JSON.stringify({
      "operationName": "allQuestionsStatuses",
      "variables": {},
      "query": `query allQuestionsStatuses { allQuestions: allQuestions { questionId status } }`
    });

    let config = {
      method: 'post',
      url: Leetcode.apiEndpoint,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': user.cookie
      },
      data: data
    };

    let { data: response }: { data: { data: { allQuestions: { questionId: string, status: 'ac' | null }[] } } } = await axios(config);
    let submittedQuestions: { questionId: string, status: "ac" | null }[] | string[] = response.data.allQuestions.filter(item => {
      return item.status === "ac";
    })
    submittedQuestions = submittedQuestions.map(item => item.questionId);
    return submittedQuestions;
  }

  static formatSubmittedQuestions(allSubmissions: Submission[]): { [questionId: string]: Submission[] } {
    let formattedQuestions: { [id: string]: Submission[] } = {};
    for (let submission of allSubmissions) {
      let slug = submission.title_slug;
      let slugIdMappingTemp: { [slug: string]: string } = slugIdMapping;
      let questionId = slugIdMappingTemp[slug];
      if (!formattedQuestions[questionId]) {
        formattedQuestions[questionId] = [];
      }
      formattedQuestions[questionId].push(submission);
    }
    return formattedQuestions;
  }

  static async getQuestionLists(user: User) {
    let data = JSON.stringify({
      "operationName": "favoritesList",
      "variables": {},
      "query": "query favoritesList{\nfavoritesLists{\nallFavorites{\nidHash\nname\nquestions{\nquestionId\n}\n}\n}\nuserStatus{\nusername\n}\n}\n"
    });

    let config = {
      method: 'post',
      url: 'https://leetcode.com/graphql',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': user.cookie
      },
      data: data
    };

    let { data: response } = await axios(config);
    let lists: {name: string, questions: { questionId: string }[]}[] = response.data.favoritesLists.allFavorites;
    let questionLists: {[questionId: string]: string[]} = {};
    for(let list of lists){
      let listName = list.name;
      for(let question of list.questions){
        let id = question.questionId;
        if(!questionLists[id]){
          questionLists[id] = [];
        }
        questionLists[id].push(listName);
      }
    }
    return questionLists;
  }
}

async function sleep(time: number) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, time);
  })
}