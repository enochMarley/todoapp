var electron = require('electron');
var {ipcRenderer} = electron;

//variables to hold the number of tasks left
var totalTasks = 0,
    doneTasks = 0,
    remainingTasks = 0;

//init of the function to get the items todos when the app is loaded
getInitTodos();
new WOW().init();


//an event handler to handle the addition of tasks
$(".input-form").on("submit", (event) => {
    event.preventDefault();
    var taskName = $(".task-name").val().trim();
    if(taskName == "") {
        alert("Enter Task Name");
    } else {
        ipcRenderer.send('addTask',taskName);
        $(".task-name").val("");
    }
});

//a function to load the tasks when the task is loaded
function getInitTodos() {
    ipcRenderer.send('getTodos', 'getInitTodos');
}

//a function to show the todos
function showTodos(todos) {
    if(todos.length < 1) {
        var message = $("<h3 class='text-center text-color-grey error-msg'><i class='fa fa-frown-o'></i> No Tasks Added</h3>")
        $(".items-res").html(message);
        clearDatabase();
    } else {
        $(".error-msg").hide();
        var template = "",
            counter = 1;

        for(todo in todos) {

            if(!todos[todo].taskDone) {
                template = "<section class='todo-item-div item-" + todos[todo]._id + " wow zoomIn feeds-row' data-wow-duration='0.5s' data-wow-delay='0." + counter + "s'>" +
                                "<input type='hidden' class='item-input-"+todos[todo]._id + "' value='" + todos[todo].taskDone + "' >" +
                                "<section class='checkbox-div'> " +
                                    "<input type='checkbox' onclick='toggleTaskDone(" + JSON.stringify(todos[todo]) + ")'>" +
                                "</section>" +
                                "<section class='content-div'>" +
                                  todos[todo].taskName+
                                "</section>" +
                                "<section class='actions-div'>" +
                                    "<i class='fa fa-trash-o text-info trash-icon' onclick='deleteTask(" + JSON.stringify(todos[todo]) + ")'></i>" +
                                "</section>" +
                            "</section>";
                $(".items-res").append(template);
            } else if(todos[todo].taskDone) {
                template = "<section class='todo-item-div item-" + todos[todo]._id + " task-done wow zoomIn feeds-row' data-wow-duration='0.5s' data-wow-delay='0." + counter + "s'>" +
                                "<input type='hidden' class='item-input-"+todos[todo]._id + "' value='" + todos[todo].taskDone + "' >"+
                                "<section class='checkbox-div'> " +
                                    "<input type='checkbox' onclick='toggleTaskDone(" + JSON.stringify(todos[todo]) + ")' checked>" +
                                "</section>" +
                                "<section class='content-div'>" +
                                todos[todo].taskName+
                                "</section>" +
                                "<section class='actions-div'>" +
                                "<i class='fa fa-trash-o text-info trash-icon'  onclick='deleteTask(" + JSON.stringify(todos[todo]) + ")'></i>" +
                                "</section>" + 
                            "</section>";
                $(".items-res").append(template);
            } 

            counter++;
        }

        
    }
}

//a function to toggle todos as done or not
function toggleTaskDone(value) {
    var doneValue = $(".item-input-"+value._id).val();
    var isDone = (doneValue == 1) ? 0 : 1;
    $(".item-" + value._id).toggleClass("task-done");
    var details =  [{_id: value._id},{$set: {taskDone: isDone}}];

    ipcRenderer.send('toggleTaskDone',details);
    $(".item-input-"+value._id).val(isDone);
    getSummary();
}

//a function to delete a task
function deleteTask(todo) {
    $(".item-" + todo._id).slideToggle("fast");
    var details = [{_id: todo._id}];
    ipcRenderer.send("deleteTask", details);
    $(".item-" + todo._id).remove();
    getSummary();

    if($(".todo-item-div").length < 1) {
        clearDatabase();
        $(".error-msg").slideToggle();
    }

}

//a function to calculate the summary of todos
function getSummary() {
    totalTasks = $(".todo-item-div").length;
    doneTasks = $(".task-done").length;
    remainingTasks = totalTasks - doneTasks;

    $(".total-tasks").html(totalTasks);
    $(".done-tasks").html(doneTasks);
    $(".remaining-tasks").html(remainingTasks);
}

//a function to send ipc event to clear db
function clearDatabase() {
    ipcRenderer.send("clearDatabase",'cleardb');
}

//ipc event handler to get the items sent from backend
ipcRenderer.on("getTodos", (e, todos) => {
    showTodos(todos);
    getSummary();
})

//a function to get the recent todo
ipcRenderer.on("getRecentTodo", (e, todo) => {
    showTodos(todo);
    getSummary();
})

//ipc event handler to show the about page
ipcRenderer.on("showAboutDetails", (e, event) => {
    window.location.href = 'about.html';
})
