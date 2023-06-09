import { NextApiRequest, NextApiResponse } from "next";
import { read } from "../../../core/crud";

function get(_: NextApiRequest, res: NextApiResponse) {
  const allTodos = read();
  res.status(200).json({
    todos: allTodos,
  });
}
export const todoController = {
  get,
};
