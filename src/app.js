const todoContainerElement = document.querySelector("#todo-container");
const todoNewElement = document.querySelector("#todo-new");
const todoEmptyElement = document.querySelector("#todo-empty");
const todoItemTemplate = document.querySelector("#todo-item");
const todoNewItemTemplate = document.querySelector("#todo-new-item");
const todoSettingsElement = document.querySelector("#todo-settings");
const todoSettingsActionElement = document.querySelector(
  "#todo-settings-action"
);
const todoHideCompleteAction = document.querySelector("#hide-complete-action");

todoHideCompleteAction.addEventListener("click", () => {
  if (todoHideCompleteAction.textContent === "circle") {
    todoHideCompleteAction.textContent = "check_circle";
    showComplete = true;
  } else {
    todoHideCompleteAction.textContent = "circle";
    showComplete = false;
  }

  renderTodos(todos);
});

todoSettingsActionElement.addEventListener("click", () => toggleSettings());
todoSettingsActionElement.addEventListener("keydown", (event) => {
  if (event.key === "enter") toggleSettings();
});

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
let showComplete = true;
renderTodos(todos);

function toggleSettings() {
  if (todoSettingsElement.classList.contains("hidden")) {
    todoContainerElement.classList.add("hidden");
    todoSettingsElement.classList.remove("hidden");
  } else {
    todoContainerElement.classList.remove("hidden");
    todoSettingsElement.classList.add("hidden");
  }
}

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

function renderTodos(todos) {
  todoContainerElement.innerHTML = "";
  if (todos) todos.forEach((todo) => addTodo(todo.text, todo.complete));
}

function addTodo(todo, complete) {
  if (!showComplete && complete) return;
  checkEmptyMessage();
  const todoItemElement = cloneTemplateShell(todoItemTemplate);
  const itemTextElement = todoItemElement.querySelector("#text");
  const itemTextInputElement = todoItemElement.querySelector("#text-input");
  const itemCompleteActionElement =
    todoItemElement.querySelector("#complete-action");
  const itemRemoveActionElement =
    todoItemElement.querySelector("#remove-action");
  const itemEditActionElement = todoItemElement.querySelector("#edit-action");

  itemTextInputElement.addEventListener("keydown", (event) => {
    if (event.key === "Enter") saveEdit();
  });

  itemEditActionElement.addEventListener("click", () => {
    if (itemEditActionElement.textContent === "check") {
      saveEdit();
    } else {
      itemTextInputElement.value = itemTextElement.textContent;
      itemTextInputElement.classList.remove("hidden");
      itemTextElement.classList.add("hidden");
      itemTextInputElement.focus();
      itemEditActionElement.textContent = "check";
    }
  });

  function saveEdit() {
    const index = todos.findIndex((t) => t.text === todo);
    if (index > -1) todos[index].text = itemTextInputElement.value;
    itemTextInputElement.value;
    itemTextElement.textContent = itemTextInputElement.value;
    itemTextInputElement.classList.add("hidden");
    itemTextElement.classList.remove("hidden");
    itemEditActionElement.textContent = "edit";
    saveTodos();
  }

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
    if (event.target.id === "text-input") return;
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
      if (!showComplete) todoContainerElement.removeChild(todoItemElement);
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
    source = todo2;
    target = todo1;
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
