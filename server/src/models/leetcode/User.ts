import cookieUtil from "cookie";
import jwt, { JwtPayload } from "jsonwebtoken";

export default class User{
  readonly username: string;
  readonly csrftoken: string;
  readonly session: string;

  constructor(public cookie:string){
    let parsedCookie = cookieUtil.parse(cookie);
    this.csrftoken = parsedCookie.csrftoken;
    this.session = parsedCookie.LEETCODE_SESSION;

    let decoded = jwt.decode(this.session) as JwtPayload;
    this.username = decoded.username;
  }
}