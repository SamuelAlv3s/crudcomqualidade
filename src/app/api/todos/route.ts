import { todoController } from "@server/controller/todo";

export async function GET(request: Request) {
  return todoController.get(request);
}

export async function POST(request: Request) {
  return todoController.create(request);
}
