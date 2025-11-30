// ENTWURF – Supabase Chat Basis
// Username automatisch vergeben (ohne Popup)
let currentUser = localStorage.getItem("entwurf_username");
if (!currentUser) {
  currentUser = "User_" + Math.floor(Math.random() * 100000);
  localStorage.setItem("entwurf_username", currentUser);
}

// DOM-Elemente holen – IDs müssen zu index.html passen!
const newChatInput = document.getElementById("chatPartnerInput");
const createChatBtn = document.getElementById("createChatBtn");
const currentChatLabel = document.getElementById("activeChatTitle");
const messageContainer = document.getElementById("messageContainer");
const messageInput = document.getElementById("messageInput");
const messageForm = document.getElementById("messageForm");
const currentUserLabel = document.getElementById("currentUserLabel");

// Username im Header anzeigen
if (currentUserLabel) {
  currentUserLabel.textContent = currentUser;
}

// Chat-ID Builder (gleicher Chat für beide User)
function makeChatId(a, b) {
  return [a, b].sort().join("__");
}

let activePartner = null;
let pollInterval = null;

// Chat erstellen / Partner setzen
if (createChatBtn && newChatInput) {
  createChatBtn.addEventListener("click", () => {
    const partner = newChatInput.value.trim();
    if (!partner) return;
    if (partner === currentUser) {
      alert("Du kannst keinen Chat mit dir selbst starten.");
      return;
    }

    activePartner = partner;
    newChatInput.value = "";

    if (currentChatLabel) {
      currentChatLabel.textContent = partner;
    }

    startPolling();
  });
}

// Nachrichten vom Server holen (nur letzte 7)
async function loadMessages() {
  if (!activePartner || !window.supabase || !messageContainer) return;

  const chatId = makeChatId(currentUser, activePartner);

  const { data, error } = await window.supabase
    .from("messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Fehler beim Laden der Nachrichten:", error);
    return;
  }

  const msgs = (data || []).slice(-7); // nur letzte 7
  renderMessages(msgs);
}

// Nachrichten ins DOM zeichnen
function renderMessages(msgs) {
  if (!messageContainer) return;

  messageContainer.innerHTML = "";

  msgs.forEach((m) => {
    const d = document.createElement("div");
    d.classList.add("message");
    if (m.sender === currentUser) {
      d.classList.add("me");
    } else {
      d.classList.add("other");
    }
    d.textContent = m.text;
    messageContainer.appendChild(d);
  });

  messageContainer.scrollTop = messageContainer.scrollHeight;
}

// Polling starten (alle 2 Sekunden neue Messages)
function startPolling() {
  if (!activePartner) return;

  loadMessages();

  if (pollInterval) clearInterval(pollInterval);
  pollInterval = setInterval(loadMessages, 2000);
}

// Nachricht senden
if (messageForm && messageInput) {
  messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    sendMessage(messageInput.value);
  });
}

async function sendMessage(text) {
  if (!text || !text.trim()) return;
  if (!activePartner) {
    alert("Kein Chat-Partner ausgewählt.");
    return;
  }
  if (!window.supabase) {
    alert("Supabase nicht verbunden.");
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
    alert("Nachricht konnte nicht gesendet werden.");
    return;
  }

  messageInput.value = "";
  loadMessages();
}
