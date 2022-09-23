import axios from "axios";

import databaseStructure from "@app-lib/json/databaseStructure.json"
import NotionUser from "./User";
import User from "./../schema/User";
import { Question } from "@app-root/types/leetcode";

export default class Notion {
  constructor() { }

  static async createLeetcodeDatabase(user: NotionUser, pageId?: string) {
    pageId = pageId ?? user.pageId;
    databaseStructure.parent.page_id = pageId as string;
    let data = JSON.stringify(databaseStructure);

    let config = {
      method: 'post',
      url: 'https://api.notion.com/v1/databases/',
      headers: {
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
        'Authorization': `Bearer ${user.secret}`
      },
      data: data
    };

    try {
      let { data: response } = await axios(config);
      return response;
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  static getNotionMapping(notionUser: NotionUser, question: Question, lists: { [questionId: string]: string[] }, submissions: { [questionId: string]: { timestamp: number, lang: string, code: string, title_slug: string }[] }) {
    let children: { object: string; type: string; code: { rich_text: { type: string; text: { content: string; }; }[]; language: string; }; }[] = [], lastSubmitted = null, status: "Not started" | "Done" | "In progress" = "Not started";
    if (submissions[question.questionId]) {
      status = "Done";
      let allSubmissions = submissions[question.questionId];
      allSubmissions = allSubmissions.sort((a, b) => a.timestamp - b.timestamp);
      children = allSubmissions.map(submission => {
        let code = submission.code;
        let texts = [];
        let pointer = 0;
        if (code.length > 2000) {
          console.log("Size exceeded", question.title);
        }
        while (pointer < code.length) {
          texts.push({ type: "text", text: { content: code.substring(pointer, pointer + 2000) } });
          pointer += 2000;
        }
        return {
          object: "block",
          type: "code",
          code: {
            rich_text: texts,
            language: submission.lang
          }
        }
      })
      let time = allSubmissions[allSubmissions.length - 1].timestamp;
      let date = new Date(time * 1000);
      lastSubmitted = date.toISOString().split("T")[0];
    }

    let questionTags = question.topicTags?.map((tag) => {
      return { name: tag.name };
    })
    let companyTags = Object.keys(question.companyTags as {}).map(tag => {
      return { name: tag };
    })
    let listTags: { name: string; }[];
    if (lists[question.questionId]) {
      listTags = lists[question.questionId].map(tag => {
        return { name: tag };
      })
    } else {
      listTags = [];
    }
    let articleUrl: string | undefined;
    if (question.article) {
      let article = question.article as { url: string }
      if (article.url) {
        articleUrl = "https://leetcode.com" + article.url;
      } else {
        articleUrl = question.link;
      }
    } else {
      articleUrl = question.link;
    }

    let accuracy: string | undefined;
    let totalAccepted: number | undefined;
    let totalSubmitted: number | undefined;
    if (question.stats) {
      let stats = question.stats as { totalAcceptedRaw: number, totalSubmissionRaw: number, acRate: string };
      accuracy = stats.acRate;
      totalAccepted = stats.totalAcceptedRaw;
      totalSubmitted = stats.totalSubmissionRaw;
    }
    type Data = {
      parent: {
        type: "database_id",
        database_id?: string
      },
      properties: {
        Name: {
          title: [
            {
              text: {
                content?: string
              }
            }
          ]
        },
        Difficulty: {
          select: {
            name?: string
          }
        },
        Link: {
          url?: string
        },
        Status: {
          select: {
            name: "Done" | "Not started" | "In progress"
          }
        },
        "Question Tags": {
          multi_select?: { name: string }[]
        },
        "Lists": {
          multi_select?: { name: string }[]
        },
        "Company Tags": {
          multi_select?: { name: string }[]
        },
        "Java Solution": {
          url?: string
        },
        "Leetcode Solution": {
          url?: string
        },
        Accuracy: {
          rich_text: [
            {
              text: {
                content?: string
              }
            }
          ]
        },
        Frequency: {
          number?: number
        },
        "Question ID": {
          number?: number
        },
        "Total Accepted": {
          number?: number
        },
        "Total Submissions": {
          number?: number
        },
        Likes: {
          number?: number
        },
        Dislikes: {
          number?: number
        },
        "Last Submitted"?: {
          date: {
            start?: string
          }
        }
      },
      children?: { object: string; type: string; code: { rich_text: { type: string; text: { content: string; }; }[]; language: string; }; }[]
    }

    let data: Data = {
      parent: {
        type: "database_id",
        database_id: notionUser.databaseId
      },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: question.title
              }
            }
          ]
        },
        Difficulty: {
          select: {
            name: question.difficulty
          }
        },
        Link: {
          url: question.link
        },
        Status: {
          select: {
            name: status
          }
        },
        "Question Tags": {
          multi_select: questionTags
        },
        "Lists": {
          multi_select: listTags
        },
        "Company Tags": {
          multi_select: companyTags
        },
        "Java Solution": {
          url: `https://github.com/fishercoder1534/Leetcode/blob/master/src/main/java/com/fishercoder/solutions/_${question.questionId}.java`
        },
        "Leetcode Solution": {
          url: articleUrl
        },
        Accuracy: {
          rich_text: [
            {
              text: {
                content: accuracy
              }
            }
          ]
        },
        Frequency: {
          number: question.frequency
        },
        "Question ID": {
          number: parseInt(question.questionId)
        },
        "Total Accepted": {
          number: totalAccepted
        },
        "Total Submissions": {
          number: totalSubmitted
        },
        Likes: {
          number: question.likes
        },
        Dislikes: {
          number: question.dislikes
        },
      },
      children
    }
    if(lastSubmitted){
      data.properties["Last Submitted"] = {
        date: {
          start: lastSubmitted
        }
      }
    }
    return data;
  }

  static async uploadSubmittedQuestions(notionUser: NotionUser, questions: Question[], lists: { [questionId: string]: string[] }, submissions: { [questionId: string]: { timestamp: number, lang: string, code: string, title_slug: string }[] }) {
    let waitTime = 400;
    let responses = [];
    let count = 0;
    for (let question of questions) {
      let data = this.getNotionMapping(notionUser, question, lists, submissions);
      await sleep(waitTime);
      const options = {
        method: "POST",
        url: "https://api.notion.com/v1/pages",
        headers: {
          Accept: "application/json",
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
          Authorization: `Bearer ${notionUser.secret}`
        },
        data
      }
      try {
        let { data: response } = await axios.request(options);
        let pageId = response.id;
        await User.findOneAndUpdate({ email: process.env.EMAIL }, { $set: {[`notionQuestionPageMapping.${question.questionId}`]: pageId} });
        responses.push(response);
        console.log(count++);
      } catch (error) {
        console.log(error);
        return error;
      }
    }
    return responses;
  }

  static async getPageId(email: string, questionId: string){
    let user = await User.findOne({email});
    let map = user?.notionQuestionPageMapping;
    let parsed = JSON.stringify(map);
    let temp = JSON.parse(parsed);
    return temp[questionId]
  }
}

async function sleep(time: number) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, time);
  })
}