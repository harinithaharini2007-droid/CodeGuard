// ======================================================
// CODEGUARD - FRONTEND + FLASK BACKEND CONNECTION
// ======================================================

const API_URL = "http://127.0.0.1:5000";

// ===============================
// GET ELEMENTS
// ===============================

const authScreen = document.getElementById("authScreen");
const mainApp = document.getElementById("mainApp");

const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");

const showLoginBtn = document.getElementById("showLoginBtn");
const showRegisterBtn = document.getElementById("showRegisterBtn");

const registerUsername = document.getElementById("registerUsername");
const registerPassword = document.getElementById("registerPassword");
const confirmPassword = document.getElementById("confirmPassword");

const registerBtn = document.getElementById("registerBtn");
const registerMessage = document.getElementById("registerMessage");

const loginUsername = document.getElementById("loginUsername");
const loginPassword = document.getElementById("loginPassword");

const loginBtn = document.getElementById("loginBtn");
const loginMessage = document.getElementById("loginMessage");

const logoutBtn = document.getElementById("logoutBtn");
const welcomeUser = document.getElementById("welcomeUser");


// ===============================
// TASK ELEMENTS
// ===============================

const taskName = document.getElementById("taskName");
const taskStatus = document.getElementById("taskStatus");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const totalTasks = document.getElementById("totalTasks");
const taskMessage = document.getElementById("taskMessage");


// ===============================
// BUG ELEMENTS
// ===============================

const bugTitle = document.getElementById("bugTitle");
const bugSeverity = document.getElementById("bugSeverity");
const addBugBtn = document.getElementById("addBugBtn");
const bugList = document.getElementById("bugList");
const bugCount = document.getElementById("bugCount");
const totalBugs = document.getElementById("totalBugs");
const bugMessage = document.getElementById("bugMessage");


// ===============================
// HEALTH / RISK ELEMENTS
// ===============================

const analyzeBtn = document.getElementById("analyzeBtn");
const riskValue = document.getElementById("riskValue");
const healthStatus = document.getElementById("healthStatus");
const riskMessage = document.getElementById("riskMessage");
const healthIcon = document.getElementById("healthIcon");


// ======================================================
// SWITCH REGISTER / LOGIN
// ======================================================

showLoginBtn.onclick = function () {

    registerForm.classList.add("hidden");
    loginForm.classList.remove("hidden");

    registerMessage.textContent = "";
};


showRegisterBtn.onclick = function () {

    loginForm.classList.add("hidden");
    registerForm.classList.remove("hidden");

    loginMessage.textContent = "";
};


// ======================================================
// REGISTER - FLASK BACKEND
// ======================================================

registerBtn.onclick = async function () {

    const username = registerUsername.value.trim();
    const password = registerPassword.value.trim();
    const confirm = confirmPassword.value.trim();

    registerMessage.textContent = "";

    // Validation
    if (username === "" || password === "" || confirm === "") {

        registerMessage.textContent =
            "Please fill all fields.";

        registerMessage.style.color = "#dc2626";

        return;
    }


    if (username.length < 3) {

        registerMessage.textContent =
            "Username must contain at least 3 characters.";

        registerMessage.style.color = "#dc2626";

        return;
    }


    if (password.length < 4) {

        registerMessage.textContent =
            "Password must contain at least 4 characters.";

        registerMessage.style.color = "#dc2626";

        return;
    }


    if (password !== confirm) {

        registerMessage.textContent =
            "Passwords do not match.";

        registerMessage.style.color = "#dc2626";

        return;
    }


    try {

        registerBtn.disabled = true;
        registerBtn.textContent = "Creating...";


        const response = await fetch(
            `${API_URL}/register`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    username: username,
                    password: password
                })
            }
        );


        const data = await response.json();


        if (response.ok) {

            registerMessage.textContent =
                "Account created successfully!";

            registerMessage.style.color = "#15803d";


            setTimeout(function () {

                registerForm.classList.add("hidden");
                loginForm.classList.remove("hidden");

                loginUsername.value = username;

                registerUsername.value = "";
                registerPassword.value = "";
                confirmPassword.value = "";

                registerMessage.textContent = "";

            }, 1000);

        } else {

            registerMessage.textContent =
                data.message || "Registration failed.";

            registerMessage.style.color = "#dc2626";
        }


    } catch (error) {

        registerMessage.textContent =
            "Backend connection failed.";

        registerMessage.style.color = "#dc2626";

        console.error(error);

    } finally {

        registerBtn.disabled = false;
        registerBtn.textContent = "Register";
    }
};


