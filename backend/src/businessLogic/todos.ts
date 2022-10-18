import { TodoItem } from './../models/TodoItem';
import {
  APIGatewayProxyEvent,
} from 'aws-lambda'
import * as AWS from 'aws-sdk'
import { getUserId } from '../lambda/utils'
import * as uuid from 'uuid'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { createTodo, deleteUserTodo, getAllTodosByUserId } from '../helpers/todosAcess'
const AWSXRay = require('aws-xray-sdk');

const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({
  signatureVersion:'v4'
})



// const s3 = new AWS.S3({signatureVersion: 'v4'});

// const userIdIndex = process.env.USER_ID_INDEX
const bucketName = process.env.ATTACHMENT_S3_BUCKET
const expireTime: number = parseInt(process.env.SIGNED_URL_EXPIRATION)

export const creatTodo = async (
  data: CreateTodoRequest,
  event: APIGatewayProxyEvent
): Promise<TodoItem> => {
  const todoId = uuid.v4()
  const userId = getUserId(event);
  const newTodo = {
    todoId,
    userId,
    createdAt: new Date().toISOString(),
    done: false,
    attachmentUrl: '',
    ...data
  }

  const todo = await createTodo(newTodo);
  return todo;
}


export const getTodosForUser = async (event: APIGatewayProxyEvent) => {

  const userId = getUserId(event);
  const todos = await getAllTodosByUserId(userId);
  return  todos;
}




export const deleteTodo = async (event: APIGatewayProxyEvent) => 
{
  // const userId = getUserId(event)
  const response = await deleteUserTodo(event);
  return response;
}


export const createAttachmentPresignedUrl = async (todoId:string)=>
{
  return s3.getSignedUrl('putObject',{
    Bucket:bucketName,
    Key:todoId,
    Expires:expireTime
  });
}