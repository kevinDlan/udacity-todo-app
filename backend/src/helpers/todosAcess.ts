import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient} from 'aws-sdk/clients/dynamodb'
// import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { getUserId } from '../lambda/utils'
// import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

// const logger = createLogger('TodosAccess')
const todosTable = process.env.TODOS_TABLE
const docClient: DocumentClient = createDynamoDBClient()
const todoIndex = process.env.TODOS_CREATED_AT_INDEX
// TODO: Implement the dataLayer logic

  export const createTodo = async (todo: TodoItem): Promise<TodoItem>  => {
    await docClient.put({
      TableName: todosTable,
      Item: todo
    }).promise()

    return todo;
  }

  export const getAllTodosByUserId = async(userId:string):Promise<TodoItem[]> =>
  {
      const userTodos = await docClient
        .query({
          TableName: todosTable,
          // IndexName: userIdIndex,
          KeyConditionExpression: '#userId = :userId',
          ExpressionAttributeNames: {
            '#userId': 'userId'
          },
          ExpressionAttributeValues:{
            ':userId':userId
          }
        })
        .promise();
      const items = userTodos.Items;
      return items as TodoItem[];
  }

  export async function deleteUserTodo(
  event: APIGatewayProxyEvent): Promise<{}> {
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event);
  await docClient
    .delete({
      TableName: todosTable,
      Key: { userId:userId,todoId: todoId }
    }).promise()

  return {}
}

  export const getTodoById = async (todoId:string):Promise<TodoItem> =>
  {
     const todos = await docClient.query({
       TableName: todosTable,
       IndexName: todoIndex,
       KeyConditionExpression: 'todoId = :todoId',
       ExpressionAttributeValues: {
         ':todoId': todoId
       }
     }).promise();
     const items = todos.Items;

     if(items.length !== 0) return todos.Items[0] as TodoItem;
     return null
  } 


  export const updateTodo = async (todo: TodoItem): Promise<TodoItem> => 
  {
      const result = await docClient
        .update({
          TableName: todosTable,
          Key:{
            userId: todo.userId,
            todoId: todo.todoId
          },
          UpdateExpression:'set attachmentUrl = :attachmentUrl',
          ExpressionAttributeValues: {':attachmentUrl': todo.attachmentUrl}
        })
        .promise()
      return result.Attributes as TodoItem
  }



  function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