// ======================================================
// LOGIN - FLASK BACKEND
// ======================================================

loginBtn.onclick = async function () {

    const username = loginUsername.value.trim();
    const password = loginPassword.value.trim();


    if (username === "" || password === "") {

        loginMessage.textContent =
            "Please enter username and password.";

        loginMessage.style.color = "#dc2626";

        return;
    }


    try {

        loginBtn.disabled = true;
        loginBtn.textContent = "Logging in...";


        const response = await fetch(
            `${API_URL}/login`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    username: username,
                    password: password
                })
            }
        );


        const data = await response.json();


        if (response.ok) {

            // Save only logged-in username
            localStorage.setItem(
                "codeguardUsername",
                username
            );


            authScreen.classList.add("hidden");
            mainApp.classList.remove("hidden");


            welcomeUser.textContent =
                "Hi, " + username + " 👋";


            loginMessage.textContent = "";


            // Load backend data
            await loadTasks();
            await loadBugs();


            window.scrollTo(0, 0);

        } else {

            loginMessage.textContent =
                data.message || "Invalid username or password.";

            loginMessage.style.color = "#dc2626";
        }


    } catch (error) {

        loginMessage.textContent =
            "Backend connection failed.";

        loginMessage.style.color = "#dc2626";

        console.error(error);

    } finally {

        loginBtn.disabled = false;
        loginBtn.textContent = "Login";
    }
};


// ======================================================
// LOGOUT
// ======================================================

logoutBtn.onclick = function () {

    mainApp.classList.add("hidden");
    authScreen.classList.remove("hidden");

    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");

    loginUsername.value = "";
    loginPassword.value = "";

    localStorage.removeItem("codeguardUsername");

    window.scrollTo(0, 0);
};


// ======================================================
// ADD TASK - BACKEND
// ======================================================

addTaskBtn.onclick = async function () {

    const name = taskName.value.trim();
    const status = taskStatus.value;


    if (name === "") {

        taskMessage.textContent =
            "Please enter a task name.";

        taskMessage.style.color = "#dc2626";

        return;
    }


    try {

        addTaskBtn.disabled = true;
        addTaskBtn.textContent = "Adding...";


        const response = await fetch(
            `${API_URL}/tasks`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    task_name: name,
                    status: status
                })
            }
        );


        const data = await response.json();


        if (response.ok) {

            taskName.value = "";

            taskMessage.textContent =
                "Task added successfully!";

            taskMessage.style.color = "#15803d";


            await loadTasks();


            setTimeout(function () {

                taskMessage.textContent = "";

            }, 1500);

        } else {

            taskMessage.textContent =
                data.message || "Failed to add task.";

            taskMessage.style.color = "#dc2626";
        }


    } catch (error) {

        taskMessage.textContent =
            "Backend connection failed.";

        taskMessage.style.color = "#dc2626";

        console.error(error);

    } finally {

        addTaskBtn.disabled = false;
        addTaskBtn.textContent = "Add Task";
    }
};


// ======================================================
// LOAD TASKS FROM DATABASE
// ======================================================

async function loadTasks() {

    try {

        const response = await fetch(
            `${API_URL}/tasks`
        );


        const tasks = await response.json();


        taskList.innerHTML = "";


        tasks.forEach(function (task) {

            const li = document.createElement("li");

            li.setAttribute(
                "data-status",
                task.status
            );


            let badgeClass = "pending";


            if (task.status === "Completed") {
                badgeClass = "completed";
            }


            if (task.status === "In Progress") {
                badgeClass = "progress-badge";
            }


            li.innerHTML = `
                <div>
                    <strong>${escapeHTML(task.task_name)}</strong>
                    <small>Added project task</small>
                </div>

                <span class="badge ${badgeClass}">
                    ${escapeHTML(task.status)}
                </span>
            `;


            taskList.appendChild(li);
        });


        updateTaskCount();


    } catch (error) {

        console.error(
            "Error loading tasks:",
            error
        );
    }
}


// ======================================================
// UPDATE TASK COUNT
// ======================================================

function updateTaskCount() {

    const count =
        taskList.querySelectorAll("li").length;


    taskCount.textContent =
        count + (count === 1 ? " Task" : " Tasks");


    totalTasks.textContent = count;
}


