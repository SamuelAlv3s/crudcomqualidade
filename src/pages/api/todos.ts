import { todoController } from "@/server/controller/todo";
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(request: NextApiRequest, response: NextApiResponse) {
  if (request.method === "GET") {
    todoController.get(request, response);
    return;
  }

  response.status(405).json({
    message: "Method not allowed",
  });
}
