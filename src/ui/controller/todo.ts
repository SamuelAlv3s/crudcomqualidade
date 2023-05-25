import { todoRepository } from "../repository/todo";

interface TodoControllerGetParams {
  page: number;
}
async function get({ page }: TodoControllerGetParams) {
  console.log("get UI");
  return todoRepository.get({
    page: page || 1,
    limit: 2,
  });
}

export const todoController = {
  get,
};
