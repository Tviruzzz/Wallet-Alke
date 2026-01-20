// ===== Validacion =====
document.addEventListener("DOMContentLoaded", function () {
  const currentPage = window.location.pathname;
  const isLoggedIn = localStorage.getItem("logged") === "true";

  // Redireccionar
  if (
    !currentPage.includes("login.html") &&
    !currentPage.includes("index.html") &&
    !isLoggedIn
  ) {
    window.location.href = "login.html";
  }
});

// ===== Funcional =====
if (document.getElementById("loginForm")) {
  $("#loginForm").on("submit", function (e) {
    e.preventDefault();

    const email = $("#email").val().trim();
    const password = $("#password").val().trim();
    const $msg = $("#loginMsg");

    // validacion
    if (!email || !password) {
      showMessage($msg, "Por favor completa todos los campos", "danger");
      return;
    }

    if (!isValidEmail(email)) {
      showMessage($msg, "Por favor ingresa un correo válido", "danger");
      return;
    }

    if (password.length < 6) {
      showMessage(
        $msg,
        "La contraseña debe tener al menos 6 caracteres",
        "danger",
      );
      return;
    }

    // Credenciales de prueb
    if (email === "admin@alke.cl" && password === "Alke1234") {
      // Guardado de informacion
      localStorage.setItem("logged", "true");
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userName", "Usuario Prueba");
      localStorage.setItem("balance", "1000.00");

      if (!localStorage.getItem("transactions")) {
        localStorage.setItem("transactions", JSON.stringify([]));
      }

      if (!localStorage.getItem("contacts")) {
        const defaultContacts = [
          { name: "Juan Pérez", email: "juan@example.com" },
          { name: "María García", email: "maria@example.com" },
          { name: "Carlos López", email: "carlos@example.com" },
          { name: "Ana Martínez", email: "ana@example.com" },
        ];
        localStorage.setItem("contacts", JSON.stringify(defaultContacts));
      }

      showMessage($msg, "Ingreso exitoso. Redirigiendo...", "success");
      setTimeout(() => {
        window.location.href = "menu.html";
      }, 1500);
    } else {
      showMessage(
        $msg,
        "Credenciales inválidas. Intenta con: admin@alke.cl / Alke1234",
        "danger",
      );
    }
  });
}

// ===== Cerrar sesion =====
if (document.getElementById("logoutBtn")) {
  $("#logoutBtn").on("click", function () {
    if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      localStorage.removeItem("logged");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userName");
      window.location.href = "login.html";
    }
  });
}

// ===== Funciones de ayuda =====
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function showMessage(element, message, type = "info") {
  element.html(message);
  element.removeClass("neon-green neon-blue neon-red");

  if (type === "success") {
    element.addClass("neon-green");
  } else if (type === "danger") {
    element.addClass("neon-red");
  } else {
    element.addClass("neon-blue");
  }

  element.fadeIn();
}
