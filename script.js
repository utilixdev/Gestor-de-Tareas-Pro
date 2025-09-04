// ==========================
// Variables i setup inicial
// ==========================
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// Notificacions navegador
if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}

// ==========================
// Renderitzar tasques
// ==========================
function renderTasks() {
  const list = document.getElementById("task-list");
  list.innerHTML = "";

  tasks.forEach(task => {
    const li = document.createElement("li");
    li.className = `task ${task.priority}`;
    if (task.completed) li.classList.add("completed");

    // Info principal
    const span = document.createElement("span");
    span.textContent = `${task.text} ${task.deadline ? "⏰ " + new Date(task.deadline).toLocaleString() : ""}`;
    li.appendChild(span);

    // Botons acció
    const actions = document.createElement("div");
    actions.className = "task-actions";

    const completeBtn = document.createElement("button");
    completeBtn.textContent = "✔";
    completeBtn.onclick = () => toggleComplete(task.id);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑";
    deleteBtn.onclick = () => deleteTask(task.id);

    actions.appendChild(completeBtn);
    actions.appendChild(deleteBtn);
    li.appendChild(actions);

    list.appendChild(li);
  });
}

// ==========================
// Guardar i actualitzar
// ==========================
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
}

// ==========================
// Afegir nova tasca
// ==========================
document.getElementById("task-form").addEventListener("submit", e => {
  e.preventDefault();
  const text = document.getElementById("task-input").value.trim();
  const deadline = document.getElementById("task-deadline").value;
  const priority = document.getElementById("task-priority").value;
  const category = document.getElementById("task-category").value.trim();

  if (!text) return;

  const newTask = {
    id: Date.now(),
    text,
    deadline,
    priority,
    category,
    completed: false,
    notified: false
  };

  tasks.push(newTask);
  saveTasks();
  e.target.reset();
});

// ==========================
// Funcions acció
// ==========================
function toggleComplete(id) {
  tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
  saveTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
}

document.getElementById("clear-tasks").addEventListener("click", () => {
  if (confirm("¿Borrar todas las tareas?")) {
    tasks = [];
    saveTasks();
  }
});

// ==========================
// Exportar / Importar
// ==========================
document.getElementById("export").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(tasks)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "tareas.json";
  a.click();
});

document.getElementById("import").addEventListener("change", e => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    tasks = JSON.parse(reader.result);
    saveTasks();
  };
  reader.readAsText(file);
});

// ==========================
// Recordatoris i alarma
// ==========================
function checkReminders() {
  const now = new Date();
  tasks.forEach(task => {
    if (task.deadline && !task.completed) {
      const deadline = new Date(task.deadline);
      const diff = deadline - now;

      const li = document.querySelector(`#task-list li:nth-child(${tasks.indexOf(task)+1})`);
      if (!li) return;

      if (diff <= 5*60*1000 && diff > 0) {
        li.classList.add("warning");
      }
      if (diff <= 0 && !task.notified) {
        li.classList.add("alarm");

        // Notificació navegador
        if (Notification.permission === "granted") {
          new Notification("⏰ Recordatorio", { body: task.text });
        }
        // So alarma
        const audio = new Audio("alarm.mp3");
        audio.play();

        task.notified = true;
        saveTasks();
      }
    }
  });
}
setInterval(checkReminders, 30000);

// ==========================
// Banner de cookies
// ==========================
const cookieBanner = document.getElementById("cookie-banner");
if (!localStorage.getItem("cookiesAccepted")) {
  cookieBanner.style.display = "flex";
}
document.getElementById("accept-cookies").addEventListener("click", () => {
  localStorage.setItem("cookiesAccepted", "true");
  cookieBanner.style.display = "none";
});

// ==========================
// Mode clar/fosc
// ==========================
document.getElementById("toggle-theme").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// Render inicial
renderTasks();
