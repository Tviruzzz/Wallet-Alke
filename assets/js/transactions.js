document.addEventListener("DOMContentLoaded", function () {
  // Validacion
  if (localStorage.getItem("logged") !== "true") {
    window.location.href = "login.html";
    return;
  }

  // Cargar transferencias
  loadAllTransactions();

  // Filtros
  initializeFilters();

  //Boton de descarga
  $("#exportBtn").on("click", exportTransactions);
});

// ===== Cargar todas las transferencias =====
function loadAllTransactions() {
  displayTransactions();
  calculateStatistics();
}

// =====NMostrar transferencias =====
function displayTransactions(filterType = "", filterText = "") {
  const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  const $container = $("#transactionsList");

  if (transactions.length === 0) {
    $container.html(`
      <div class="text-center py-5">
        <i class="fas fa-inbox" style="font-size: 3rem; opacity: 0.3;"></i>
        <p class="text-muted mt-3">No hay transacciones registradas</p>
      </div>
    `);
    return;
  }

  // Filtro
  let filtered = transactions;

  if (filterType) {
    filtered = filtered.filter((t) => t.type === filterType);
  }

  if (filterText) {
    const lowerText = filterText.toLowerCase();
    filtered = filtered.filter(
      (t) => t.description && t.description.toLowerCase().includes(lowerText),
    );
  }

  if (filtered.length === 0) {
    $container.html(`
      <div class="text-center py-5">
        <p class="text-muted"><i class="fas fa-search"></i> No se encontraron transacciones</p>
      </div>
    `);
    return;
  }

  // Ordenar por la mas reciente
  filtered.sort((a, b) => b.timestamp - a.timestamp);

  let html = '<div class="transaction-list">';

  filtered.forEach((tx, index) => {
    const icon = getTransactionIcon(tx.type);
    const colorClass = getTransactionColor(tx.type);
    const amountSign =
      tx.type === "deposito" || tx.type === "recepcion" ? "+" : "-";
    const date = new Date(tx.timestamp).toLocaleString("es-ES");

    html += `
      <div class="transaction-item ${tx.type}" data-id="${tx.id}">
        <div class="d-flex align-items-center gap-3 flex-grow-1">
          <div class="transaction-icon ${colorClass}">
            ${icon}
          </div>
          <div class="transaction-details flex-grow-1">
            <h6 class="mb-0">${capitalizeFirst(tx.type)}</h6>
            <small class="text-muted">${tx.description || "--"}</small>
            <br>
            <small class="text-muted" style="font-size: 0.75rem;">${date}</small>
          </div>
        </div>
        <div class="transaction-amount ${tx.type === "deposito" || tx.type === "recepcion" ? "positive" : "negative"}">
          ${amountSign}$${formatCurrency(tx.amount)}
        </div>
      </div>
    `;
  });

  html += "</div>";
  $container.html(html);

  $(".transaction-item").on("click", function () {
    const id = $(this).data("id");
    showTransactionDetails(id);
  });
}

// =====Calculos de estadisticas=====
function calculateStatistics() {
  const transactions = JSON.parse(localStorage.getItem("transactions")) || [];

  let totalDeposits = 0;
  let totalSent = 0;
  let totalReceived = 0;

  transactions.forEach((tx) => {
    if (tx.type === "deposito") {
      totalDeposits += tx.amount;
    } else if (tx.type === "envio") {
      totalSent += tx.amount;
    } else if (tx.type === "recepcion") {
      totalReceived += tx.amount;
    }
  });

  $("#totalDeposits").text(formatCurrency(totalDeposits));
  $("#totalSent").text(formatCurrency(totalSent));
  $("#totalReceived").text(formatCurrency(totalReceived));
}

// ===== Filtros =====
function initializeFilters() {
  // filtro pore tipo
  $("#filterType").on("change", function () {
    const filterType = $(this).val();
    const filterText = $("#filterInput").val();
    displayTransactions(filterType, filterText);
  });

  // Filtro por texto
  let filterTimeout;
  $("#filterInput").on("input", function () {
    clearTimeout(filterTimeout);
    const filterText = $(this).val();
    const filterType = $("#filterType").val();

    filterTimeout = setTimeout(() => {
      displayTransactions(filterType, filterText);
    }, 300);
  });
}

// ===== Detalles de transaciones =====
function showTransactionDetails(id) {
  const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  const transaction = transactions.find((t) => t.id === id);

  if (transaction) {
    alert(
      `Detalles de la Transacción\n` +
        `------------------------\n` +
        `Tipo: ${capitalizeFirst(transaction.type)}\n` +
        `Monto: $${formatCurrency(transaction.amount)}\n` +
        `Descripción: ${transaction.description || "N/A"}\n` +
        `Fecha: ${transaction.date}`,
    );
  }
}

// =====Exportar transaciones =====
function exportTransactions() {
  const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  const userData = {
    usuario: localStorage.getItem("userName"),
    email: localStorage.getItem("userEmail"),
    saldo: localStorage.getItem("balance"),
    fechaExportacion: new Date().toLocaleString("es-ES"),
    transacciones: transactions,
  };

  const jsonString = JSON.stringify(userData, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `alke-wallet-historial-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  a.remove();

  // Confirmacion
  showAlert("Historial descargado correctamente", "success");
}
