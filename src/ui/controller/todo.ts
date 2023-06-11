import { Todo } from "@ui/schema/todo";
import { todoRepository } from "../repository/todo";
import { z as schema } from "zod";

interface TodoControllerGetParams {
  page: number;
}

interface TodoControllerCreateParams {
  content: string;
  onSuccess: (todo: Todo) => void;
  onError: () => void;
}

interface TodoControllerToggleDoneParams {
  id: string;
  updateTodoOnScreen: () => void;
}

async function get(params: TodoControllerGetParams) {
  return todoRepository.get({
    page: params.page,
    limit: 2,
  });
}

function filterTodosByContent<Todo>(search: string, todos: Array<Todo & { content: string }>): Todo[] {
  const homeTodos = todos.filter((todo) => {
    return todo.content.toLowerCase().includes(search.toLowerCase());
  });
  return homeTodos;
}

function create({ content, onError, onSuccess }: TodoControllerCreateParams) {
  const parsedParams = schema.string().nonempty().safeParse(content);
  if (!parsedParams.success) {
    onError();
    return;
  }

  todoRepository.createByContent(parsedParams.data).then(onSuccess).catch(onError);
}

function toggleDone({ id, updateTodoOnScreen }: TodoControllerToggleDoneParams) {
  updateTodoOnScreen();
  todoRepository.toggleDone(id);
}

async function deleteById(id: string): Promise<void> {
  todoRepository.deleteById(id);
}

export const todoController = {
  get,
  filterTodosByContent,
  create,
  toggleDone,
  deleteById,
};
