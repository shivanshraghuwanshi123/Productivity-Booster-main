document.addEventListener("DOMContentLoaded", () => {
    const taskForm = document.getElementById("taskForm");
    const todoTasks = document.getElementById("todoTasks");
    const inProgressTasks = document.getElementById("inProgressTasks");
    const completedTasks = document.getElementById("completedTasks");
    let tasks = [];

    const handleDragStart = (event) => {
        event.dataTransfer.setData("text/plain", event.target.dataset.id);
    };

    const handleDragEnd = (event) => {
        const taskId = parseInt(event.dataTransfer.getData("text/plain"));
        const targetElement = event.target;
        if (targetElement.classList.contains("task-category")) {
            const taskCategory = targetElement.id;
            const taskElement = document.querySelector(`[data-id='${taskId}']`);
            if (taskElement) {
                // Remove the task from its current category before moving
                taskElement.remove();

                // Append the task to the new category
                targetElement.querySelector("ul").appendChild(taskElement);

                // Update the task status
                updateTaskStatus(taskElement, taskCategory);
            }
        }
    };

    const createTaskElement = (task) => {
        const taskElement = document.createElement("li");
        taskElement.classList.add("task-item");
        taskElement.setAttribute("draggable", true);
        taskElement.dataset.id = task.id;
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

    // Function to show notifications
    const showNotification = (message) => {
        if (Notification.permission === "granted") {
            new Notification(message);
        }
    };

    // Request notification permission
    if (Notification && Notification.permission !== "granted") {
        Notification.requestPermission();
    }

    // Function to check deadlines and show notifications
    const checkDeadlines = () => {
        const now = new Date();
        tasks.forEach(task => {
            const deadline = new Date(task.deadline);
            const timeDiff = deadline - now;
            
            if (timeDiff <= 0 && !task.notifiedEnd) {
                showNotification(`Time ended for task: ${task.title}`);
                task.notifiedEnd = true;
                saveTasks();
            } else if (timeDiff <= 5 * 60 * 1000 && !task.notifiedFiveMinutes) { // 5 minutes
                showNotification(`5 minutes remaining for task: ${task.title}`);
                task.notifiedFiveMinutes = true;
                saveTasks();
            }
        });
    };

    // Form submission event
    taskForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const deadline = document.getElementById("taskDeadline").value;
        const deadlineTime = document.getElementById("taskDeadlineTime").value;
        
        // Combine deadline and deadlineTime into one field if both are present
        const fullDeadline = deadline && deadlineTime ? `${deadline} ${deadlineTime}` : deadline;

        // Check if the task with the same title and deadline already exists
        const taskExists = tasks.some(task => task.title === document.getElementById("taskTitle").value && task.deadline === fullDeadline);
        
        if (taskExists) {
            alert("This task already exists!");
            return; // Prevent adding duplicate task
        }
        
        const task = {
            id: Date.now(),
            title: document.getElementById("taskTitle").value,
            description: document.getElementById("taskDescription").value,
            deadline: fullDeadline,
            priority: document.getElementById("taskPriority").value,
            status: "todo",
            notifiedFiveMinutes: false,
            notifiedEnd: false
        };
        
        tasks.push(task);
        saveTasks();
        
        const taskElement = createTaskElement(task);
        todoTasks.appendChild(taskElement);
        taskForm.reset();
        showNotification(`Task "${task.title}" successfully added!`);
    });

    const saveTasks = () => {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    };

    const loadTasks = () => {
        const savedTasks = localStorage.getItem("tasks");
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
            // Ensure that tasks are not appended multiple times
            const existingTaskIds = Array.from(todoTasks.children).map(task => task.dataset.id)
                .concat(Array.from(inProgressTasks.children).map(task => task.dataset.id))
                .concat(Array.from(completedTasks.children).map(task => task.dataset.id));

            tasks.forEach(task => {
                if (!existingTaskIds.includes(task.id.toString())) {
                    const taskElement = createTaskElement(task);
                    if (task.status === "todo") {
                        todoTasks.appendChild(taskElement);
                    } else if (task.status === "in-progress") {
                        inProgressTasks.appendChild(taskElement);
                    } else if (task.status === "completed") {
                        completedTasks.appendChild(taskElement);
                    }
                }
            });
        }
    };

    loadTasks();

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
        document.getElementById("taskDeadline").value = task.deadline.split(' ')[0]; // Set only the date part
        document.getElementById("taskDeadlineTime").value = task.deadline.split(' ')[1] || ''; // Set only the time part if available
        document.getElementById("taskPriority").value = task.priority;
        deleteTask(taskElement);
    };

    const deleteTask = (taskElement) => {
        const taskId = parseInt(taskElement.dataset.id);
        tasks = tasks.filter(task => task.id !== taskId);
        taskElement.remove();
        saveTasks();
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

    // Periodically check for task deadlines
    setInterval(checkDeadlines, 60 * 1000); // Check every minute
});
