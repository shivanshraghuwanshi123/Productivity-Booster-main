// Main Initialization Script
document.addEventListener("DOMContentLoaded", () => {
    // Global tasks array
    window.tasks = [];

    // Utility function to create a task element
    window.createTaskElement = (task) => {
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

    // Utility function to save tasks to localStorage
    window.saveTasks = () => {
        localStorage.setItem("tasks", JSON.stringify(window.tasks));
    };

    // Utility function to load tasks from localStorage
    window.loadTasks = () => {
        const savedTasks = localStorage.getItem("tasks");
        if (savedTasks) {
            window.tasks = JSON.parse(savedTasks);
            window.tasks.forEach(task => {
                const taskElement = window.createTaskElement(task);

                // Check for existence of task lists before appending
                if (task.status === "todo" && document.getElementById("todoTasks")) {
                    document.getElementById("todoTasks").appendChild(taskElement);
                } else if (task.status === "in-progress" && document.getElementById("inProgressTasks")) {
                    document.getElementById("inProgressTasks").appendChild(taskElement);
                } else if (task.status === "completed" && document.getElementById("completedTasks")) {
                    document.getElementById("completedTasks").appendChild(taskElement);
                }
            });
        }
    };

    // Define the handleDragStart and handleDragEnd functions
    window.handleDragStart = (event) => {
        event.dataTransfer.setData("text/plain", event.target.dataset.id);
    };

    window.handleDragEnd = (event) => {
        const taskId = parseInt(event.dataTransfer.getData("text/plain"));
        const targetElement = event.target;
        if (targetElement.classList.contains("task-category")) {
            const taskCategory = targetElement.id;
            const taskElement = document.querySelector(`[data-id='${taskId}']`);
            targetElement.querySelector("ul").appendChild(taskElement);
            updateTaskStatus(taskElement, taskCategory);
        }
    };

    window.loadTasks();
});
