// Einfacher 2-Handy-Chat mit Supabase
// ===================================

// 1. Username holen oder neu fragen
let currentUser = localStorage.getItem("entwurf_username");

if (!currentUser) {
  currentUser = prompt("Wähle einen Benutzernamen:");
  if (!currentUser || !currentUser.trim()) {
    currentUser = "Gast_" + Math.floor(Math.random() * 9999);
  }
  currentUser = currentUser.trim();
  localStorage.setItem("entwurf_username", currentUser);
}

// 2. Basis-Elemente im DOM holen
const userLabel = document.getElementById("currentUserLabel");
const chatList = document.getElementById("chatList");
const newChatInput = document.getElementById("newChatInput");
const newChatBtn = document.getElementById("newChatBtn");
const currentChatLabel = document.getElementById("currentChatLabel");
const messageContainer = document.getElementById("messageContainer");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const sendMessageBtn = document.getElementById("sendMessageBtn");

if (userLabel) {
  userLabel.textContent = currentUser;
}

// 3. Aktiver Gesprächspartner (der andere User)
let activePartner = null;
let pollInterval = null;

// kleine Helfer-Funktion für Chat-ID (gleiche ID für beide User)
function makeChatId(userA, userB) {
  const sorted = [userA, userB].sort();
  return `${sorted[0]}__${sorted[1]}`;
}

// 4. Chatliste rendern (nur aktuell gewählter Partner)
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

// 5. Nachrichten in den Chat zeichnen
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

  // auto nach unten scrollen
  messageContainer.scrollTop = messageContainer.scrollHeight;
}

// 6. Nachrichten vom Server holen (nur letzter 7)
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

  // nur die letzten 7 anzeigen
  const lastSeven = data.slice(-7);
  renderMessages(lastSeven);
}

// 7. Polling starten (alle 2 Sekunden neue Nachrichten holen)
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

// 9. Events für neuen Chat & Formular
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

// Beim Laden: falls es schon einen gespeicherten Partner gäbe, könntest du hier was tun.
// Für jetzt startet man einfach über das Feld "Kontakt-ID" oben links.
