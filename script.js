// ============================================================
// EL MARGINAL — sitio no oficial de fans
// script.js — navegación, galería y formulario
// ============================================================

document.addEventListener("DOMContentLoaded", function () {
  marcarEnlaceActivo();
  ajustarAlturaHeader();
  iniciarMenuMovil();
  iniciarSubmenu();
  iniciarGaleria();
  iniciarFormulario();
});

/* ---------- Mide la altura real del header (varía según el celular/tamaño de letra)
   y la guarda en una variable CSS, para que el menú móvil calce siempre justo debajo ---------- */
function ajustarAlturaHeader() {
  var header = document.querySelector(".encabezado");
  if (!header) return;

  function medir() {
    document.documentElement.style.setProperty("--alto-header", header.offsetHeight + "px");
  }

  medir();
  window.addEventListener("resize", medir);
  window.addEventListener("orientationchange", medir);
}

/* ---------- Resalta el link activo según la página actual ---------- */
function marcarEnlaceActivo() {
  var actual = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-principal a").forEach(function (enlace) {
    var href = enlace.getAttribute("href");
    if (!href) return;
    var archivo = href.split("#")[0];
    if (archivo === actual || (archivo === "" && actual === "index.html")) {
      var li = enlace.closest("li");
      if (li) li.classList.add("activo");
    }
  });
}

/* ---------- Menú hamburguesa (mobile) ---------- */
function iniciarMenuMovil() {
  var boton = document.querySelector(".boton-menu");
  var nav = document.querySelector(".nav-principal");
  if (!boton || !nav) return;

  boton.addEventListener("click", function () {
    var abierto = nav.classList.toggle("abierto");
    boton.setAttribute("aria-expanded", abierto ? "true" : "false");
  });
}

/* ---------- Submenú "Personajes" (clic en mobile, hover en desktop vía CSS) ---------- */
function iniciarSubmenu() {
  var conSubmenu = document.querySelectorAll(".tiene-submenu > a");

  conSubmenu.forEach(function (enlace) {
    enlace.addEventListener("click", function (evento) {
      if (window.innerWidth <= 720) {
        evento.preventDefault();
        var contenedor = enlace.parentElement;
        var yaAbierto = contenedor.classList.contains("abierto");
        document
          .querySelectorAll(".tiene-submenu.abierto")
          .forEach(function (el) {
            el.classList.remove("abierto");
          });
        if (!yaAbierto) contenedor.classList.add("abierto");
      }
    });
  });

  document.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape") {
      document
        .querySelectorAll(".tiene-submenu.abierto")
        .forEach(function (el) {
          el.classList.remove("abierto");
        });
    }
  });
}

