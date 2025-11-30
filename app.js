// ENTWURF – simpler 2-Handy-Chat mit Supabase
// ==========================================

// 1. Username automatisch vergeben (ohne hässliches Popup)
let currentUser = localStorage.getItem("entwurf_username");

if (!currentUser) {
  currentUser = "User_" + Math.floor(Math.random() * 100000);
  localStorage.setItem("entwurf_username", currentUser);
}

// 2. DOM-Elemente holen
const userLabel = document.getElementById("currentUserLabel");
const chatList = document.getElementById("chatList");
const newChatInput = document.getElementById("newChatInput");
const newChatBtn = document.getElementById("createChatBtn"); // <– WICHTIG: Button-ID
const currentChatLabel = document.getElementById("currentChatLabel");
const messageContainer = document.getElementById("messageContainer");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const sendMessageBtn = document.getElementById("sendMessageBtn");

if (userLabel) {
  userLabel.textContent = currentUser;
}

// 3. Aktiver Gesprächspartner
let activePartner = null;
let pollInterval = null;

// Helfer: gleiche Chat-ID für beide User
function makeChatId(userA, userB) {
  const sorted = [userA, userB].sort();
  return `${sorted[0]}__${sorted[1]}`;
}

// 4. Chatliste (nur 1 aktiver Chat)
function renderChatList() {
  if (!chatList) return;
  chatList.innerHTML = "";

  if (!activePartner) return;

  const li = document.createElement("li");
  li.textContent = activePartner;
  li.classList.add("active");
  li.addEventListener("click", () => {
    startPolling();
  });
  chatList.appendChild(li);
}

// 5. Nachrichten im Chat anzeigen
function renderMessages(messages) {
  if (!messageContainer) return;
  messageContainer.innerHTML = "";

  messages.forEach((msg) => {
    const div = document.createElement("div");
    div.classList.add("message");
    if (msg.sender === currentUser) {
      div.classList.add("me");
    } else {
      div.classList.add("other");
    }
    div.textContent = msg.text;
    messageContainer.appendChild(div);
  });

  messageContainer.scrollTop = messageContainer.scrollHeight;
}

// 6. Nachrichten vom Server (nur letzte 7)
async function loadMessages() {
  if (!activePartner || !window.supabase) return;

  const chatId = makeChatId(currentUser, activePartner);

  const { data, error } = await window.supabase
    .from("messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Fehler beim Laden:", error);
    return;
  }

  const lastSeven = data.slice(-7);
  renderMessages(lastSeven);
}

// 7. Polling starten (alle 2 Sekunden)
function startPolling() {
  if (!activePartner) return;

  if (currentChatLabel) {
    currentChatLabel.textContent = activePartner;
  }

  if (messageInput && sendMessageBtn) {
    messageInput.disabled = false;
    sendMessageBtn.disabled = false;
  }

  renderChatList();
  loadMessages();

  if (pollInterval) clearInterval(pollInterval);
  pollInterval = setInterval(loadMessages, 2000);
}

// 8. Nachricht senden
async function sendMessage(text) {
  if (!text || !text.trim()) return;
  if (!activePartner) {
    alert("Wähle zuerst einen Chat-Partner.");
    return;
  }
  if (!window.supabase) {
    alert("Supabase ist nicht verbunden.");
    return;
  }

  const chatId = makeChatId(currentUser, activePartner);

  const { error } = await window.supabase.from("messages").insert({
    chat_id: chatId,
    sender: currentUser,
    text: text.trim(),
  });

  if (error) {
    console.error("Fehler beim Senden:", error);
    alert("Konnte Nachricht nicht senden.");
    return;
  }

  messageInput.value = "";
  await loadMessages();
}

// 9. Events: neuen Chat anlegen + Formular
if (newChatBtn && newChatInput) {
  newChatBtn.addEventListener("click", () => {
    const partner = newChatInput.value.trim();
    if (!partner) return;
    if (partner === currentUser) {
      alert("Du kannst keinen Chat mit dir selbst starten.");
      return;
    }
    activePartner = partner;
    newChatInput.value = "";
    startPolling();
  });
}

if (messageForm && messageInput) {
  messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    sendMessage(messageInput.value);
  });
}

if (sendMessageBtn && messageInput) {
  sendMessageBtn.addEventListener("click", () => {
    sendMessage(messageInput.value);
  });
}
