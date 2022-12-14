import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { createAttachmentPresignedUrl } from '../../businessLogic/todos'
import { getTodoById, updateTodo } from '../../helpers/todosAcess'


const bucketName = process.env.ATTACHMENT_S3_BUCKET;

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    const todo = await  getTodoById(todoId);
    todo.attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${todoId}`
    

    await updateTodo(todo);
    const signedUrl =  await createAttachmentPresignedUrl(todoId);

    return {
      statusCode: 200,
      body: JSON.stringify({ uploadUrl: signedUrl })
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
