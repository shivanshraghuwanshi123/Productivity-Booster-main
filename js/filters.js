document.addEventListener("DOMContentLoaded", () => {
    const priorityFilter = document.getElementById("priorityFilter");
    const dateFilter = document.getElementById("dateFilter");
    const todoTasks = document.getElementById("todoTasks");
    const inProgressTasks = document.getElementById("inProgressTasks");
    const completedTasks = document.getElementById("completedTasks");

    const filterTasks = () => {
        const priority = priorityFilter.value;
        const date = dateFilter.value;
        const filteredTasks = tasks.filter(task => {
            const matchesPriority = priority === "all" || task.priority === priority;
            const matchesDate = !date || task.deadline.split(' ')[0] === date;
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
});
