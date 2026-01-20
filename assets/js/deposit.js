// ===== Deposito =====
document.addEventListener("DOMContentLoaded", function () {
  // Autorizacion
  if (localStorage.getItem("logged") !== "true") {
    window.location.href = "login.html";
    return;
  }

  $("#depositForm").on("submit", function (e) {
    e.preventDefault();
    processDeposit();
  });

  // Validacion
  $("#depositAmount").on("input", function () {
    validateDepositAmount();
  });

  $("#depositMethod").on("change", function () {
    validateDepositMethod();
  });
});

// =====Proceso de deposito=====
function processDeposit() {
  const amount = $("#depositAmount").val().trim();
  const method = $("#depositMethod").val();
  const confirmed = $("#confirmDeposit").is(":checked");
  const $msg = $("#depositMsg");

  // Validacion
  if (!amount || !method) {
    showDepositMessage("Por favor completa todos los campos", "danger");
    return;
  }

  if (!confirmed) {
    showDepositMessage("Debes confirmar el depósito", "danger");
    return;
  }

  const amountValidation = validateAmount(amount);
  if (!amountValidation.valid) {
    showDepositMessage(amountValidation.message, "danger");
    return;
  }

  // Desactivar boton
  const $btn = $('#depositForm button[type="submit"]');
  const originalText = $btn.html();
  $btn
    .prop("disabled", true)
    .html('<i class="fas fa-spinner fa-spin"></i> Procesando...');

  // Simulaacion
  setTimeout(() => {
    const numAmount = parseFloat(amount);

    // Agregar transferencia
    addTransaction("deposito", numAmount, `Depósito por ${method}`);

    // Actualizar valor
    const newBalance = updateBalance(numAmount, "add");

    // Mostrar mensaje correcto
    showDepositMessage(
      `¡Depósito de $${formatCurrency(numAmount)} realizado exitosamente!<br>Nuevo saldo: $${formatCurrency(newBalance)}`,
      "success",
    );

    // Resetear
    $("#depositForm")[0].reset();
    $btn.prop("disabled", false).html(originalText);

    setTimeout(() => {
      window.location.href = "menu.html";
    }, 2000);
  }, 1500);
}

// ===== VValidar deposito =====
function validateDepositAmount() {
  const amount = $("#depositAmount").val();
  const validation = validateAmount(amount);

  if (amount && !validation.valid) {
    $("#depositAmount").addClass("is-invalid");
  } else {
    $("#depositAmount").removeClass("is-invalid");
  }
}

// ===== Validar metodo de deposito =====
function validateDepositMethod() {
  const method = $("#depositMethod").val();

  if (method) {
    $("#depositMethod").removeClass("is-invalid");
  }
}

// ===== Mostrar mensaje =====
function showDepositMessage(message, type = "info") {
  const $msg = $("#depositMsg");
  $msg.html(message);
  $msg.removeClass("neon-green neon-blue neon-red");

  if (type === "success") {
    $msg.addClass("neon-green");
  } else if (type === "danger") {
    $msg.addClass("neon-red");
  } else {
    $msg.addClass("neon-blue");
  }

  $msg.fadeIn();
}
