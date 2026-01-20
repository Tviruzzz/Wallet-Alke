// ===== ENvio de dinero=====
document.addEventListener("DOMContentLoaded", function () {
  if (localStorage.getItem("logged") !== "true") {
    window.location.href = "login.html";
    return;
  }

  // Autorelleno
  initializeContactAutocomplete();

  $("#sendForm").on("submit", function (e) {
    e.preventDefault();
    processSendMoney();
  });

  // Nuevo contacto
  $("#newContactForm").on("submit", function (e) {
    e.preventDefault();
    addNewContact();
  });

  // Reseteo de correo
  $("#contact").on("input", function () {
    if (!$(this).val()) {
      $("#recipientEmail").val("");
    }
  });

  // Validacion
  $("#sendAmount").on("input", function () {
    validateSendAmount();
  });
});

// =====Iniciar proceso de autorellenmop =====
function initializeContactAutocomplete() {
  const contacts = getContacts();
  const contactNames = contacts.map((c) => ({
    label: c.name,
    value: c.name,
    email: c.email,
  }));

  $("#contact").autocomplete({
    source: contactNames,
    select: function (event, ui) {
      $("#contact").val(ui.item.label);
      $("#recipientEmail").val(ui.item.email);
      return false;
    },
    minLength: 1,
  });
}

// ===== Enviar dinero =====
function processSendMoney() {
  const contact = $("#contact").val().trim();
  const recipientEmail = $("#recipientEmail").val().trim();
  const amount = $("#sendAmount").val().trim();
  const description = $("#description").val().trim();
  const confirmed = $("#confirmSend").is(":checked");
  const $msg = $("#sendMsg");

  // Validacion
  if (!contact || !recipientEmail || !amount) {
    showSendMessage(
      "Por favor completa todos los campos obligatorios",
      "danger",
    );
    return;
  }

  if (!confirmed) {
    showSendMessage("Debes confirmar el envío", "danger");
    return;
  }

  const amountValidation = validateAmount(amount);
  if (!amountValidation.valid) {
    showSendMessage(amountValidation.message, "danger");
    return;
  }

  const currentBalance = parseFloat(localStorage.getItem("balance")) || 0;
  const numAmount = parseFloat(amount);

  // Balance
  if (currentBalance < numAmount) {
    showSendMessage(
      `Saldo insuficiente. Tu saldo es: $${formatCurrency(currentBalance)}`,
      "danger",
    );
    return;
  }

  //desactivar boton
  const $btn = $('#sendForm button[type="submit"]');
  const originalText = $btn.html();
  $btn
    .prop("disabled", true)
    .html('<i class="fas fa-spinner fa-spin"></i> Procesando...');

  // Simular
  setTimeout(() => {
    // Agregar simulacion
    const desc = description || `Transferencia a ${contact}`;
    addTransaction("envio", numAmount, desc);

    //Restar si requioere
    const newBalance = updateBalance(numAmount, "subtract");

    showSendMessage(
      `¡Transferencia de $${formatCurrency(numAmount)} enviada a ${contact}!<br>Nuevo saldo: $${formatCurrency(newBalance)}`,
      "success",
    );

    // Reseteo
    $("#sendForm")[0].reset();
    $("#recipientEmail").val("");
    $btn.prop("disabled", false).html(originalText);

    setTimeout(() => {
      window.location.href = "menu.html";
    }, 2000);
  }, 1500);
}

// ===== Agregar contacto =====
function addNewContact() {
  const name = $("#newContactName").val().trim();
  const email = $("#newContactEmail").val().trim();
  const $msg = $("#contactMsg");

  // Validar
  if (!name || !email) {
    showContactMessage("Por favor completa todos los campos", "danger");
    return;
  }

  const result = addContact(name, email);

  if (result.success) {
    showContactMessage(result.message, "success");

    // Reseteo
    $("#newContactForm")[0].reset();

    // Reiniciar autorelleno
    initializeContactAutocomplete();

    // Eliminar despues de 2 seg.
    setTimeout(() => {
      $msg.fadeOut(() => $msg.html(""));
    }, 2000);
  } else {
    showContactMessage(result.message, "danger");
  }
}

// =====Validar envio =====
function validateSendAmount() {
  const amount = $("#sendAmount").val();
  const currentBalance = parseFloat(localStorage.getItem("balance")) || 0;

  if (!amount) return;

  const validation = validateAmount(amount);

  if (!validation.valid) {
    $("#sendAmount").addClass("is-invalid");
  } else if (parseFloat(amount) > currentBalance) {
    $("#sendAmount").addClass("is-invalid");
  } else {
    $("#sendAmount").removeClass("is-invalid");
  }
}

// ===== Mostar mensaje Ok =====
function showSendMessage(message, type = "info") {
  const $msg = $("#sendMsg");
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

// ===== Mostrar mensaje de contactos =====
function showContactMessage(message, type = "info") {
  const $msg = $("#contactMsg");
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
