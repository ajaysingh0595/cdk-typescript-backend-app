import { authToken } from "./jwt"
export const loginService = async (body: any) => {
  let userList = [
    {
      id: 1,
      name: "ajay",
      username: "ajaysingh",
      password: "demotask",
      role_id: 1,
    },
  ]
  let RESPONSE = {
    is_error: false,
    statusCode: 200,
    msg: "Ok",
    data: {},
  }
  try {
    let user = userList.find((f) => {
      return f.username === body.username && f.password === body.password
    })

    if (!user) {
      throw new Error("Invalid username && password")
    }
    RESPONSE.data = authToken({ id: user.id, name: user.name })
  } catch (e: any) {
    console.error(e)
    RESPONSE.msg = e.message
    RESPONSE.is_error = true
    RESPONSE.statusCode = 400
  }
  return RESPONSE
}
