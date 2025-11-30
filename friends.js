// Freundesliste speichern
export function addFriend(friendUsername) {
  if (!friendUsername) return alert("Gib einen Benutzernamen ein!");

  let friends = JSON.parse(localStorage.getItem("entwurf_friends")) || [];

  if (friends.includes(friendUsername)) {
    return alert("Dieser Freund existiert schon!");
  }

  friends.push(friendUsername);
  localStorage.setItem("entwurf_friends", JSON.stringify(friends));
  return friends;
}

// Freunde abrufen
export function getFriends() {
  return JSON.parse(localStorage.getItem("entwurf_friends")) || [];
}

// Chat mit Freund öffnen
export function openChatWith(friendUsername) {
  localStorage.setItem("entwurf_active_chat", friendUsername);
  window.location.reload();
}

// aktiven Chat abrufen
export function getActiveChat() {
  return localStorage.getItem("entwurf_active_chat");
}
