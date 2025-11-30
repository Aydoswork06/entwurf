// *************** BASIC STATE ****************
const currentUser = "Du"; // MVP: später Login-System
let chats = []; // { id, name, messages: [] }
let activeChatId = null;

const MAX_MESSAGES_PER_CHAT = 7;

// *************** DOM ELEMENTS ****************
const currentUserLabel = document.getElementById("currentUserLabel");
const chatPartnerInput = document.getElementById("chatPartnerInput");
const createChatBtn = document.getElementById("createChatBtn");
const chatListEl = document.getElementById("chatList");
const activeChatTitleEl = document.getElementById("activeChatTitle");
const messageContainerEl = document.getElementById("messageContainer");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");

// *************** INIT ****************
function loadFromStorage() {
  try {
    const raw = localStorage.getItem("entwurf_chats");
    if (raw) {
      chats = JSON.parse(raw);
    }
  } catch (err) {
    console.error("Fehler beim Laden aus localStorage:", err);
    chats = [];
  }
}

function saveToStorage() {
  try {
    localStorage.setItem("entwurf_chats", JSON.stringify(chats));
  } catch (err) {
    console.error("Fehler beim Speichern:", err);
  }
}

function init() {
  currentUserLabel.textContent = `Eingeloggt als: ${currentUser}`;
  loadFromStorage();
  renderChatList();
  if (chats.length > 0) {
    setActiveChat(chats[0].id);
  }
}

init();

// *************** CHAT HANDLING ****************

function createChat(name) {
  const trimmed = name.trim();
  if (!trimmed) return;

  const newChat = {
    id: Date.now().toString(),
    name: trimmed,
    messages: []
  };

  chats.unshift(newChat);
  saveToStorage();
  renderChatList();
  setActiveChat(newChat.id);
  chatPartnerInput.value = "";
}

function setActiveChat(chatId) {
  activeChatId = chatId;
  const chat = chats.find(c => c.id === chatId);
  if (!chat) {
    activeChatTitleEl.textContent = "Kein Chat ausgewählt";
    messageContainerEl.innerHTML = "";
    return;
  }

  activeChatTitleEl.textContent = chat.name;
  renderMessages(chat);
  highlightActiveChat(chatId);
}

function highlightActiveChat(chatId) {
  const items = chatListEl.querySelectorAll("li");
  items.forEach(li => {
    if (li.dataset.id === chatId) {
      li.classList.add("active");
    } else {
      li.classList.remove("active");
    }
  });
}

function renderChatList() {
  chatListEl.innerHTML = "";
  chats.forEach(chat => {
    const li = document.createElement("li");
    li.dataset.id = chat.id;
    li.innerHTML = `
      <span>${chat.name}</span>
    `;
    li.addEventListener("click", () => setActiveChat(chat.id));
    chatListEl.appendChild(li);
  });
}

function renderMessages(chat) {
  messageContainerEl.innerHTML = "";
  chat.messages.forEach(msg => {
    const div = document.createElement("div");
    div.classList.add("message");
    div.classList.add(msg.from === currentUser ? "me" : "other");
    div.textContent = msg.text;
    messageContainerEl.appendChild(div);
  });
  messageContainerEl.scrollTop = messageContainerEl.scrollHeight;
}

function addMessageToActiveChat(text) {
  const chat = chats.find(c => c.id === activeChatId);
  if (!chat) return;

  chat.messages.push({
    id: Date.now().toString(),
    from: currentUser,
    text: text.trim(),
    createdAt: new Date().toISOString()
  });

  // Entwurf-Mechanik: nur die letzten X Nachrichten bleiben
  if (chat.messages.length > MAX_MESSAGES_PER_CHAT) {
    chat.messages = chat.messages.slice(
      chat.messages.length - MAX_MESSAGES_PER_CHAT
    );
  }

  saveToStorage();
  renderMessages(chat);
}

// *************** EVENT LISTENERS ****************

createChatBtn.addEventListener("click", () => {
  createChat(chatPartnerInput.value);
});

chatPartnerInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    createChat(chatPartnerInput.value);
  }
});

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!text || !activeChatId) return;
  addMessageToActiveChat(text);
  messageInput.value = "";
});
// Message im aktiven Chat speichern
import { getCurrentUser } from "./auth.js";
import { getActiveChat } from "./friends.js";

export function sendMessage(text) {
  const user = getCurrentUser();
  const chatPartner = getActiveChat();
  if (!user || !chatPartner) {
    return alert("Erst chat auswählen Bruder!");
  }

  let chats = JSON.parse(localStorage.getItem("entwurf_chats")) || {};
  if (!chats[chatPartner]) chats[chatPartner] = [];

  const msg = {
    from: user.name,
    text: text,
    time: new Date().toLocaleTimeString(),
  };

  chats[chatPartner].push(msg);
  localStorage.setItem("entwurf_chats", JSON.stringify(chats));
}
