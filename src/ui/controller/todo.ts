async function get() {
  const response = await fetch("/api/todos");
  const data = await response.json();
  return data.todos;
}

export const todoController = {
  get,
};
