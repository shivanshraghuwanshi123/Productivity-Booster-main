document.addEventListener("DOMContentLoaded", () => {
    const todoTasks = document.getElementById("todoTasks").querySelector("ul");
    const inProgressTasks = document.getElementById("inProgressTasks").querySelector("ul");
    const completedTasks = document.getElementById("completedTasks").querySelector("ul");
    let tasks = [];

    // Handle drag start
    const handleDragStart = (event) => {
        event.dataTransfer.setData("text/plain", event.target.dataset.id);
    };

    // Handle drop
    const handleDrop = (event) => {
        event.preventDefault();
        const taskId = parseInt(event.dataTransfer.getData("text/plain"));
        const taskElement = document.querySelector(`[data-id='${taskId}']`);
        const categoryElement = event.currentTarget;

        if (categoryElement.classList.contains("task-category")) {
            const categoryId = categoryElement.id;
            const categoryUl = categoryElement.querySelector("ul");

            // Remove the task from its current category before moving
            taskElement.remove();

            // Append task to the new category
            categoryUl.appendChild(taskElement);

            // Update the task's status in the array and save to localStorage
            let newStatus;
            if (categoryId === "todoTasks") {
                newStatus = "todo";
            } else if (categoryId === "inProgressTasks") {
                newStatus = "in-progress";
            } else if (categoryId === "completedTasks") {
                newStatus = "completed";
            }

            updateTaskStatus(taskId, newStatus);
        }
    };

    // Create task element
    const createTaskElement = (task) => {
        const taskElement = document.createElement("li");
        taskElement.classList.add("task-item");
        taskElement.setAttribute("draggable", true);
        taskElement.dataset.id = task.id;

        // Correctly format deadline
        const deadlineParts = task.deadline.split(' ');
        const formattedDeadline = deadlineParts[0];  // Date part
        const formattedDeadlineTime = deadlineParts[1] || ''; // Time part if exists, otherwise empty

        taskElement.innerHTML = `
            <h4>${task.title}</h4>
            <p>${task.description}</p>
            <p>Due: ${formattedDeadline} ${formattedDeadlineTime}</p>  <!-- Fix for undefined -->
            <p>Priority: ${task.priority}</p>
        `;

        // Add drag event listeners
        taskElement.addEventListener("dragstart", handleDragStart);

        return taskElement;
    };

    // Save tasks to localStorage
    const saveTasks = () => {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    };

    // Load tasks from localStorage
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

    // Update task status
    const updateTaskStatus = (taskId, newStatus) => {
        tasks = tasks.map(task =>
            task.id === taskId ? { ...task, status: newStatus } : task
        );
        saveTasks();
    };

    // Add drop event listeners to categories
    const taskCategories = document.querySelectorAll(".task-category");
    taskCategories.forEach(category => {
        category.addEventListener("dragover", (event) => {
            event.preventDefault();
        });
        category.addEventListener("drop", handleDrop);
    });

    // Load tasks on page load
    loadTasks();
});
