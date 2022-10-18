import { getTodoById, updateTodo } from './../../helpers/todosAcess';
import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
    
    const todo = await getTodoById(todoId);
    const update = await updateTodo(todo);

    return {
      statusCode:201,
      body:JSON.stringify(update)
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