// ======================================================
// ADD BUG - BACKEND
// ======================================================

addBugBtn.onclick = async function () {

    const title = bugTitle.value.trim();
    const severity = bugSeverity.value;


    if (title === "") {

        bugMessage.textContent =
            "Please enter a bug title.";

        bugMessage.style.color = "#dc2626";

        return;
    }


    try {

        addBugBtn.disabled = true;
        addBugBtn.textContent = "Adding...";


        const response = await fetch(
            `${API_URL}/bugs`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    title: title,
                    severity: severity
                })
            }
        );


        const data = await response.json();


        if (response.ok) {

            bugTitle.value = "";

            bugMessage.textContent =
                "Bug added successfully!";

            bugMessage.style.color = "#15803d";


            await loadBugs();


            setTimeout(function () {

                bugMessage.textContent = "";

            }, 1500);

        } else {

            bugMessage.textContent =
                data.message || "Failed to add bug.";

            bugMessage.style.color = "#dc2626";
        }


    } catch (error) {

        bugMessage.textContent =
            "Backend connection failed.";

        bugMessage.style.color = "#dc2626";

        console.error(error);

    } finally {

        addBugBtn.disabled = false;
        addBugBtn.textContent = "Add Bug";
    }
};


// ======================================================
// LOAD BUGS FROM DATABASE
// ======================================================

async function loadBugs() {

    try {

        const response = await fetch(
            `${API_URL}/bugs`
        );


        const bugs = await response.json();


        bugList.innerHTML = "";


        bugs.forEach(function (bug) {

            const li = document.createElement("li");


            li.setAttribute(
                "data-severity",
                bug.severity
            );


            let badgeClass = "low";


            if (bug.severity === "Medium") {
                badgeClass = "medium";
            }


            if (bug.severity === "Critical") {
                badgeClass = "critical";
            }


            li.innerHTML = `
                <div>
                    <strong>${escapeHTML(bug.title)}</strong>
                    <small>New project issue</small>
                </div>

                <span class="badge ${badgeClass}">
                    ${escapeHTML(bug.severity)}
                </span>
            `;


            bugList.appendChild(li);
        });


        updateBugCount();


    } catch (error) {

        console.error(
            "Error loading bugs:",
            error
        );
    }
}


// ======================================================
// UPDATE BUG COUNT
// ======================================================

function updateBugCount() {

    const count =
        bugList.querySelectorAll("li").length;


    bugCount.textContent =
        count + (count === 1 ? " Bug" : " Bugs");


    totalBugs.textContent = count;
}


// ======================================================
// ANALYZE PROJECT RISK - BACKEND
// ======================================================

analyzeBtn.onclick = async function () {

    try {

        analyzeBtn.disabled = true;
        analyzeBtn.textContent = "Analyzing...";


        const response = await fetch(
            `${API_URL}/risk`
        );


        const data = await response.json();


        if (response.ok) {

            riskValue.textContent =
                data.risk;


            healthStatus.textContent =
                data.status;


            if (data.risk === "High") {

                healthIcon.textContent = "🔴";

                riskMessage.textContent =
                    "Critical issue(s) detected in the project.";
            }


            else if (data.risk === "Medium") {

                healthIcon.textContent = "🟠";

                riskMessage.textContent =
                    "Medium issue(s) detected in the project.";
            }


            else {

                healthIcon.textContent = "🟢";

                riskMessage.textContent =
                    "Project risk is currently low.";
            }

        } else {

            riskMessage.textContent =
                "Unable to analyze project risk.";
        }


    } catch (error) {

        riskMessage.textContent =
            "Backend connection failed.";

        console.error(error);

    } finally {

        analyzeBtn.disabled = false;
        analyzeBtn.textContent = "Analyze Project Risk";
    }
};


// ======================================================
// ENTER KEY SUPPORT - LOGIN
// ======================================================

loginPassword.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            loginBtn.click();
        }
    }
);


// ======================================================
// ENTER KEY SUPPORT - REGISTER
// ======================================================

registerPassword.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            registerBtn.click();
        }
    }
);


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHTML(value) {

    const div = document.createElement("div");

    div.textContent = value;

    return div.innerHTML;
}


// ======================================================
// INITIAL COUNTS
// ======================================================

updateTaskCount();
updateBugCount();