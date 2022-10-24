import { Handler } from "aws-lambda"
import { Task } from "./taskService"
import * as Joi from "joi"
export const createTask: Handler = async (event, context) => {
  let body = JSON.parse(event.body)
  let isValid = await validateTaskCreateUpdate(body)
  if (isValid.is_error) {
    return RESPONSE(400, isValid)
  }
  const task = new Task()
  let is_created = await task.createTask(body)
  return RESPONSE(is_created.statusCode, is_created)
}

export const updateTask: Handler = async (event, context) => {
  let id = event.pathParameters?.taskId
  let body = JSON.parse(event.body)
  let isValid = await validateTaskCreateUpdate(body)
  if (isValid.is_error) {
    return RESPONSE(400, isValid)
  }

  const task = new Task()
  let is_created = await task.updateTask(body, id)
  return RESPONSE(is_created.statusCode, is_created)
}
export const getAllTask: Handler = async (event, context) => {
  const task = new Task()
  let is_created = await task.getAllTask()
  return RESPONSE(is_created.statusCode, is_created)
}

export const getTask: Handler = async (event, context) => {
  const task = new Task()
  let id = event.pathParameters?.taskId
  let is_created = await task.getTaskById(id)
  return RESPONSE(is_created.statusCode, is_created)
}

export const getMemberTask: Handler = async (event, context) => {
  let memberId = event.pathParameters?.memberId
  const task = new Task()
  let is_created = await task.getMemberTask(memberId)
  return RESPONSE(is_created.statusCode, is_created)
}

export const deleteTask: Handler = async (event, context) => {
  let id = event.pathParameters?.taskId
  const task = new Task()
  let is_created = await task.deleteTaskById(id)
  return RESPONSE(is_created.statusCode, is_created)
}

export const assignTask: Handler = async (event, context) => {
  let id = event.pathParameters?.taskId
  let memberId = event.pathParameters?.memberId
  const task = new Task()
  let is_created = await task.assignTask(id, memberId)
  return RESPONSE(is_created.statusCode, is_created)
}

export const updateStatusTask: Handler = async (event, context) => {
  let id = event.pathParameters?.taskId
  let action = event.pathParameters?.action
  const task = new Task()
  let is_created = await task.updateTaskStatus(id, action)
  return RESPONSE(is_created.statusCode, is_created)
}

const RESPONSE = (status: Number, response: any) => {
  return {
    statusCode: status,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(response),
  }
}

const validateTaskCreateUpdate = async (input: object) => {
  const Error = {
    is_error: false,
    msg: "",
    data: {},
  }
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
