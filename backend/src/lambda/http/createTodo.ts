// import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { creatTodo } from '../../businessLogic/todos'
// import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
// import { createTodo } from '../../businessLogic/todos'

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<any> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  // TODO: Implement creating a new TODO item
  const todo = await creatTodo(newTodo, event)
  return {
    statusCode: 201,
    body:JSON.stringify({item:todo})
  }
})

handler.use(
  cors({
    credentials: true
  })
)
