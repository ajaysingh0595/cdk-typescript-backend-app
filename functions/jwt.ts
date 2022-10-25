import * as jwt from "jsonwebtoken"
import { CONFIG } from "./config"
export const authToken = (data: Object) => {
  let token = jwt.sign(
    {
      data: data,
    },
    CONFIG.JWT_TOKEN_SECRET,
    { expiresIn: "5d" }
  )
  return { token }
}
export const verifyToken = (token: any) => {
  try {
    const decoded = jwt.verify(token, CONFIG.JWT_TOKEN_SECRET)
    return decoded
  } catch (err) {
    console.error(err)
    return false
  }
}
export const authValid = (event: any) => {
  console.log(event.headers, event)
  let token = event.headers["apiKey"]
  return verifyToken(token)
}
