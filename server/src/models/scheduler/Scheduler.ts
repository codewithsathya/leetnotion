import allQuestions from "@app-root/lib/json/allQuestions.json";
import { Question } from "@app-root/types/leetcode";
console.log(allQuestions);

export default class Scheduler{
  constructor(public sortOption?: string, public lists?: string[]){

  }

  static sortQuestions(arr: Question[]){
    let comparator = eval(`(a, b) => b.frequency - a.frequency`);
    arr.sort(comparator);
  }

  static setSchedule(){
  }
}