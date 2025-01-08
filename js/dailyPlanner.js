document.addEventListener("DOMContentLoaded", function() {
    const taskForm = document.getElementById("task-form");
    const taskInput = document.getElementById("task-input");
    const taskDeadline = document.getElementById("task-deadline");
    const taskList = document.getElementById("task-list");
    const tasksKey = 'dailyPlannerTasks';

    let tasks = JSON.parse(localStorage.getItem(tasksKey)) || [];

    // Function to show browser alerts
    function showAlert(title) {
        alert(title);
    }

    // Function to alert task deadline
    function alertTaskDeadline(task) {
        const message = `Your task "${task.text}" is due at ${task.deadline}`;
        console.log(`Alert triggered for task: ${task.text} at ${task.deadline}`);
        showAlert(message);
    }

    // Function to save tasks to local storage
    function saveTasks() {
        localStorage.setItem(tasksKey, JSON.stringify(tasks));
    }

    // Function to render tasks
    function renderTasks() {
        taskList.innerHTML = '';
        tasks.forEach((task, index) => {
            const li = document.createElement("li");
            li.classList.toggle("completed", task.completed);
            li.innerHTML = `
                ${task.text} - ${task.deadline}
                <button onclick="toggleTask(${index})">${task.completed ? 'Undo' : 'Complete'}</button>
                <button onclick="deleteTask(${index})">Delete</button>
            `;
            taskList.appendChild(li);

            // Set precise alert time for task deadline
            if (!task.completed) {
                const now = new Date();
                const taskTime = new Date();
                const [hours, minutes] = task.deadline.split(":").map(Number);
                taskTime.setHours(hours);
                taskTime.setMinutes(minutes);
                taskTime.setSeconds(0);

                const timeoutDuration = taskTime - now;
                if (timeoutDuration > 0) {
                    setTimeout(() => alertTaskDeadline(task), timeoutDuration);
                    console.log(`Set timeout for task: ${task.text} at ${task.deadline} with duration: ${timeoutDuration}`);
                }
            }
        });
    }

    // Add new task
    taskForm.addEventListener("submit", function(e) {
        e.preventDefault();
        const newTask = { text: taskInput.value, deadline: taskDeadline.value, completed: false };
        tasks.push(newTask);
        saveTasks();
        renderTasks();
        taskInput.value = '';
        taskDeadline.value = '';
    });

    // Toggle task completion
    window.toggleTask = function(index) {
        tasks[index].completed = !tasks[index].completed;
        saveTasks();
        renderTasks();
    }

    // Delete task
    window.deleteTask = function(index) {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
    }

    // Initial render
    renderTasks();
});
