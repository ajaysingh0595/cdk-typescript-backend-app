import { Construct } from "constructs"
import { Stack, StackProps, CfnOutput } from "aws-cdk-lib"
import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb"
import { Runtime, FunctionUrlAuthType } from "aws-cdk-lib/aws-lambda"
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs"
import * as path from "path"
import * as apigw from "aws-cdk-lib/aws-apigateway"
import { CONFIG } from "../functions/config"
export class CdkTypescriptStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    //Dynamodb table definition
    const table = new Table(this, "Task", {
      partitionKey: { name: "id", type: AttributeType.STRING },
    })

    //Task Handler
    let taskFunction = {
      runtime: Runtime.NODEJS_14_X,
      entry: path.join(__dirname, `/../functions/taskFunction.ts`),
      environment: {
        TASK_TABLE_NAME: table.tableName,
        JWT_TOKEN_SECRET: CONFIG.JWT_TOKEN_SECRET,
      },
    }
    //*** */ Lambda function handler ***
    const login = new NodejsFunction(this, "LoginHandler", {
      ...taskFunction,
      handler: "login",
    })

    const createTask = new NodejsFunction(this, "TaskCreateHandler", {
      ...taskFunction,
      handler: "createTask",
    })
    const getAllTask = new NodejsFunction(this, "GetAllTaskHandler", {
      handler: "getAllTask",
      ...taskFunction,
    })
    const getTask = new NodejsFunction(this, "getTaskHandler", {
      handler: "getTask",
      ...taskFunction,
    })
    const getMemberTask = new NodejsFunction(this, "getMemberTaskHandler", {
      handler: "getMemberTask",
      ...taskFunction,
    })
    const updateTask = new NodejsFunction(this, "TaskUpdateHandler", {
      handler: "updateTask",
      ...taskFunction,
    })
    const updateStatusTask = new NodejsFunction(
      this,
      "UpdateStatusTaskHandler",
      {
        handler: "updateStatusTask",
        ...taskFunction,
      }
    )
    const deleteTask = new NodejsFunction(this, "DeleteTaskHandler", {
      handler: "deleteTask",
      ...taskFunction,
    })
    const assignTask = new NodejsFunction(this, "AssignTaskHandler", {
      handler: "assignTask",
      ...taskFunction,
    })

    // permissions to lambda to dynamo table
    table.grantReadData(getAllTask)
    table.grantReadData(getMemberTask)
    table.grantReadData(getTask)
    table.grantReadWriteData(createTask)
    table.grantReadWriteData(updateTask)
    table.grantReadWriteData(deleteTask)
    table.grantReadWriteData(updateStatusTask)
    table.grantReadWriteData(assignTask)

    // only for lambda function ENDPOINT
    // const myFunctionUrl = createTask.addFunctionUrl({
    //   authType: FunctionUrlAuthType.NONE,
    //   cors: {
    //     allowedOrigins: ["*"],
    //   },
    // })
    ///***** */ API gtw route add here************

    const api = new apigw.RestApi(this, "task-api")
    api.root
      .resourceForPath("login")
      .addMethod("POST", new apigw.LambdaIntegration(login))

    let root = api.root.resourceForPath("task")
    root.addMethod("GET", new apigw.LambdaIntegration(getAllTask))
    root
      .resourceForPath("{taskId}")
      .addMethod("GET", new apigw.LambdaIntegration(getTask))

    root
      .resourceForPath("member")
      .resourceForPath("{memberId}")
      .addMethod("GET", new apigw.LambdaIntegration(getMemberTask))

    root.addMethod("POST", new apigw.LambdaIntegration(createTask))
    root
      .resourceForPath("{taskId}")
      .addMethod("PUT", new apigw.LambdaIntegration(updateTask))

    root
      .resourceForPath("{taskId}")
      .resourceForPath("{action}")
      .addMethod("PUT", new apigw.LambdaIntegration(updateStatusTask))

    root
      .resourceForPath("{taskId}")
      .addMethod("DELETE", new apigw.LambdaIntegration(deleteTask))

    root
      .resourceForPath("{taskId}")
      .resourceForPath("assign")
      .resourceForPath("{memberId}")
      .addMethod("PUT", new apigw.LambdaIntegration(assignTask))

    new CfnOutput(this, "HTTP API URL", {
      value: api.url ?? "Something went wrong with the deploy",
    })
    // Lambda public url
    // new CfnOutput(this, "FunctionUrl", {
    //   value: myFunctionUrl.url,
    // })
  }
}
