import { Handler } from "aws-lambda"
import { Task } from "./taskService"
import { RESPONSE, AUTH_ERROR } from "./utils"
import * as Joi from "joi"
import { authValid } from "./jwt"
import { loginService } from "./loginService"
export const createTask: Handler = async (event, context) => {
  //Auth check
  if (authValid(event) === false) {
    return AUTH_ERROR()
  }
  //**parse body payload */
  let body = JSON.parse(event.body)
  let isValid = await validateTaskCreateUpdate(body)
  if (isValid.is_error) {
    return RESPONSE(400, isValid)
  }
  const task = new Task()
  let response = await task.createTask(body)
  return RESPONSE(response.statusCode, response)
}

export const updateTask: Handler = async (event, context) => {
  //Auth check
  if (authValid(event) === false) {
    return AUTH_ERROR()
  }
  let id = event.pathParameters?.taskId
  //**parse body payload */
  let body = JSON.parse(event.body)
  let isValid = await validateTaskCreateUpdate(body)
  if (isValid.is_error) {
    return RESPONSE(400, isValid)
  }

  const task = new Task()
  let response = await task.updateTask(body, id)
  return RESPONSE(response.statusCode, response)
}
export const getAllTask: Handler = async (event, context) => {
  //Auth check
  if (authValid(event) === false) {
    return AUTH_ERROR()
  }
  const task = new Task()
  let response = await task.getAllTask()
  return RESPONSE(response.statusCode, response)
}

export const getTask: Handler = async (event, context) => {
  //Auth check
  if (authValid(event) === false) {
    return AUTH_ERROR()
  }
  const task = new Task()
  let id = event.pathParameters?.taskId
  let response = await task.getTaskById(id)
  return RESPONSE(response.statusCode, response)
}

export const getMemberTask: Handler = async (event, context) => {
  //Auth check
  if (authValid(event) === false) {
    return AUTH_ERROR()
  }
  let memberId = event.pathParameters?.memberId
  const task = new Task()
  let response = await task.getMemberTask(memberId)
  return RESPONSE(response.statusCode, response)
}

export const deleteTask: Handler = async (event, context) => {
  //Auth check
  if (authValid(event) === false) {
    return AUTH_ERROR()
  }
  let id = event.pathParameters?.taskId
  const task = new Task()
  let response = await task.deleteTaskById(id)
  return RESPONSE(response.statusCode, response)
}

export const assignTask: Handler = async (event, context) => {
  //Auth check
  if (authValid(event) === false) {
    return AUTH_ERROR()
  }
  let id = event.pathParameters?.taskId
  let memberId = event.pathParameters?.memberId
  const task = new Task()
  let response = await task.assignTask(id, memberId)
  return RESPONSE(response.statusCode, response)
}

export const updateStatusTask: Handler = async (event, context) => {
  //Auth check
  if (authValid(event) === false) {
    return AUTH_ERROR()
  }
  let id = event.pathParameters?.taskId
  let action = event.pathParameters?.action
  const task = new Task()
  let response = await task.updateTaskStatus(id, action)
  return RESPONSE(response.statusCode, response)
}
export const login: Handler = async (event, context) => {
  //**parse body payload */
  let body = JSON.parse(event.body)
  let isValid = await validateLogin(body)
  if (isValid.is_error) {
    return RESPONSE(400, isValid)
  }

  let response = await loginService(body)
  return RESPONSE(response.statusCode, response)
}

const validateTaskCreateUpdate = async (input: object) => {
  const Error = {
    is_error: false,
    msg: "",
    data: {},
  }
  //**joi payload body validation */
  const schema = Joi.object().keys({
    title: Joi.string()
      .regex(/^[a-zA-Z0-9, ]*$/, "Alphanumerics, space and comma characters")
      .min(3)
      .max(30)
      .required(),
    description: Joi.string().required(),
  })
  try {
    const value = await schema.validateAsync(input)
    if (value?.error) {
      throw value?.error
    }
  } catch (err: any) {
    Error.is_error = true
    Error.msg = err?.message
    console.error(err)
  }

  return Error
}
const validateLogin = async (input: object) => {
  const Error = {
    is_error: false,
    msg: "",
    data: {},
  }
  //**joi payload body validation */
  const schema = Joi.object().keys({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().required(),
  })
  try {
    const value = await schema.validateAsync(input)
    if (value?.error) {
      throw value?.error
    }
  } catch (err: any) {
    Error.is_error = true
    Error.msg = err?.message
    console.error(err)
  }

  return Error
}
