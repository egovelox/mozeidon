export class Response {
  private constructor(payload: unknown) {
    return { data: payload }
  }

  static data(payload: unknown) {
    return new Response(payload)
  }

  static end() {
    return new Response("end")
  }
}
