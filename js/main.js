/* ==========================================================
   CONFIGURACIÓN: lo único que tienes que editar aquí
   ========================================================== */
const CONFIG = {
  redes: {
    tiktok:    "https://www.tiktok.com/@teondres",
    youtube:   "https://www.youtube.com/@Teondres",
    discord:   "https://discord.gg/TEJxDvQy2Q",
    instagram: "https://www.instagram.com/teondres/"
  },
  correo: "teondres18@gmail.com",

  // ID del servidor de Discord (Ajustes del servidor -> Widget). Sirve para mostrar
  // cuántas personas hay conectadas. Vacío = no se muestra el número.
  discordServidorId: "",

  // Dirección de MailerLite a la que se envían los correos (formulario "Lista de espera Teondres").
  // Vacío = el formulario aún no guarda nada.
  endpointCorreo: "https://assets.mailerlite.com/jsonp/2810704/forms/204610264967939551/subscribe"
};

/* ===== Enlaces de redes ===== */
// Si una red no tiene enlace, se ocultan su botón y su tarjeta
Object.keys(CONFIG.redes).forEach((red) => {
  const url = CONFIG.redes[red];
  document.querySelectorAll(`[data-red="${red}"], [data-card="${red}"]`).forEach((el) => {
    if (!url) {
      el.hidden = true;
      return;
    }
    if (el.dataset.red) {
      el.href = url;
      el.target = "_blank";
      el.rel = "noopener noreferrer";
    }
  });
});

/* ===== Últimas publicaciones (data/publicaciones.json) ===== */
fetch("data/publicaciones.json", { cache: "no-cache" })
  .then((respuesta) => (respuesta.ok ? respuesta.json() : Promise.reject()))
  .then((datos) => {
    Object.keys(datos).forEach((red) => {
      const tarjeta = document.querySelector(`[data-card="${red}"]`);
      if (!tarjeta || tarjeta.hidden) return;
      const info = datos[red];
      if (info.titulo) tarjeta.querySelector(".post-titulo").textContent = info.titulo;
      if (info.imagen) tarjeta.querySelector(".portada").src = info.imagen;
      if (info.enlace) tarjeta.href = info.enlace;
    });
  })
  .catch(() => { /* si falla, se quedan los textos e imágenes de siempre */ });

/* ===== Discord: personas conectadas ===== */
const tituloDiscord = document.querySelector('[data-card="discord"] .post-titulo');

if (CONFIG.discordServidorId && tituloDiscord) {
  fetch("https://discord.com/api/guilds/" + CONFIG.discordServidorId + "/widget.json")
    .then((respuesta) => (respuesta.ok ? respuesta.json() : Promise.reject()))
    .then((datos) => {
      if (typeof datos.presence_count === "number") {
        tituloDiscord.textContent = datos.presence_count + " conectados ahora";
      }
    })
    .catch(() => { /* si falla, se queda el texto de siempre */ });
}

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
