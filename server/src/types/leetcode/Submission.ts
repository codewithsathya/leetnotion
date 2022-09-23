export type Submission = {
  id: number,
  lang: string,
  time: string,
  timestamp: number,
  status_display: "Wrong Answer" | "Accepted",
  runtime: string,
  url: string,
  is_pending: string,
  title: string,
  memory: string,
  code: string,
  compare_result: string,
  title_slug: string
}