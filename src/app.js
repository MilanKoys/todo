const todoContainerElement = document.querySelector("#todo-container");
const todoNewElement = document.querySelector("#todo-new");
const todoEmptyElement = document.querySelector("#todo-empty");
const todoItemTemplate = document.querySelector("#todo-item");
const todoNewItemTemplate = document.querySelector("#todo-new-item");

todoNewElement.addEventListener("click", () => newTodo());
todoNewElement.addEventListener("keydown", (event) => {
  if (event.key === "Enter") newTodo();
});

todoContainerElement.addEventListener("dragover", (event) => {
  event.preventDefault();
});

let todos = loadTodos() ?? [];
let creating = false;
let dragSource = null;
if (todos) todos.forEach((todo) => addTodo(todo.text, todo.complete));

function checkEmptyMessage(flag) {
  if (flag || todos.length) {
    todoEmptyElement.style.display = "none";
  } else {
    todoEmptyElement.style.display = "flex";
  }
}

function cloneTemplateShell(templateElement) {
  return templateElement.content.cloneNode(true).querySelector("#shell");
}

function newTodo() {
  if (creating) {
    todoContainerElement.removeChild(todoContainerElement.lastChild);
    todoNewElement.textContent = "add_circle";
    creating = false;
    return;
  }
  creating = true;
  todoNewElement.textContent = "cancel";
  checkEmptyMessage(true);
  const todoNewItemElement = cloneTemplateShell(todoNewItemTemplate);
  const itemTextElement = todoNewItemElement.querySelector("#text");
  const itemCompleteActionElement =
    todoNewItemElement.querySelector("#complete-action");

  itemTextElement.addEventListener("keydown", (event) => {
    if (event.key === "Enter") pushTodo();
  });
  itemCompleteActionElement.addEventListener("click", () => pushTodo());

  todoContainerElement.appendChild(todoNewItemElement);
  itemTextElement.focus();

  function pushTodo() {
    creating = false;
    todos.push({ text: itemTextElement.value, complete: false });
    addTodo(todos[todos.length - 1].text);
    todoNewElement.textContent = "add_circle";
    todoContainerElement.removeChild(todoNewItemElement);
    saveTodos();
  }
}

function addTodo(todo, complete) {
  checkEmptyMessage();
  const todoItemElement = cloneTemplateShell(todoItemTemplate);
  const itemTextElement = todoItemElement.querySelector("#text");
  const itemCompleteActionElement =
    todoItemElement.querySelector("#complete-action");
  const itemRemoveActionElement =
    todoItemElement.querySelector("#remove-action");

  itemRemoveActionElement.addEventListener("click", () => {
    todos.splice(
      todos.findIndex((t) => t.text === todo),
      1
    );
    todoContainerElement.removeChild(todoItemElement);
    saveTodos();
    checkEmptyMessage();
  });

  todoItemElement.addEventListener("keydown", (event) => {
    if (event.key === "Enter") toggleCompletion();
  });
  itemCompleteActionElement.addEventListener("click", () => toggleCompletion());
  dragability();

  itemTextElement.textContent = todo;
  todoContainerElement.appendChild(todoItemElement);

  if (complete) {
    itemCompleteActionElement.textContent = "check_circle";
    itemTextElement.classList.add("line-through");
    itemTextElement.classList.add("opacity-50");
    todos[todos.findIndex((t) => t.text === todo)].complete = true;
  }

  function toggleCompletion() {
    if (itemCompleteActionElement.textContent === "circle") {
      itemCompleteActionElement.textContent = "check_circle";
      itemTextElement.classList.add("line-through");
      itemTextElement.classList.add("opacity-50");
      todos[todos.findIndex((t) => t.text === todo)].complete = true;
    } else {
      itemCompleteActionElement.textContent = "circle";
      itemTextElement.classList.remove("line-through");
      itemTextElement.classList.remove("opacity-50");
      todos[todos.findIndex((t) => t.text === todo)].complete = false;
    }
    saveTodos();
  }

  function dragability() {
    todoItemElement.addEventListener("dragover", (event) =>
      event.preventDefault()
    );
    todoItemElement.addEventListener("dragstart", (event) => {
      event.stopPropagation();
      dragSource = event.target;
      event.target.classList.add("opacity-50");
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/html", event.target.innerHTML);
    });
    todoItemElement.addEventListener("dragend", (event) =>
      event.target.classList.remove("opacity-50")
    );
    todoItemElement.addEventListener("drop", (event) => {
      event.stopPropagation();
      let target = event.target;
      while (target.id !== "shell") target = target.parentNode;
      swapTodos(dragSource, target);

      return false;
    });
  }
}

function loadTodos() {
  return JSON.parse(localStorage.getItem("todos"));
}

function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function swapTodos(todo1, todo2) {
  const todoElements = [...todoContainerElement.children];
  const i1 = todoElements.findIndex((e) => e === todo1);
  const i2 = todoElements.findIndex((e) => e === todo2);
  let index1, index2, source, target;
  if (i1 > i2) {
    index2 = i1;
    index1 = i2;
    target = todo1;
    source = todo2;
  } else {
    index2 = i2;
    index1 = i1;
    source = todo1;
    target = todo2;
  }

  if (index2 + 1 > todoElements.length) {
    todoContainerElement.appendChild(source);
  } else {
    todoContainerElement.insertBefore(
      source,
      todoContainerElement.children[index2 + 1]
    );
  }

  const storedTodo = todos[index1 - 1];
  todos[index1 - 1] = todos[index2 - 1];
  todos[index2 - 1] = storedTodo;
  saveTodos();

  todoContainerElement.insertBefore(
    target,
    todoContainerElement.children[index1]
  );
}