/* ---------- Galería: filtros + lightbox navegable ---------- */
function iniciarGaleria() {
  var grilla = document.querySelector(".grilla-galeria");
  if (!grilla) return;

  var piezas = Array.from(grilla.querySelectorAll(".pieza-galeria"));
  var filtros = document.querySelectorAll(".filtro");
  var lightbox = document.querySelector(".lightbox");
  var imagenLb = document.querySelector(".lightbox-imagen");
  var tituloLb = document.querySelector(".lightbox-titulo");
  var descLb = document.querySelector(".lightbox-descripcion");
  var contadorLb = document.querySelector(".lightbox-contador");
  var btnCerrar = document.querySelector(".lightbox-cerrar");
  var btnAnterior = document.querySelector(".lightbox-anterior");
  var btnSiguiente = document.querySelector(".lightbox-siguiente");

  var visibles = piezas.slice();
  var indiceActual = 0;

  // --- filtros por categoría ---
  filtros.forEach(function (filtro) {
    filtro.addEventListener("click", function () {
      filtros.forEach(function (f) {
        f.classList.remove("activo");
      });
      filtro.classList.add("activo");
      var categoria = filtro.dataset.filtro;

      piezas.forEach(function (pieza) {
        var coincide = categoria === "todas" || pieza.dataset.categoria === categoria;
        pieza.hidden = !coincide;
      });

      visibles = piezas.filter(function (p) {
        return !p.hidden;
      });
    });
  });

  // --- abrir lightbox ---
  piezas.forEach(function (pieza) {
    pieza.addEventListener("click", function () {
      visibles = piezas.filter(function (p) {
        return !p.hidden;
      });
      indiceActual = visibles.indexOf(pieza);
      mostrarEnLightbox(indiceActual);
      lightbox.classList.add("visible");
      document.body.style.overflow = "hidden";
    });
  });

  function mostrarEnLightbox(indice) {
    var pieza = visibles[indice];
    if (!pieza) return;
    var marco = pieza.querySelector(".marco");
    imagenLb.innerHTML = marco ? marco.innerHTML : "";
    // Si la foto real ya cargó en la miniatura, se copió con opacity:1 aplicado
    // por el navegador vía onload; forzamos que también se vea acá.
    var fotoReal = imagenLb.querySelector("img.foto-real");
    if (fotoReal) fotoReal.style.opacity = 1;
    tituloLb.textContent = pieza.dataset.titulo || "";
    descLb.textContent = pieza.dataset.descripcion || "";
    contadorLb.textContent = indice + 1 + " / " + visibles.length;
  }

  function cerrarLightbox() {
    lightbox.classList.remove("visible");
    document.body.style.overflow = "";
  }

  if (btnCerrar) btnCerrar.addEventListener("click", cerrarLightbox);
  if (lightbox) {
    lightbox.addEventListener("click", function (evento) {
      if (evento.target === lightbox) cerrarLightbox();
    });
  }

  if (btnAnterior) {
    btnAnterior.addEventListener("click", function () {
      indiceActual = (indiceActual - 1 + visibles.length) % visibles.length;
      mostrarEnLightbox(indiceActual);
    });
  }

  if (btnSiguiente) {
    btnSiguiente.addEventListener("click", function () {
      indiceActual = (indiceActual + 1) % visibles.length;
      mostrarEnLightbox(indiceActual);
    });
  }

  document.addEventListener("keydown", function (evento) {
    if (!lightbox.classList.contains("visible")) return;
    if (evento.key === "Escape") cerrarLightbox();
    if (evento.key === "ArrowRight" && btnSiguiente) btnSiguiente.click();
    if (evento.key === "ArrowLeft" && btnAnterior) btnAnterior.click();
  });
}

/* ---------- Formulario de contacto: validación + envío simulado ---------- */
function iniciarFormulario() {
  var form = document.querySelector(".formulario");
  if (!form) return;

  var confirmacion = document.querySelector(".confirmacion");

  form.addEventListener("submit", function (evento) {
    evento.preventDefault();
    var valido = true;

    var campos = form.querySelectorAll("[required]");
    campos.forEach(function (campo) {
      var envoltorio = campo.closest(".campo");
      var esValido = campo.checkValidity() && campo.value.trim() !== "";

      if (campo.type === "email" && campo.value.trim() !== "") {
        var patronEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        esValido = patronEmail.test(campo.value.trim());
      }

      if (!esValido) {
        valido = false;
        if (envoltorio) envoltorio.classList.add("con-error");
      } else if (envoltorio) {
        envoltorio.classList.remove("con-error");
      }
    });

    if (!valido) return;

    // No hay backend real: esto es una demostración de front-end.
    // El mensaje se guarda solo en este navegador, a modo ilustrativo.
    try {
      var previos = JSON.parse(localStorage.getItem("elmarginal_mensajes") || "[]");
      previos.push({
        nombre: form.nombre.value.trim(),
        email: form.email.value.trim(),
        asunto: form.asunto.value,
        mensaje: form.mensaje.value.trim(),
        fecha: new Date().toISOString(),
      });
      localStorage.setItem("elmarginal_mensajes", JSON.stringify(previos));
    } catch (error) {
      console.warn("No se pudo guardar el mensaje localmente:", error);
    }

    form.classList.add("oculto");
    if (confirmacion) confirmacion.classList.add("visible");
  });

  // Quita el estado de error apenas el usuario corrige el campo
  form.querySelectorAll("input, select, textarea").forEach(function (campo) {
    campo.addEventListener("input", function () {
      var envoltorio = campo.closest(".campo");
      if (envoltorio) envoltorio.classList.remove("con-error");
    });
  });
}
