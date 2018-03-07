const { app, BrowserWindow, Menu, ipcMain} = require('electron');
var DataStore = require('nedb');
const path = require('path');
const url = require('url');
const fs = require('fs');
const databasePath =  path.join(__dirname, "db/todos.json");

var todoDb = new DataStore({
    filename: databasePath,
    autoload: true
});

//declare the window
let window;

//when the app is ready run the openWindow method
app.on('ready', openWindow);

ipcMain.on('getTodos', (e, msg) => {
    getTodos();
});

//when the ipcMain receives an addTask event
ipcMain.on("addTask", (e, task) => {
    var taskDetails = {
        taskName: task,
        taskDone: 0,
        timeSent: new Date()
    };

    todoDb.insert(taskDetails, (error, newTask) => {
        if(error) console.log(error);
        window.webContents.send('getRecentTodo', [newTask]);
    })
});

//when a task is toggled as done or undone
ipcMain.on("toggleTaskDone", (e, details) => {
    todoDb.update(details[0],details[1], {}, (error, todo) => {
        console.log(todo);
    })
})

//when a task is toggled to be deleted
ipcMain.on("deleteTask", (e, details) => {
    todoDb.remove(details[0], {}, (error, task) => {
        console.log(task);
    })
})

//when cleardb event is sent
ipcMain.on("clearDatabase", (e, msg) => {
    clearDatabase();
})

//a method to get all the todos and send them to the ui
function getTodos() {
    todoDb.find({}, (error, todos) => {
        if(error) console.log(error);
        window.webContents.send('getTodos', todos);
    })
}

//a method to clear all tasks
function deleteAllTasks() {
    todoDb.remove({}, { multi: true }, function (error, todo) {
        clearDatabase();
        getTodos();
    });
}

//a function to clear database
function clearDatabase() {
    fs.writeFile(databasePath,'', () => {
        console.log('records deleted');
    })
}

//a method to show the about details of the app
function showAboutDetails() {
    window.webContents.send('showAboutDetails', 'event page requested');
}

//a method to open the window
function openWindow() {
    //initiallize the new window with height and with properties
    window  = new BrowserWindow({
        width: 800,
        height: 600,
        icon: path.join(__dirname,"assets/img/icon.png"),
    });

    //load the index html file when it loads
    window.loadURL(url.format({
        pathname: path.join(__dirname,'intro.html'),
        protocol: 'file:',
        slashes: true
    }));

    //when the window closes
    window.on('closed', () => {
        window = null;
    });

    app.on('active', () => {
        if(window === null) {
            openWindow();
        }
    });

    //build custom menu from template
    const mianMenu  = Menu.buildFromTemplate(menuTemplate);

    Menu.setApplicationMenu(mianMenu)
}

//create menu template
const menuTemplate = [
    {
        label: 'Tasks',
        submenu: [
            {
                label:'Clear All',
                click() {
                    deleteAllTasks();
                }
            }
        ]
    },
    {
        label: 'Application',
        submenu: [
            {
                label: 'About',
                click() {
                    showAboutDetails();
                }
            },
            {
                label: 'Quit',
                accelerator: (process.platform == 'darwin') ? 'Command+Q' : 'Ctrl+Q',
                click() {
                    app.quit();
                }
            }
        ]
    }
]