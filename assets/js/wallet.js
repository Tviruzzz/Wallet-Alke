// ===== Wllet =====
document.addEventListener("DOMContentLoaded", function () {
  // Validar
  if (localStorage.getItem("logged") !== "true") {
    window.location.href = "login.html";
    return;
  }

  // Cargar info de usuario
  loadUserInfo();

  // Actualizar balance
  updateBalanceDisplay();

  // Cargar transaciones
  if (document.getElementById("recentTransactions")) {
    loadRecentTransactions();
  }
});

// ===== cargar informacion de usuario =====
function loadUserInfo() {
  const userName = localStorage.getItem("userName") || "Usuario";
  const userEmail = localStorage.getItem("userEmail") || "";

  if (document.getElementById("userName")) {
    $("#userName").text(userName);
  }

  // Actrualizar tiempo
  if (document.getElementById("lastUpdate")) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
    $("#lastUpdate").text(timeStr);
  }
}

// ===== Actualizar balance =====
function updateBalanceDisplay() {
  const balance = parseFloat(localStorage.getItem("balance")) || 0;

  if (document.getElementById("saldo")) {
    $("#saldo").text("$" + formatCurrency(balance));

    $("#saldo").fadeOut(200).fadeIn(200);
  }
}

// ===== Transaciones recientes =====
function loadRecentTransactions() {
  const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  const $container = $("#recentTransactions");

  if (transactions.length === 0) {
    $container.html(
      '<p class="text-muted text-center py-3"><i class="fas fa-inbox"></i> Sin transacciones aún</p>',
    );
    return;
  }

  // Mostrar las 3 ultimas trancsaciones
  const recentTx = transactions.slice(-3).reverse();
  let html = '<div class="table-responsive">';
  html += '<table class="table table-dark table-borderless align-middle mb-0">';
  html +=
    '<thead><tr><th>Tipo</th><th>Descripción</th><th class="text-end">Monto</th></tr></thead>';
  html += "<tbody>";

  recentTx.forEach((tx) => {
    const icon = getTransactionIcon(tx.type);
    const colorClass = getTransactionColor(tx.type);
    const amountSign =
      tx.type === "deposito" || tx.type === "recepcion" ? "+" : "-";

    html += `<tr>
      <td><span class="badge ${colorClass}">${icon} ${capitalizeFirst(tx.type)}</span></td>
      <td class="text-muted small">${tx.description || "--"}</td>
      <td class="text-end fw-bold ${colorClass}">
        ${amountSign}$${formatCurrency(tx.amount)}
      </td>
    </tr>`;
  });

  html += "</tbody></table></div>";
  $container.html(html);
}

// ===== Formato de moneda =====
function formatCurrency(amount) {
  return parseFloat(amount)
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function getTransactionIcon(type) {
  const icons = {
    deposito: '<i class="fas fa-arrow-down"></i>',
    envio: '<i class="fas fa-paper-plane"></i>',
    recepcion: '<i class="fas fa-inbox"></i>',
  };
  return icons[type] || '<i class="fas fa-exchange"></i>';
}

// ===== Color de transacion=====
function getTransactionColor(type) {
  const colors = {
    deposito: "neon-blue",
    envio: "neon-red",
    recepcion: "neon-green",
  };
  return colors[type] || "neon-blue";
}

// ===== Primera letra mayuscula =====
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ===== Agrewgar transacion =====
function addTransaction(type, amount, description = "") {
  const transactions = JSON.parse(localStorage.getItem("transactions")) || [];

  const transaction = {
    id: Date.now(),
    type: type,
    amount: parseFloat(amount),
    description: description,
    date: new Date().toLocaleString("es-ES"),
    timestamp: Date.now(),
  };

  transactions.push(transaction);
  localStorage.setItem("transactions", JSON.stringify(transactions));

  return transaction;
}

// =====Actualizar balance=====
function updateBalance(amount, operation = "add") {
  let balance = parseFloat(localStorage.getItem("balance")) || 0;

  if (operation === "add") {
    balance += parseFloat(amount);
  } else if (operation === "subtract") {
    balance -= parseFloat(amount);
    if (balance < 0) balance = 0;
  }

  balance = Math.round(balance * 100) / 100;
  localStorage.setItem("balance", balance.toString());

  updateBalanceDisplay();

  return balance;
}

// ===== Buscar contactos =====
function getContacts() {
  return JSON.parse(localStorage.getItem("contacts")) || [];
}

function addContact(name, email) {
  const contacts = getContacts();

  if (contacts.some((c) => c.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, message: "Este contacto ya existe" };
  }

  const contact = { name: name, email: email };
  contacts.push(contact);
  localStorage.setItem("contacts", JSON.stringify(contacts));

  return {
    success: true,
    message: "Contacto agregado correctamente",
    contact: contact,
  };
}

function validateAmount(amount) {
  const num = parseFloat(amount);

  if (isNaN(num) || num <= 0) {
    return { valid: false, message: "El monto debe ser mayor a 0" };
  }

  if (num < 0.01) {
    return { valid: false, message: "El monto mínimo es $0.01" };
  }

  if (num > 999999.99) {
    return { valid: false, message: "El monto no puede exceder $999,999.99" };
  }

  return { valid: true };
}

// ===== mostrar alerta =====
function showAlert(message, type = "info") {
  const alertClass =
    {
      success: "alert-success",
      danger: "alert-danger",
      warning: "alert-warning",
      info: "alert-info",
    }[type] || "alert-info";

  const html = `<div class="alert ${alertClass} alert-dismissible fade show" role="alert">
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  </div>`;

  $("main").prepend(html);

  setTimeout(() => {
    $(".alert").fadeOut(() => $(".alert").remove());
  }, 5000);
}
