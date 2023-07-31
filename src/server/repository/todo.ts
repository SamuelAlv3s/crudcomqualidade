import { supabase } from "@server/infra/db/supabase";
import { Todo, TodoSchema } from "@server/schema/todo";

interface TodoRepositoryGetParams {
  page?: number;
  limit?: number;
}
interface TodoRepositoryGetOutput {
  todos: Todo[];
  total: number;
  pages: number;
}
async function get({ page, limit }: TodoRepositoryGetParams = {}): Promise<TodoRepositoryGetOutput> {
  const currentPage = page || 1;
  const currentLimit = limit || 10;
  const startIndex = (currentPage - 1) * currentLimit;
  const endIndex = currentPage * currentLimit;

  const { data, error, count } = await supabase()
    .from("todos")
    .select("*", {
      count: "exact",
    })
    .order("date", { ascending: false })
    .range(startIndex, endIndex - 1);

  if (error) {
    throw new Error(error.message);
  }

  const parsedData = TodoSchema.array().safeParse(data);

  if (!parsedData.success) {
    throw parsedData.error;
  }

  const todos = parsedData.data;
  const total = count || todos.length;
  const pages = Math.ceil(total / currentLimit);

  return {
    todos,
    total,
    pages,
  };
}

async function createByContent(content: string): Promise<Todo> {
  const { data, error } = await supabase().from("todos").insert([{ content }]).select().single();
  if (error) {
    throw new Error(error.message);
  }

  const parsedData = TodoSchema.safeParse(data);

  if (!parsedData.success) {
    throw parsedData.error;
  }

  const newTodo = parsedData.data;

  return newTodo;
}

async function toggleDone(id: string): Promise<Todo> {
  const { data, error } = await supabase().from("todos").select("*").eq("id", id).single();

  if (error) {
    throw new Error(error.message);
  }

  const parsedData = TodoSchema.safeParse(data);

  if (!parsedData.success) {
    throw parsedData.error;
  }

  const todo = parsedData.data;

  const { data: updatedData, error: updateError } = await supabase().from("todos").update({ done: !todo.done }).eq("id", id).select().single();

  if (updateError) {
    throw new Error(updateError.message);
  }

  const parsedUpdatedData = TodoSchema.safeParse(updatedData);

  if (!parsedUpdatedData.success) {
    throw parsedUpdatedData.error;
  }

  const updatedTodo = parsedUpdatedData.data;

  return updatedTodo;
}

async function deleteById(id: string): Promise<void> {
  const { error } = await supabase().from("todos").delete().match({ id });

  if (error) {
    throw new Error(error.message);
  }
}

export const todoRepository = {
  get,
  createByContent,
  toggleDone,
  deleteById,
};
