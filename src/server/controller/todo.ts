import { NextApiRequest, NextApiResponse } from "next";
import { z as schema } from "zod";
import { todoRepository } from "@server/repository/todo";

async function get(req: NextApiRequest, res: NextApiResponse) {
  const query = req.query;
  const page = Number(query.page);
  const limit = Number(query.limit);

  if (query.page && isNaN(page)) {
    res.status(400).json({
      error: {
        message: "`page` must be a number",
      },
    });
    return;
  }
  if (query.limit && isNaN(limit)) {
    res.status(400).json({
      error: {
        message: "`limit` must be a number",
      },
    });
    return;
  }

  const output = todoRepository.get({
    page,
    limit,
  });

  res.status(200).json({
    total: output.total,
    pages: output.pages,
    todos: output.todos,
  });
}

const TodoCreateBodySchema = schema.object({
  content: schema.string(),
});
async function create(request: NextApiRequest, response: NextApiResponse) {
  const body = TodoCreateBodySchema.safeParse(request.body);

  if (!body.success) {
    response.status(400).json({
      error: {
        message: "You need to provide a content to create a todo",
        description: body.error.issues,
      },
    });
    return;
  }
  const createdTodo = await todoRepository.createByContent(body.data.content);
  response.status(201).json({
    todo: createdTodo,
  });
}

async function toggleDone(request: NextApiRequest, response: NextApiResponse) {
  const todoId = request.query.id as string;

  if (!todoId || typeof todoId !== "string") {
    response.status(400).json({
      error: {
        message: "You need to provide a todo id",
      },
    });
  }
  try {
    const updatedTodo = await todoRepository.toggleDone(todoId);
    response.status(200).json({
      todo: updatedTodo,
    });
  } catch (error) {
    if (error instanceof Error) {
      response.status(404).json({
        error: {
          message: error.message,
        },
      });
    }
  }
}

export const todoController = {
  get,
  create,
  toggleDone,
};
