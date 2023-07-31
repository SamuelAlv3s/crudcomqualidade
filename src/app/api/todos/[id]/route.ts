import { todoController } from "@server/controller/todo";

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  return todoController.deleteById(request, params.id);
}
