document.addEventListener("DOMContentLoaded", () => {
  const todoInput = document.getElementById("todo-input");
  const dateInput = document.getElementById("date-input");
  const addButton = document.getElementById("add-button");
  const todoList = document.getElementById("todo-list");
  const deleteAllButton = document.getElementById("delete-all-button");
  const errorMessage = document.getElementById("error-message");
  const noTaskMessage = document.getElementById("no-task-message");
  const todoHeader = document.getElementById("todo-header");
  const copyrightYear = document.getElementById("copyright-year");
  const themeToggle = document.getElementById("theme-toggle");

  const filterButton = document.getElementById("filter-button");
  const dropdownMenu = document.getElementById("dropdown-menu");
  const filterButtonText = filterButton.querySelector("span");

  let currentFilter = "all";

  const modal = document.getElementById("confirmation-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalBody = document.getElementById("modal-body");
  let modalConfirmBtn = document.getElementById("modal-confirm-btn");
  const modalCancelBtn = document.getElementById("modal-cancel-btn");

  const icons = {
    delete: `<svg class="w-6 h-6 text-red-500 hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>`,
    checkmark: `<svg class="checkmark absolute w-4 h-4 text-white opacity-0 transition-opacity pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>`,
    sun: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>`,
    moon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>`,
  };

  const setTheme = (theme) => {
    if (theme === "light") {
      document.body.classList.add("light-mode");
      themeToggle.innerHTML = icons.moon;
      localStorage.setItem("theme", "light");
    } else {
      document.body.classList.remove("light-mode");
      themeToggle.innerHTML = icons.sun;
      localStorage.setItem("theme", "dark");
    }
  };

  themeToggle.addEventListener("click", () => {
    const currentTheme = localStorage.getItem("theme") || "dark";
    setTheme(currentTheme === "dark" ? "light" : "dark");
  });

  const openModal = (title, body, onConfirm) => {
    modalTitle.textContent = title;
    modalBody.textContent = body;
    modal.classList.remove("hidden");

    modalConfirmBtn.classList.remove("hidden");
    modalCancelBtn.textContent = "Cancel";

    const newConfirmBtn = modalConfirmBtn.cloneNode(true);
    modalConfirmBtn.parentNode.replaceChild(newConfirmBtn, modalConfirmBtn);
    modalConfirmBtn = newConfirmBtn;

    modalConfirmBtn.addEventListener("click", () => {
      onConfirm();
      closeModal();
    });
  };

  const closeModal = () => {
    modal.classList.add("hidden");
  };

  const showWarningModal = (title, body) => {
    modalTitle.textContent = title;
    modalBody.textContent = body;
    modalConfirmBtn.classList.add("hidden");
    modalCancelBtn.textContent = "Close";
    modal.classList.remove("hidden");
  };

  const saveTasks = () => {
    const tasks = [];
    document.querySelectorAll(".task-item").forEach((taskItem) => {
      const taskText = taskItem.querySelector(".task-text").title;
      const dueDate = taskItem
        .querySelector(".text-sm.text-theme-subtle")
        .textContent.replace("Due: ", "");
      const isCompleted = taskItem.classList.contains("completed");
      tasks.push({ text: taskText, date: dueDate, completed: isCompleted });
    });
    localStorage.setItem("todos", JSON.stringify(tasks));
  };

  const loadTasks = () => {
    const tasks = JSON.parse(localStorage.getItem("todos"));
    if (tasks) {
      tasks.forEach((task) => {
        addTask(task.text, task.date, task.completed);
      });
    }
  };

  const updateUI = () => {
    const tasks = todoList.querySelectorAll(".task-item");
    let visibleTasks = 0;
    tasks.forEach((task) => {
      if (task.style.display !== "none") visibleTasks++;
    });

    noTaskMessage.classList.toggle("hidden", visibleTasks > 0);
    todoHeader.classList.toggle(
      "hidden",
      visibleTasks === 0 || window.innerWidth < 768
    );
  };

  const filterTasks = () => {
    const tasks = todoList.querySelectorAll(".task-item");
    tasks.forEach((task) => {
      const isCompleted = task.classList.contains("completed");
      let show = true;
      if (currentFilter === "completed" && !isCompleted) show = false;
      if (currentFilter === "pending" && isCompleted) show = false;
      task.style.display = show ? "grid" : "none";
    });
    updateUI();
  };

  const addTask = (taskTextParam, dueDateParam, isCompleted = false) => {
    const taskText = taskTextParam || todoInput.value.trim();
    const dueDate = dueDateParam || dateInput.value;

    if (!taskTextParam && (taskText === "" || dueDate === "")) {
      errorMessage.classList.remove("hidden");
      return;
    }
    errorMessage.classList.add("hidden");

    const taskItem = document.createElement("div");
    taskItem.className =
      "task-item grid grid-cols-1 md:grid-cols-4 gap-4 items-center p-4 rounded-lg";

    taskItem.innerHTML = `
        <div class="task-text truncate font-semibold" title="${taskText}">${taskText}</div>
        
        <div class="flex items-center justify-between md:contents">
            <div class="text-sm text-theme-subtle"><span class="md:hidden font-bold">Due: </span>${dueDate}</div>
            <div class="status-badge"><span class="badge badge-pending">Pending</span></div>
        </div>

        <div class="actions flex gap-4 justify-end items-center col-start-1 md:col-start-4">
            <label class="relative flex justify-center items-center w-6 h-6 cursor-pointer">
                <input type="checkbox" class="custom-checkbox appearance-none h-full w-full border-2 border-gray-500 rounded-md bg-theme-checkbox transition-all">
                ${icons.checkmark}
            </label>
            <button class="delete-btn">${icons.delete}</button>
        </div>
    `;

    todoList.appendChild(taskItem);
    if (!taskTextParam) {
      todoInput.value = "";
      dateInput.value = "";
    }

    const completeCheckbox = taskItem.querySelector(".custom-checkbox");
    const taskTextEl = taskItem.querySelector(".task-text");
    const statusBadge = taskItem.querySelector(".status-badge .badge");

    if (isCompleted) {
      taskItem.classList.add("completed");
      completeCheckbox.checked = true;
      taskTextEl.classList.add("line-through", "text-gray-500");
      statusBadge.textContent = "Completed";
      statusBadge.classList.remove("badge-pending");
      statusBadge.classList.add("badge-completed");
    }

    taskItem.querySelector(".delete-btn").addEventListener("click", () => {
      openModal(
        "Confirm Task Deletion",
        "Are you sure you want to delete this task?",
        () => {
          taskItem.remove();
          saveTasks();
          updateUI();
        }
      );
    });

    completeCheckbox.addEventListener("change", () => {
      taskItem.classList.toggle("completed", completeCheckbox.checked);

      if (completeCheckbox.checked) {
        taskTextEl.classList.add("line-through", "text-gray-500");
        statusBadge.textContent = "Completed";
        statusBadge.classList.remove("badge-pending");
        statusBadge.classList.add("badge-completed");
      } else {
        taskTextEl.classList.remove("line-through", "text-gray-500");
        statusBadge.textContent = "Pending";
        statusBadge.classList.remove("badge-completed");
        statusBadge.classList.add("badge-pending");
      }
      saveTasks();
      filterTasks();
    });

    if (!taskTextParam) {
      saveTasks();
      filterTasks();
    }
  };

  const setCopyright = () => {
    if (copyrightYear) {
      copyrightYear.textContent = new Date().getFullYear();
    }
  };

  const handleRealtimeValidation = () => {
    const taskText = todoInput.value.trim();
    const dueDate = dateInput.value;

    if (taskText === "" || dueDate === "") {
      errorMessage.classList.remove("hidden");
    } else {
      errorMessage.classList.add("hidden");
    }
  };

  const initialTheme = localStorage.getItem("theme") || "dark";
  setTheme(initialTheme);

  todoInput.addEventListener("input", handleRealtimeValidation);
  dateInput.addEventListener("input", handleRealtimeValidation);

  addButton.addEventListener("click", () => addTask());
  [todoInput, dateInput].forEach((input) => {
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        if (todoInput.value.trim() === "" || dateInput.value === "") {
          return;
        }
        addTask();
      }
    });
  });

  deleteAllButton.addEventListener("click", () => {
    if (todoList.children.length === 0) {
      showWarningModal("Warning", "There are no tasks to delete.");
      return;
    }
    openModal(
      "Confirm Deletion of All Tasks",
      "Are you sure you want to delete ALL tasks? This action cannot be undone.",
      () => {
        todoList.innerHTML = "";
        saveTasks();
        updateUI();
      }
    );
  });

  modalCancelBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  filterButton.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle("hidden");
  });

  window.addEventListener("click", () => {
    if (!dropdownMenu.classList.contains("hidden")) {
      dropdownMenu.classList.add("hidden");
    }
  });

  window.addEventListener("resize", updateUI);

  dropdownMenu.addEventListener("click", (e) => {
    e.preventDefault();
    if (e.target.tagName === "A") {
      currentFilter = e.target.dataset.filter;
      filterButtonText.textContent = e.target.textContent;
      filterTasks();
      dropdownMenu.classList.add("hidden");
    }
  });

  setCopyright();
  loadTasks();
  filterTasks();
  updateUI();
});
