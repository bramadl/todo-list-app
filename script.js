class TodoList {
  domEl = {
    app: null,
    container: null,
    form: null,
    header: null,
  };

  items = [];

  markAllComplete = true;

  selectors = {
    anemic: undefined,
    checker: undefined,
    checkAllButton: undefined,
    remover: undefined,
    removeAllButton: undefined,
    formFields: undefined,
  };

  constructor(selector, { selectors }) {
    this.domEl.app = document.querySelector(selector);

    const { app } = this.domEl;
    this.domEl.container = app.querySelector(".todo-list--container");
    this.domEl.form = app.querySelector(".todo-list--form");
    this.domEl.header = app.querySelector(".todo-list--header");

    this.selectors = selectors;

    this.attachMarkAllEvent();
    this.attachRemoveAllEvent();
    this.attachSubmitEvent();
    this.render();
  }

  get itemsCount() {
    return this.items.length;
  }

  get markAllButton() {
    return this.domEl.form.querySelector(this.selectors.checkAllButton);
  }

  get removeAllButton() {
    return this.domEl.form.querySelector(this.selectors.removeAllButton);
  }

  addItem(title, message) {
    const id = SomeUtils.generateIDFromList(this.items);
    const item = new TodoListItem(id, title, message, false, new Date());

    this.items.push(item);
    this.resetFormFields();
    this.render();
  }

  attachMarkAllEvent() {
    this.markAllButton.addEventListener("click", (event) => {
      event.preventDefault();
      this.markAllItem();
    });
  }

  attachMarkEvent(element) {
    const parentElement = element.parentElement.parentElement;
    element.addEventListener("change", (event) => {
      const todoItemId = +parentElement.dataset.id;
      this.markItem(todoItemId, event.target.checked);
    });
  }

  attachRemoveAllEvent() {
    this.removeAllButton.addEventListener("click", (event) => {
      event.preventDefault();
      this.deleteAllItem();
    });
  }

  attachRemoveEvent(element) {
    const parentElement = element.parentElement.parentElement.parentElement;
    element.addEventListener("click", (event) => {
      const todoItemId = +parentElement.dataset.id;
      this.deleteItem(todoItemId);
    });
  }

  attachSubmitEvent() {
    this.domEl.form.addEventListener("submit", (event) => {
      event.preventDefault();

      const validated = this.validateFormFields();
      if (!validated) return alert("Enter the task name and description!");

      const [title, message] = validated;
      this.addItem(title, message);
    });
  }

  deleteAllItem() {
    this.items = [];
    this.render();
  }

  deleteItem(id) {
    this.items = this.items.filter((item) => item.id !== id);
    this.render();
  }

  determineMarkAllCompleteValue() {
    const allTaskAreCompleted = this.items.every(
      (item) => item.isCompleted === true
    );

    if (allTaskAreCompleted) this.notifyWorker();
    this.markAllComplete = allTaskAreCompleted ? false : true;
  }

  markAllItem() {
    this.items.forEach((item) => {
      item.isCompleted = this.markAllComplete;
    });

    this.markAllComplete = !this.markAllComplete;

    this.render();
  }

  markItem(id, markOrUnmark) {
    const todoItem = this.items.find((item) => item.id === id);

    if (markOrUnmark === true) todoItem.markComplete();
    else todoItem.markIncomplete();

    this.determineMarkAllCompleteValue();
    this.render();
  }

  notifyWorker() {
    alert("Great job! You have completed all of your tasks.");
  }

  render() {
    this.renderMarkButtonText();
    this.renderTaskCount();
    this.renderTaskList();
  }

  renderMarkButtonText() {
    this.markAllButton.textContent = this.markAllComplete
      ? "Check all"
      : "Uncheck all";
  }

  renderTaskCount() {
    const anemicEl = this.domEl.header.querySelector(this.selectors.anemic);
    anemicEl.textContent = this.items.filter(item => item.isCompleted === false).length;
  }

  renderTaskList() {
    const { container } = this.domEl;
    container.innerHTML = "";

    if (this.itemsCount === 0) {
      const emptyListElement = `
        <li class="todo-list--item-empty">
          There are no items currently.
        </li>
      `;

      container.insertAdjacentHTML("beforeend", emptyListElement);
    } else {
      this.items.forEach((item) => {
        const listItemElement = `
          <li class="todo-list--item" data-id="${item.id}">
            <div class="todo-list--checker">
              <input
                class="todo-list--checker-input"
                ${item.isCompleted ? "checked" : ""}
                type="checkbox"
              />
            </div>
            <div class="todo-list--content">
              <div class="todo-list--content-header">
                <div>
                  <h2 class="todo-list--content-title ${
                    item.isCompleted ? "todo-list--completed" : ""
                  }">
                    ${item.title}
                  </h2>
                  <p class="todo-list--content-message">
                    ${item.message}
                  </p>
                </div>
                <i class="bx bx-trash"></i>
              </div>
              <div class="todo-list--content-date">
                <i class="bx bx-calendar"></i>
                ${SomeUtils.formatDate(item.createdAt)}
              </div>
            </div>
          </li>
        `;

        container.insertAdjacentHTML("beforeend", listItemElement);
      });
    }

    const checkers = [...container.querySelectorAll(this.selectors.checker)];
    const removers = [...container.querySelectorAll(this.selectors.remover)];

    checkers.forEach((element) => {
      this.attachMarkEvent(element);
    });

    removers.forEach((element) => {
      this.attachRemoveEvent(element);
    });
  }

  resetFormFields() {
    this.domEl.form.reset();
  }

  validateFormFields() {
    const form = this.domEl.form;
    const formFields = [...form.querySelectorAll(this.selectors.formFields)];
    const formValues = formFields.map((field) => field.value);

    const someFieldsAreEmpty = formValues.some((value) =>
      SomeUtils.isEmpty(value)
    );

    if (someFieldsAreEmpty) return false;
    return formValues;
  }
}

class TodoListItem {
  id = undefined;
  title = undefined;
  message = undefined;
  isCompleted = undefined;
  createdAt = undefined;

  constructor(id, title, message, isCompleted, createdAt) {
    this.id = id;
    this.title = title;
    this.message = message;
    this.isCompleted = isCompleted;
    this.createdAt = createdAt;
  }

  markComplete() {
    this.isCompleted = true;
  }

  markIncomplete() {
    this.isCompleted = false;
  }
}

class SomeUtils {
  static formatDate(date) {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const dateObject = new Date(date);

    const takeDate = dateObject.getDate();
    const takeMonth = dateObject.getMonth();
    const takeYear = dateObject.getFullYear();

    const takeHour = dateObject.getHours();
    const takeMinute = dateObject.getMinutes();
    const takeSecond = dateObject.getSeconds();

    return `${takeDate} ${months[takeMonth]} ${takeYear} ${takeHour}:${takeMinute}:${takeSecond}`;
  }

  static generateIDFromList(list) {
    const lastItem = list[list.length - 1];
    if (!lastItem) return 1;
    return lastItem.id + 1;
  }

  static isEmpty(value) {
    return (
      value === "" ||
      (typeof value === "string" && value.trim().length === 0) ||
      value === undefined ||
      value === null
    );
  }
}

const todoList = new TodoList("#app", {
  selectors: {
    anemic: ".tab--button-anemic",
    checker: ".todo-list--checker-input",
    checkAllButton: ".form-submit--button-check-all",
    formFields: ".form-field",
    remover: ".bx-trash",
    removeAllButton: ".form-submit--button-remove-all",
  },
});
