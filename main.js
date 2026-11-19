/* ==========================================================
   CONFIGURACIÓN: lo único que tienes que editar aquí
   ========================================================== */
const CONFIG = {
  redes: {
    tiktok:    "https://www.tiktok.com/@TU_USUARIO",
    youtube:   "https://www.youtube.com/@TU_CANAL",
    discord:   "https://discord.gg/TU_INVITACION",
    instagram: "https://www.instagram.com/TU_USUARIO"
  },
  correo: "hola@teondres.com",

  // Cuando tengas el servicio de lista de correo (MailerLite, Buttondown, Formspree...)
  // pega aquí la URL a la que se envía el formulario. Vacío = el formulario aún no guarda nada.
  endpointCorreo: ""
};

/* ===== Enlaces de redes ===== */
document.querySelectorAll("[data-red]").forEach((enlace) => {
  enlace.href = CONFIG.redes[enlace.dataset.red];
  enlace.target = "_blank";
  enlace.rel = "noopener noreferrer";
});

/* ===== Correo del pie de página ===== */
document.querySelectorAll("[data-correo]").forEach((enlace) => {
  enlace.href = "mailto:" + CONFIG.correo;
  enlace.textContent = CONFIG.correo;
});

/* ===== Formulario de correo ===== */
const formulario = document.getElementById("form-correo");
const mensaje = document.getElementById("mensaje-form");

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const campo = formulario.elements.correo;
  if (!campo.value || !campo.checkValidity()) {
    mensaje.textContent = "Escribe un correo válido, por ejemplo nombre@correo.com.";
    campo.focus();
    return;
  }

  if (!CONFIG.endpointCorreo) {
    mensaje.textContent = "La lista de correo abre muy pronto. Vuelve a pasar por aquí.";
    return;
  }

  try {
    const respuesta = await fetch(CONFIG.endpointCorreo, {
      method: "POST",
      body: new FormData(formulario),
      headers: { Accept: "application/json" }
    });
    if (!respuesta.ok) throw new Error("Respuesta " + respuesta.status);
    formulario.reset();
    mensaje.textContent = "¡Listo! Te avisaremos cuando lo anunciemos.";
  } catch (error) {
    mensaje.textContent = "No se pudo guardar tu correo. Inténtalo otra vez en unos minutos.";
  }
});

/* ===== Pikku salta al hacerle click ===== */
const pikku = document.getElementById("pikku");

pikku.addEventListener("click", () => {
  pikku.classList.remove("salto");
  void pikku.offsetWidth; // reinicia la animación
  pikku.classList.add("salto");
});
