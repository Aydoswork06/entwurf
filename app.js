// Username Auto ohne Popup
let currentUser = localStorage.getItem("entwurf_username");
if (!currentUser) {
  currentUser = "User_" + Math.floor(Math.random() * 100000);
  localStorage.setItem("entwurf_username", currentUser);
}

// DOM holen (korrekte IDs!)
const newChatInput = document.getElementById("chatPartnerInput"); 
const createChatBtn = document.getElementById("createChatBtn"); 
const currentChatLabel = document.getElementById("activeChatTitle"); 
const messageContainer = document.getElementById("chatMessages"); 
const messageInput = document.getElementById("messageInput"); 
const messageForm = document.getElementById("sendForm"); 

// Chat ID builder
function makeChatId(a, b) {
  return [a, b].sort().join("__");
}

let activePartner = null;

// Chat erstellen
createChatBtn?.addEventListener("click", () => {
  const partner = newChatInput.value.trim();
  if (!partner || partner === currentUser) return alert("Ungültiger User");

  activePartner = partner;
  currentChatLabel.textContent = partner;
  newChatInput.value = "";
  startPolling();
});

// Nachrichten abrufen (nur 7 anzeigen)
async function loadMessages() {
  if (!activePartner || !window.supabase) return;

  const chatId = makeChatId(currentUser, activePartner);
  const { data } = await window.supabase
    .from("messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  renderMessages(data?.slice(-7) || []);
}

// Nachrichten rendern
function renderMessages(msgs) {
  messageContainer.innerHTML = "";
  msgs.forEach((m) => {
    const d = document.createElement("div");
    d.className = m.sender === currentUser ? "msg me" : "msg";
    d.textContent = m.text;
    messageContainer.append(d);
  });
  messageContainer.scrollTop = messageContainer.scrollHeight;
}

// Polling starten
function startPolling() {
  loadMessages();
  if (pollInterval) clearInterval(pollInterval);
  pollInterval = setInterval(loadMessages, 2000);
}

let pollInterval = null;

// Nachricht senden
messageForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  sendMessage(messageInput.value);
});

async function sendMessage(text) {
  if (!text.trim()) return;
  if (!activePartner) return alert("Kein Chat Partner");

  const chatId = makeChatId(currentUser, activePartner);
  await window.supabase.from("messages").insert({
    chat_id: chatId,
    sender: currentUser,
    text: text.trim(),
  });

  messageInput.value = "";
  loadMessages();
}

// First load
document.getElementById("currentUserLabel").textContent = currentUser;
