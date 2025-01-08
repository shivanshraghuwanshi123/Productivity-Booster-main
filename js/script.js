document.addEventListener("DOMContentLoaded", () => {
    // Theme Toggle
    const themeToggleBtn = document.getElementById("themeToggleBtn");
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            document.body.classList.toggle("dark-theme");
        });
    }

    // Pomodoro Timer
    const timerDisplay = document.getElementById("timerDisplay");
    if (timerDisplay) {
        let timer;
        const startTimerBtn = document.getElementById("startTimer");
        const pauseTimerBtn = document.getElementById("pauseTimer");
        const resetTimerBtn = document.getElementById("resetTimer");
        
        let timeLeft = 1500; // 25 minutes in seconds

        const updateTimerDisplay = () => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerDisplay.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
        };

        const startTimer = () => {
            clearInterval(timer);
            timer = setInterval(() => {
                if (timeLeft > 0) {
                    timeLeft--;
                    updateTimerDisplay();
                } else {
                    clearInterval(timer);
                    alert("Time's up!");
                }
            }, 1000);
        };

        const pauseTimer = () => {
            clearInterval(timer);
        };

        const resetTimer = () => {
            clearInterval(timer);
            timeLeft = 1500;
            updateTimerDisplay();
        };

        startTimerBtn.addEventListener("click", startTimer);
        pauseTimerBtn.addEventListener("click", pauseTimer);
        resetTimerBtn.addEventListener("click", resetTimer);
    }

    // Task Management
    const taskForm = document.getElementById("taskForm");
    const todoTasks = document.getElementById("todoTasks");
    const inProgressTasks = document.getElementById("inProgressTasks");
    const completedTasks = document.getElementById("completedTasks");
    let tasks = [];

    const createTaskElement = (task) => {
        const taskElement = document.createElement("li");
        taskElement.classList.add("task-item");
        taskElement.setAttribute("draggable", true);
        taskElement.innerHTML = `
            <h4>${task.title}</h4>
            <p>${task.description}</p>
            <p>Due: ${task.deadline}</p>
            <p>Priority: ${task.priority}</p>
            <button class="move-to-todo">To-Do</button>
            <button class="move-to-in-progress">In Progress</button>
            <button class="move-to-completed">Completed</button>
            <button class="edit-task">Edit</button>
            <button class="delete-task">Delete</button>
        `;

        taskElement.addEventListener("dragstart", handleDragStart);
        taskElement.addEventListener("dragend", handleDragEnd);

        return taskElement;
    };

    taskForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const task = {
            id: Date.now(),
            title: document.getElementById("taskTitle").value,
            description: document.getElementById("taskDescription").value,
            deadline: document.getElementById("taskDeadline").value,
            priority: document.getElementById("taskPriority").value
        };
        tasks.push(task);
        saveTasks();
        const taskElement = createTaskElement(task);
        todoTasks.appendChild(taskElement);
        taskForm.reset();
    });

    const saveTasks = () => {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    };

    const loadTasks = () => {
        const savedTasks = localStorage.getItem("tasks");
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
            tasks.forEach(task => {
                const taskElement = createTaskElement(task);
                if (task.status === "todo") {
                    todoTasks.appendChild(taskElement);
                } else if (task.status === "in-progress") {
                    inProgressTasks.appendChild(taskElement);
                } else if (task.status === "completed") {
                    completedTasks.appendChild(taskElement);
                }
            });
        }
    };

    loadTasks();

    // Move tasks between categories and delete/edit tasks
    document.addEventListener("click", (event) => {
        if (event.target.classList.contains("move-to-todo")) {
            const taskElement = event.target.parentElement;
            todoTasks.appendChild(taskElement);
            updateTaskStatus(taskElement, "todo");
        } else if (event.target.classList.contains("move-to-in-progress")) {
            const taskElement = event.target.parentElement;
            inProgressTasks.appendChild(taskElement);
            updateTaskStatus(taskElement, "in-progress");
        } else if (event.target.classList.contains("move-to-completed")) {
            const taskElement = event.target.parentElement;
            completedTasks.appendChild(taskElement);
            updateTaskStatus(taskElement, "completed");
        } else if (event.target.classList.contains("edit-task")) {
            const taskElement = event.target.parentElement;
            editTask(taskElement);
        } else if (event.target.classList.contains("delete-task")) {
            const taskElement = event.target.parentElement;
            deleteTask(taskElement);
        }
    });

    const updateTaskStatus = (taskElement, status) => {
        const taskId = parseInt(taskElement.dataset.id);
        tasks = tasks.map(task => task.id === taskId ? { ...task, status } : task);
        saveTasks();
    };

    const editTask = (taskElement) => {
        const taskId = parseInt(taskElement.dataset.id);
        const task = tasks.find(task => task.id === taskId);
        document.getElementById("taskTitle").value = task.title;
        document.getElementById("taskDescription").value = task.description;
        document.getElementById("taskDeadline").value = task.deadline;
        document.getElementById("taskPriority").value = task.priority;
        deleteTask(taskElement);
    };

    const deleteTask = (taskElement) => {
        const taskId = parseInt(taskElement.dataset.id);
        tasks = tasks.filter(task => task.id !== taskId);
        taskElement.remove();
        saveTasks();
    };

    // Drag-and-Drop
    const handleDragStart = (event) => {
        event.dataTransfer.setData("text/plain", event.target.dataset.id);
    };

    const handleDragEnd = (event) => {
        const taskId = parseInt(event.dataTransfer.getData("text/plain"));
        const targetElement = event.target;
        if (targetElement.classList.contains("task-category")) {
            const taskCategory = targetElement.id;
            const taskElement = document.querySelector(`[data-id='${taskId}']`);
            targetElement.querySelector("ul").appendChild(taskElement);
            updateTaskStatus(taskElement, taskCategory);
        }
    };

    const taskCategories = document.querySelectorAll(".task-category");
    taskCategories.forEach(category => {
        category.addEventListener("dragover", (event) => {
            event.preventDefault();
        });

        category.addEventListener("drop", (event) => {
            event.preventDefault();
            handleDragEnd(event);
        });
    });

    // Filters
    const priorityFilter = document.getElementById("priorityFilter");
    const dateFilter = document.getElementById("dateFilter");

    const filterTasks = () => {
        const priority = priorityFilter.value;
        const date = dateFilter.value;
        const filteredTasks = tasks.filter(task => {
            const matchesPriority = priority === "all" || task.priority === priority;
            const matchesDate = !date || task.deadline === date;
            return matchesPriority && matchesDate;
        });

        displayFilteredTasks(filteredTasks);
    };

    const displayFilteredTasks = (filteredTasks) => {
        todoTasks.innerHTML = "";
        inProgressTasks.innerHTML = "";
        completedTasks.innerHTML = "";

        filteredTasks.forEach(task => {
            const taskElement = createTaskElement(task);
            if (task.status === "todo") {
                todoTasks.appendChild(taskElement);
            } else if (task.status === "in-progress") {
                inProgressTasks.appendChild(taskElement);
            } else if (task.status === "completed") {
                completedTasks.appendChild(taskElement);
            }
        });
    };

    if (priorityFilter) {
        priorityFilter.addEventListener("change", filterTasks);
    }

    if (dateFilter) {
        dateFilter.addEventListener("change", filterTasks);
    }

    // Recurring Tasks
    // You can implement recurring tasks as needed, here's a basic example
    const recurringTaskForm = document.getElementById("recurringTaskForm");
    if (recurringTaskForm) {
        recurringTaskForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const task = {
                id: Date.now(),
                (),
                title: document.getElementById("recurringTaskTitle").value,
                description: document.getElementById("recurringTaskDescription").value,
                deadline: document.getElementById("recurringTaskDeadline").value,
                priority: document.getElementById("recurringTaskPriority").value,
                recurrence: document.getElementById("recurringTaskRecurrence").value
                };
                tasks.push(task); saveTasks(); const taskElement = createTaskElement(task); todoTasks.appendChild(taskElement); recurringTaskForm.reset(); }); } // Visual Analytics Dashboard const showAnalytics = () => { const totalTasks = tasks.length; const completedTasksCount = tasks.filter(task => task.status === "completed").length; const inProgressTasksCount = tasks.filter(task => task.status === "in-progress").length; const todoTasksCount = tasks.filter(task => task.status === "todo").length; const dailyTasks = {}; tasks.forEach(task => { const date = new Date(task.deadline).toLocaleDateString(); if (!dailyTasks[date]) { dailyTasks[date] = 0; } dailyTasks[date]++; }); // Display analytics data const analyticsContainer = document.getElementById("analyticsContainer"); if (analyticsContainer) { analyticsContainer.innerHTML = ` <p>Total Tasks: ${totalTasks}</p> <p>Completed Tasks: ${completedTasksCount}</p> <p>In Progress Tasks: ${inProgressTasksCount}</p> <p>To-Do Tasks: ${todoTasksCount}</p> <h3>Daily Tasks</h3> <ul> ${Object.entries(dailyTasks).map(([date, count]) => `<li>${date}: ${count} tasks</li>`).join('')} </ul> `; } }; if (document.getElementById("analyticsPage")) { showAnalytics(); } // Daily Planner View const dailyPlanner = document.getElementById("dailyPlanner"); if (dailyPlanner) { const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]; const currentDate = new Date(); const currentDayIndex = currentDate.getDay(); const weekDays = [...days.slice(currentDayIndex), ...days.slice(0, currentDayIndex)]; dailyPlanner.innerHTML = weekDays.map(day => ` <div class="day"> <h4>${day}</h4> <ul> ${tasks.filter(task => new Date(task.deadline).getDay() === days.indexOf(day)) .map(task => `<li>${task.title} - ${task.description} - ${task.deadline} - ${task.priority}</li>`).join('')} </ul> </div> `).join(''); } // Initial load loadTasks(); showAnalytics();
            });