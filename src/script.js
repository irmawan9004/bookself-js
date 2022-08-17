const bookself = [];
const RENDER_EVENT = "render-todo";

const SAVED_EVENT = "saved-todo";
const STORAGE_KEY = "TODO_APPS";

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("input-book");

  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }

  const searchForm = document.getElementById("searchBook");
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    console.log("contol");
    searchBook();
  });

  const resetBtn = document.querySelector(".reset");
  resetBtn.addEventListener("click", () => {
    document.getElementById("searchBookTitle").value = "";
    searchBook();
  });
});

function addBook() {
  const bookTitle = document.getElementById("title").value;
  const bookWritter = document.getElementById("writter").value;
  const bookYear = document.getElementById("year").value;
  const bookIsComplete = document.getElementById("inputBookIsComplete");
  let bookStatus;

  if (bookIsComplete.checked) {
    bookStatus = true;
  } else {
    bookStatus = false;
  }

  const generatedID = generateId();
  const bookObject = generateBookObject(
    generatedID,
    bookTitle,
    bookWritter,
    bookYear,
    bookStatus
  );
  bookself.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, bookTitle, bookWritter, bookYear, isCompleted) {
  return {
    id,
    bookTitle,
    bookWritter,
    bookYear,
    isCompleted,
  };
}

function makeTodo(bookObject) {
  const bookTitle = document.createElement("h2");
  bookTitle.classList.add("item-title");
  bookTitle.innerText = bookObject.bookTitle;

  const bookWritter = document.createElement("p");
  bookWritter.innerText = bookObject.bookWritter;

  const bookYear = document.createElement("p");
  bookYear.innerText = bookObject.bookYear;

  const textContainer = document.createElement("div");
  textContainer.classList.add("inner");
  textContainer.append(bookTitle, bookWritter, bookYear);

  const container = document.createElement("div");
  container.classList.add("item", "shadow");
  container.append(textContainer);
  container.setAttribute("id", `book-${bookObject.id}`);

  function addTaskToCompleted(bookId) {
    const bookTarget = findTodo(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  function findTodo(bookId) {
    for (const bookItem of bookself) {
      if (bookItem.id === bookId) {
        return bookItem;
      }
    }
    return null;
  }

  function removeTaskFromCompleted(todoId) {
    const bookTarget = findTodoIndex(todoId);

    if (bookTarget === -1) return;

    bookself.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  function undoTaskFromCompleted(todoId) {
    const bookTarget = findTodo(todoId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  function findTodoIndex(todoId) {
    for (const index in bookself) {
      if (bookself[index].id === todoId) {
        return index;
      }
    }

    return -1;
  }

  if (bookObject.isCompleted) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("undo-button");

    undoButton.addEventListener("click", function () {
      undoTaskFromCompleted(bookObject.id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-button");

    trashButton.addEventListener("click", function () {
      removeTaskFromCompleted(bookObject.id);
    });

    undoButton.addEventListener("click", function () {
      undoTaskFromCompleted(bookObject.id);
    });
    container.append(undoButton, trashButton);
  } else {
    const checkButton = document.createElement("button");
    checkButton.classList.add("check-button");

    checkButton.addEventListener("click", function () {
      addTaskToCompleted(bookObject.id);
    });

    container.append(checkButton);
  }

  return container;
}

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBookList = document.getElementById("book");
  uncompletedBookList.innerHTML = "";

  const completedBookList = document.getElementById("completed-book");
  completedBookList.innerHTML = "";

  for (const bookItem of bookself) {
    const bookElement = makeTodo(bookItem);
    if (!bookItem.isCompleted) {
      uncompletedBookList.append(bookElement);
    } else {
      completedBookList.append(bookElement);
    }
  }
});

function isStorageExist() /* boolean */ {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(bookself);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      bookself.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

const searchBook = () => {
  const searchInput = document
    .getElementById("searchBookTitle")
    .value.toLowerCase();
  const bookItems = document.getElementsByClassName("item");

  for (let i = 0; i < bookItems.length; i++) {
    const itemTitle = bookItems[i].querySelector(".item-title");
    if (itemTitle.textContent.toLowerCase().includes(searchInput)) {
      bookItems[i].classList.remove("hidden");
    } else {
      bookItems[i].classList.add("hidden");
    }
  }
};
