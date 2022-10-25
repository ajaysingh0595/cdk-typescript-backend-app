import { DynamoDB } from "aws-sdk"
const TABLE_NAME: string = process.env?.TASK_TABLE_NAME || "Task"
import { CONST } from "./constant"
import { TaskTodo, TaskModel } from "./taskModel"
import { uuid } from "./utils"
export class Task {
  _dynamo: any
  constructor() {
    this._dynamo = new DynamoDB.DocumentClient()
  }
  async createTask(body: TaskTodo) {
    let RESPONSE = {
      is_error: false,
      statusCode: 200,
      msg: "Well Done! task has been created",
      data: {},
    }
    try {
      let row: TaskModel = {
        id: uuid(),
        dateCreated: Date.now(),
        taskStatus: CONST.STATUS.DRAFT,
        ...body,
      }
      const params: DynamoDB.DocumentClient.PutItemInput = {
        TableName: TABLE_NAME,
        Item: row,
      }
      await this._dynamo
        .put(params)
        .promise()
        .then((res: any) => console.log(res.Attributes))
        .catch((e: any) => {
          console.log("DB Error", e)
          throw Error("something went wrong please try again")
        })
    } catch (e: any) {
      console.error(e)
      RESPONSE.msg = e.message
      RESPONSE.is_error = true
      RESPONSE.statusCode = 400
    }
    return RESPONSE
  }
  async updateTask(body: TaskTodo, id: string) {
    let RESPONSE = {
      is_error: false,
      statusCode: 200,
      msg: "Well Done Task has been updated!",
      data: {},
    }
    try {
      let { data }: any = await this.getTaskById(id)

      if (!data?.id) {
        throw Error(`please provide valid task ID`)
      }

      await this._dynamo
        .update({
          TableName: TABLE_NAME,
          Key: {
            id: id,
          },
          UpdateExpression: `set title = :title, description= :description`,
          ExpressionAttributeValues: {
            ":title": body.title,
            ":description": body.description,
          },
        })
        .promise()
        .catch((e: any) => {
          console.log("DB Error", e)
          throw Error("something went wrong please try again")
        })
    } catch (e) {
      console.error(e)
      RESPONSE.is_error = true
      RESPONSE.statusCode = 400
    }
    return RESPONSE
  }
  async updateTaskStatus(id: string, action: string) {
    let RESPONSE = {
      is_error: false,
      statusCode: 200,
      msg: "Well Done Task has status has been updated!",
      data: {},
    }
    try {
      let actionAllow = [
        CONST.ACTION.ACCEPT,
        CONST.ACTION.CLOSE,
        CONST.ACTION.COMPLETE,
      ]
      let { data }: any = await this.getTaskById(id)
      if (!data?.id) {
        throw Error(`please provide valid task ID`)
      }
      // **check for valid action
      if (actionAllow.includes(action) === false) {
        throw Error(`${action}  action not allow`)
      }

      if (data?.taskStatus === CONST.STATUS.CLOSED) {
        throw Error(`Task already in close state`)
      }

      let status = CONST.STATUS.IN_PROGRESS
      if (CONST.ACTION.COMPLETE === action) {
        status = CONST.STATUS.COMPLETED
      } else if (CONST.ACTION.CLOSE === action) {
        status = CONST.STATUS.CLOSED
      }

      let nowDate = Date.now()
      let UpdateExpression = `set taskStatus = :taskStatus`
      let ExpressionAttributeValues: any = {
        ":taskStatus": status,
      }
      if (action === CONST.ACTION.COMPLETE) {
        UpdateExpression += `, dateCompleted = :dateCompleted`
        ExpressionAttributeValues = {
          ":dateCompleted": nowDate,
          ...ExpressionAttributeValues,
        }
      } else if (action === CONST.ACTION.CLOSE) {
        UpdateExpression += `, dateClosed = :dateClosed`
        ExpressionAttributeValues = {
          ":dateClosed": nowDate,
          ...ExpressionAttributeValues,
        }
      }
      await this._dynamo
        .update({
          TableName: TABLE_NAME,
          Key: {
            id: id,
          },
          UpdateExpression: UpdateExpression,
          ExpressionAttributeValues: ExpressionAttributeValues,
        })
        .promise()
        .catch((e: any) => {
          console.log("DB Error", e)
          throw Error("something went wrong please try again")
        })
    } catch (e: any) {
      console.error(e)
      RESPONSE.msg = e.message
      RESPONSE.is_error = true
      RESPONSE.statusCode = 400
    }
    return RESPONSE
  }
  async getAllTask() {
    let RESPONSE = {
      is_error: false,
      statusCode: 200,
      msg: "Ok",
      data: [],
    }
    try {
      RESPONSE.data = await this._dynamo
        .scan({
          TableName: TABLE_NAME,
        })
        .promise()
        .then((r: any) => {
          return r.Items
        })
        .catch((e: any) => {
          console.log("DB Error", e)
          throw Error("something went wrong please try again")
        })
    } catch (e: any) {
      console.error(e)
      RESPONSE.msg = e.message
      RESPONSE.is_error = true
      RESPONSE.statusCode = 400
    }
    return RESPONSE
  }
  async getMemberTask(memberId: any) {
    let RESPONSE = {
      is_error: false,
      statusCode: 200,
      msg: "Ok",
      data: [],
    }
    try {
      RESPONSE.data = await this._dynamo
        .scan({
          TableName: TABLE_NAME,
          FilterExpression: "contains(memberId, :memberId)",
          ExpressionAttributeValues: {
            ":memberId": memberId,
          },
        })
        .promise()
        .then((r: any) => {
          return r.Items
        })
        .catch((e: any) => {
          console.log("DB Error", e)
          throw Error("something went wrong please try again")
        })
    } catch (e: any) {
      console.error(e)
      RESPONSE.msg = e.message
      RESPONSE.is_error = true
      RESPONSE.statusCode = 400
    }
    return RESPONSE
  }
  async getTaskById(id: any) {
    let RESPONSE = {
      is_error: false,
      statusCode: 200,
      msg: "Ok",
      data: {},
    }
    try {
      const params: DynamoDB.DocumentClient.GetItemInput = {
        Key: {
          id: id,
        },
        TableName: TABLE_NAME,
      }
      RESPONSE.data = await this._dynamo
        .get(params)
        .promise()
        .then((data: any) => data.Item)
        .catch((e: any) => {
          console.log("DB Error", e)
          throw Error("something went wrong please try again")
        })
    } catch (e: any) {
      console.error(e)
      RESPONSE.msg = e.message
      RESPONSE.is_error = true
      RESPONSE.statusCode = 400
    }
    return RESPONSE
  }
  async deleteTaskById(id: string) {
    let RESPONSE = {
      is_error: false,
      statusCode: 200,
      msg: "Well Done! Task has been deleted",
      data: {},
    }
    try {
      const params: DynamoDB.DocumentClient.GetItemInput = {
        Key: {
          id: id,
        },
        TableName: TABLE_NAME,
      }

      RESPONSE.data = await this._dynamo
        .delete(params, () => {})
        .promise()
        .catch((e: any) => {
          console.log("DB Error", e)
          throw Error("something went wrong please try again")
        })
    } catch (e: any) {
      console.error(e)
      RESPONSE.msg = e.message
      RESPONSE.is_error = true
      RESPONSE.statusCode = 400
    }
    return RESPONSE
  }
  async assignTask(id: string, memberId: any) {
    let RESPONSE = {
      is_error: false,
      statusCode: 200,
      msg: "Well Done! Task has been assigned",
      data: {},
    }
    try {
      let dateAssigned = Date.now()
      await this._dynamo
        .update({
          TableName: TABLE_NAME,
          Key: {
            id: id,
          },
          UpdateExpression: `set memberId = :memberId, dateAssigned = :dateAssigned, taskStatus = :taskStatus`,
          ExpressionAttributeValues: {
            ":memberId": memberId,
            ":dateAssigned": dateAssigned,
            ":taskStatus": CONST.STATUS.ASSIGNED,
          },
        })
        .promise()
        .then((data: any) => console.log(data.Attributes))
        .catch((e: any) => {
          console.log("DB Error", e)
          throw Error("something went wrong please try again")
        })
    } catch (e: any) {
      console.error(e)
      RESPONSE.msg = e.message
      RESPONSE.is_error = true
      RESPONSE.statusCode = 400
    }
    return RESPONSE
  }
}
