/* ==========================================================
   CONFIGURACIÓN: lo único que tienes que editar aquí
   ========================================================== */
const CONFIG = {
  redes: {
    tiktok:    "https://www.tiktok.com/@teondres",
    youtube:   "https://www.youtube.com/@Teondres",
    discord:   "https://discord.gg/6epwXaZes",
    instagram: ""   // vacío = el botón y la publicación se ocultan solos
  },
  correo: "teondres18@gmail.com",

  // Dirección de MailerLite a la que se envían los correos (formulario "Lista de espera Teondres").
  // Vacío = el formulario aún no guarda nada.
  endpointCorreo: "https://assets.mailerlite.com/jsonp/2810704/forms/204610264967939551/subscribe"
};

/* ===== Enlaces de redes ===== */
document.querySelectorAll("[data-red]").forEach((enlace) => {
  const url = CONFIG.redes[enlace.dataset.red];
  if (!url) {            // si no hay enlace, se oculta
    enlace.hidden = true;
    return;
  }
  enlace.href = url;
  enlace.target = "_blank";
  enlace.rel = "noopener noreferrer";
});

/* ===== Correo del pie de página ===== */
document.querySelectorAll("[data-correo]").forEach((enlace) => {
  enlace.href = "mailto:" + CONFIG.correo;
  enlace.textContent = CONFIG.correo;
});

/* ===== Formulario de correo (MailerLite) ===== */
const formulario = document.getElementById("form-correo");
const mensaje = document.getElementById("mensaje-form");
const boton = formulario.querySelector("button[type='submit']");
const destino = document.getElementById("ml-destino");
let enviando = false;

if (CONFIG.endpointCorreo) {
  formulario.action = CONFIG.endpointCorreo;
  formulario.method = "post";
  formulario.target = "ml-destino"; // se envía dentro del iframe oculto
}

formulario.addEventListener("submit", (evento) => {
  const campo = document.getElementById("correo");
  const trampa = document.getElementById("sitio_web");

  if (enviando) {
    evento.preventDefault();
    return;
  }

  // Un robot llenó el campo trampa: fingimos que todo salió bien y no enviamos nada
  if (trampa.value) {
    evento.preventDefault();
    mensaje.textContent = "¡Casi listo! Revisa tu correo para confirmar.";
    return;
  }

  if (!campo.value || !campo.checkValidity()) {
    evento.preventDefault();
    mensaje.textContent = "Escribe un correo válido, por ejemplo nombre@correo.com.";
    campo.focus();
    return;
  }

  if (!CONFIG.endpointCorreo) {
    evento.preventDefault();
    mensaje.textContent = "La lista de correo abre muy pronto. Vuelve a pasar por aquí.";
    return;
  }

  // Todo bien: el navegador envía el formulario solo, hacia el iframe oculto
  enviando = true;
  boton.disabled = true;
  mensaje.textContent = "Enviando...";

  setTimeout(() => {
    if (!enviando) return;
    enviando = false;
    boton.disabled = false;
    mensaje.textContent = "Tardó demasiado. Inténtalo otra vez en unos minutos.";
  }, 15000);
});

// Cuando MailerLite responde, el iframe termina de cargar
destino.addEventListener("load", () => {
  if (!enviando) return;
  enviando = false;
  boton.disabled = false;
  formulario.reset();
  mensaje.textContent = "¡Casi listo! Te enviamos un correo para confirmar. Revisa también la carpeta de spam.";
});

/* ===== Pikku salta al hacerle click ===== */
const pikku = document.getElementById("pikku");

pikku.addEventListener("click", () => {
  pikku.classList.remove("salto");
  void pikku.offsetWidth; // reinicia la animación
  pikku.classList.add("salto");
});
