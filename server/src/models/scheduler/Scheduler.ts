import allQuestions from "@app-root/lib/json/allQuestions.json";
import { Problem } from "@app-models/leetcode/Problem";

console.log(allQuestions);

export default class Scheduler{
  constructor(public sortOption?: string, public lists?: string[]){

  }

  static sortQuestions(arr: Problem[]){
    let comparator = eval(`(a, b) => b.frequency - a.frequency`);
    arr.sort(comparator);
  }

  static setSchedule(){
  }
}