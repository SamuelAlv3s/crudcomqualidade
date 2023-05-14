interface TodoRepositoryGetParams {
  page: number;
  limit: number;
}
interface TodoRepositoryGetOutput {
  todos: Todo[];
  total: number;
  pages: number;
}

interface Todo {
  id: string;
  content: string;
  date: Date;
  done: boolean;
}

async function get({ page, limit }: TodoRepositoryGetParams): Promise<TodoRepositoryGetOutput> {
  const response = await fetch("/api/todos");
  const data = await response.json();
  const allTodos = parseTodoFromServer(data).todos;

  console.log("allTodos", allTodos);

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedTodos = allTodos.slice(startIndex, endIndex);
  return {
    todos: paginatedTodos,
    total: allTodos.length,
    pages: Math.ceil(allTodos.length / limit),
  };
}

function parseTodoFromServer(responseBody: unknown): { todos: Array<Todo> } {
  if (responseBody !== null && typeof responseBody === "object" && "todos" in responseBody && Array.isArray(responseBody.todos)) {
    return {
      todos: responseBody.todos.map((todo: unknown) => {
        if (todo === null && typeof todo !== "object") {
          throw new Error("Invalid todo from API");
        }
        const { id, content, date, done } = todo as { id: string; content: string; date: string; done: string };
        return {
          id,
          content,
          date: new Date(date),
          done: String(done).toLowerCase() === "true",
        };
      }),
    };
  }

  return {
    todos: [],
  };
}

export const todoRepository = {
  get,
};
