describe("Todo Feed", () => {
  it("should render page", () => {
    cy.visit("http://localhost:3000");
  });

  it("when create a new todo, it must appears in the screen", () => {
    cy.intercept("POST", "http://localhost:3000/api/todos", (request) => {
      request.reply({
        statusCode: 201,
        body: {
          todo: {
            id: "b2815dfe-2c73-4f4d-80c2-92e1a2a360f0",
            date: "2023-06-11T22:44:21.104Z",
            content: "Teste Todo",
            done: false,
          },
        },
      });
    }).as("createTodo");
    cy.visit("http://localhost:3000");
    cy.get("input[name='new-todo']").type("Teste Todo");

    cy.get("button[aria-label='Adicionar novo item']").click();
    cy.contains("Teste Todo");
  });
});
