import { todoController } from "@ui/controller/todo";
import { GlobalStyles } from "@ui/theme/GlobalStyles";
import { useEffect, useRef, useState } from "react";

interface HomeTodo {
  id: string;
  content: string;
  done: boolean;
}

const bg = "/bg.jpeg";

export default function Home() {
  const initialLoadComplete = useRef(false);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [todos, setTodos] = useState<Array<HomeTodo>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const homeTodos = todoController.filterTodosByContent<HomeTodo>(search, todos);
  const [newTodoContent, setNewTodoContent] = useState("");

  const hasMorePages = totalPages > page;
  const hasNoTodos = homeTodos.length === 0 && !isLoading;

  const fetchTodos = async (nextPage?: number) => {
    setIsLoading(true);
    const { todos, pages } = await todoController.get({ page: nextPage || page });
    if (nextPage) {
      setTodos((prevTodos) => [...prevTodos, ...todos]);
    } else {
      setTodos(todos);
    }
    setTotalPages(pages);
    setIsLoading(false);
    initialLoadComplete.current = true;
  };

  const handlerSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const newTodoHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewTodoContent(event.target.value);
  };

  const handlerToggle = (todo: HomeTodo) => {
    todoController.toggleDone({
      id: todo.id,
      updateTodoOnScreen() {
        setTodos((currentTodos) => {
          return currentTodos.map((currentTodo) => {
            if (currentTodo.id === todo.id) {
              return {
                ...currentTodo,
                done: !currentTodo.done,
              };
            }
            return currentTodo;
          });
        });
      },
    });
  };

  useEffect(() => {
    if (!initialLoadComplete.current) {
      fetchTodos();
    }
  }, [page]);

  return (
    <main>
      <GlobalStyles themeName="indigo" />
      <header
        style={{
          backgroundImage: `url('${bg}')`,
        }}
      >
        <div className="typewriter">
          <h1>O que fazer hoje?</h1>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            todoController.create({
              content: newTodoContent,
              onSuccess(todo: HomeTodo) {
                setTodos((oldTodos) => {
                  return [todo, ...oldTodos];
                });
                setNewTodoContent("");
              },
              onError() {
                alert("Você precisar informar o conteúdo da todo");
              },
            });
          }}
        >
          <input type="text" placeholder="Correr, Estudar..." value={newTodoContent} onChange={newTodoHandler} />
          <button type="submit" aria-label="Adicionar novo item">
            +
          </button>
        </form>
      </header>

      <section>
        <form>
          <input type="text" placeholder="Filtrar lista atual, ex: Dentista" onChange={handlerSearch} />
        </form>

        <table border={1}>
          <thead>
            <tr>
              <th align="left">
                <input type="checkbox" disabled />
              </th>
              <th align="left">Id</th>
              <th align="left">Conteúdo</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {homeTodos.map((todo) => (
              <tr key={todo.id}>
                <td>
                  <input type="checkbox" defaultChecked={todo.done} onChange={() => handlerToggle(todo)} />
                </td>
                <td>{todo.id.substring(0, 4)}</td>
                <td>
                  {!todo.done && todo.content}
                  {todo.done && <s>todo.content</s>}
                </td>
                <td align="right">
                  <button data-type="delete">Apagar</button>
                </td>
              </tr>
            ))}
            {isLoading && (
              <tr>
                <td colSpan={4} align="center" style={{ textAlign: "center" }}>
                  Carregando...
                </td>
              </tr>
            )}

            {hasNoTodos && (
              <tr>
                <td colSpan={4} align="center">
                  Nenhum item encontrado
                </td>
              </tr>
            )}

            {hasMorePages && (
              <tr>
                <td colSpan={4} align="center" style={{ textAlign: "center" }}>
                  <button
                    data-type="load-more"
                    onClick={() => {
                      const nextPage = page + 1;
                      setPage(nextPage);
                      fetchTodos(nextPage);
                    }}
                  >
                    Página {page}, Carregar mais{" "}
                    <span
                      style={{
                        display: "inline-block",
                        marginLeft: "4px",
                        fontSize: "1.2em",
                      }}
                    >
                      ↓
                    </span>
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
