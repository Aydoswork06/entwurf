// Gast Account erstellen + merken
export function guestLogin(username) {
  if (!username) return alert("Gib einen Benutzernamen ein!");

  const guestUser = {
    name: username,
    id: "guest_" + Date.now(),
  };

  // local speichern, damit du wieder rein kannst
  localStorage.setItem("entwurf_user", JSON.stringify(guestUser));
  window.location.reload();
}

// gespeicherten User abrufen
export function getCurrentUser() {
  const user = localStorage.getItem("entwurf_user");
  return user ? JSON.parse(user) : null;
}

// logout wieder Gast zutritt ermöglichen
export function logoutUser() {
  localStorage.removeItem("entwurf_user");
  window.location.reload();
}

