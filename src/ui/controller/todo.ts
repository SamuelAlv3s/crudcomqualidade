import { todoRepository } from "../repository/todo";

interface TodoControllerGetParams {
  page: number;
}
async function get({ page }: TodoControllerGetParams) {
  return todoRepository.get({
    page: page || 1,
    limit: 2,
  });
}

function filterTodosByContent<Todo>(search: string, todos: Array<Todo & { content: string }>): Todo[] {
  const homeTodos = todos.filter((todo) => {
    return todo.content.toLowerCase().includes(search.toLowerCase());
  });
  return homeTodos;
}

export const todoController = {
  get,
  filterTodosByContent,
};
