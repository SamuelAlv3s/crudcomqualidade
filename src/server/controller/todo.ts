import { z as schema } from "zod";
import { todoRepository } from "@server/repository/todo";
import { HttpNotFoundError } from "@server/infra/errors";

async function get(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = {
    page: searchParams.get("page"),
    limit: searchParams.get("limit"),
  };
  const page = Number(query.page);
  const limit = Number(query.limit);

  if (query.page && isNaN(page)) {
    return new Response(JSON.stringify({ error: "page must be a number" }), {
      status: 400,
    });
  }
  if (query.limit && isNaN(limit)) {
    return new Response(JSON.stringify({ error: "limit must be a number" }), {
      status: 400,
    });
  }

  try {
    const output = await todoRepository.get({
      page,
      limit,
    });

    return new Response(
      JSON.stringify({
        total: output.total,
        pages: output.pages,
        todos: output.todos,
      }),
      {
        status: 200,
      }
    );
  } catch (error) {
    if (error instanceof Error) {
      return new Response(
        JSON.stringify({
          error: {
            message: error.message,
          },
        }),
        {
          status: 500,
        }
      );
    }
  }
}

const TodoCreateBodySchema = schema.object({
  content: schema.string(),
});
async function create(request: Request) {
  const body = TodoCreateBodySchema.safeParse(await request.json());

  if (!body.success) {
    return new Response(
      JSON.stringify({
        error: {
          message: "You need to provide a content to create a todo",
          description: body.error.issues,
        },
      }),
      {
        status: 400,
      }
    );
  }
  const createdTodo = await todoRepository.createByContent(body.data.content);

  return new Response(JSON.stringify({ todo: createdTodo }), {
    status: 201,
  });
}

async function toggleDone(request: Request, id: string) {
  if (!id || typeof id !== "string") {
    return new Response(
      JSON.stringify({
        error: {
          message: "You need to provide a todo id",
        },
      }),
      {
        status: 400,
      }
    );
  }
  try {
    const updatedTodo = await todoRepository.toggleDone(id);

    return new Response(JSON.stringify({ todo: updatedTodo }), {
      status: 200,
    });
  } catch (error) {
    if (error instanceof Error) {
      return new Response(
        JSON.stringify({
          error: {
            message: error.message,
          },
        }),
        {
          status: 404,
        }
      );
    }
  }
}

async function deleteById(request: Request, id: string) {
  const query = {
    id,
  };
  const QuerySchema = schema.object({
    id: schema.string().uuid().nonempty(),
  });
  const parsedQuery = QuerySchema.safeParse(query);
  if (!parsedQuery.success) {
    return new Response(
      JSON.stringify({
        error: {
          message: "You need to provide a valid todo id",
        },
      }),
      {
        status: 400,
      }
    );
  }

  try {
    const todoId = parsedQuery.data.id;
    await todoRepository.deleteById(todoId);

    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    if (error instanceof HttpNotFoundError) {
      return new Response(
        JSON.stringify({
          error: {
            message: error.message,
          },
        }),
        {
          status: 404,
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: {
          message: "Internal server error",
        },
      }),
      {
        status: 500,
      }
    );
  }
}

export const todoController = {
  get,
  create,
  toggleDone,
  deleteById,
};
