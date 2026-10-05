/* =====================================================================
   Capitalizarme - landing estatica
   Sin dependencias externas. Todo el comportamiento vive aqui.
   ===================================================================== */

/* ---------------------------------------------------------------------
   CONFIGURACION (edita solo este bloque)
   --------------------------------------------------------------------- */
const CONFIG = {
  // Destino del formulario. Opciones:
  //   1) Endpoint HTTP que acepte JSON (Formspree, Basin, tu API, etc.):
  //      formEndpoint: "https://formspree.io/f/TU_ID",
  //   2) Sin endpoint: si hay whatsappNumber, el envio abre WhatsApp
  //      con el mensaje ya redactado.
  //   3) Si ambos estan vacios, el formulario avisa que falta configurarlo.
  formEndpoint: "https://hook.eu1.make.com/uyut4gkyu3j15t5y2s95gkdvnkeefk3n",

  // Solo digitos con codigo de pais, sin "+" ni espacios. Ej: "51987654321"
  whatsappNumber: "56948672981",

  // Texto del boton flotante de WhatsApp (abajo a la derecha)
  whatsappTexto: "Comunicate con un asesor",

  // Mensaje que se escribe solo en WhatsApp al abrir el boton
  whatsappMensaje: "Hola Capitalizarme, quiero invertir en un inmueble.",

  // ---------------------------------------------------------------------
  // CORREO DE CONTACTO
  //
  // ESTE ES EL BLOQUE QUE EDITAS PARA CAMBIAR A QUE CORREO LLEGAN LOS
  // AVISOS Y A QUE DIRECCION PUEDEN ESCRIBIR LOS INTERESADOS.
  //
  // Escribe el correo una sola vez aqui y se actualiza automaticamente
  // en los dos lugares donde aparece: el aviso de privacidad bajo el
  // formulario y el pie de pagina.
  // ---------------------------------------------------------------------
  email: "cristobal.landeros@capitalizarme.com",

  // ---------------------------------------------------------------------
  // FRANJA DE FOTO (la imagen grande a todo el ancho)
  //
  // ESTE ES EL BLOQUE QUE EDITAS PARA MOVER EL BOTON "Agenda tu reu"
  //
  // RECOMENDADO: deja modo en "coordenadas".
  // Los numeros x e y son PORCENTAJES de la foto, no pixeles. Gracias a eso
  // el boton cae en el MISMO punto de la imagen en computadora, tablet y
  // celular, aunque la foto se vea mas alta o mas baja en cada pantalla.
  //
  //   x    % desde el BORDE IZQUIERDO de la foto.  0 = pegado al borde.
  //   y    % desde el BORDE INFERIOR de la foto.   0 = pegado abajo.
  //
  // Prueba asi (subir = numero mas grande):
  //   x=7,  y=14   -> izquierda, pegado abajo
  //   x=7,  y=45   -> izquierda, a media altura
  //   x=45, y=45   -> centro, a media altura
  //
  // xMovil / yMovil: si los dejas vacios (""), el celular usa los mismos
  // x e y. Si los llenas, el celular usa esos otros numeros (util si en el
  // celular el boton queda muy encimado con el texto de la foto).
  //
  // texto       lo que dice el boton.
  // sobreImagen true = encima de la foto | false = debajo de la foto.
  //
  // MODO ANTIGUO (no recomendado): deja modo en "margenes" y usa
  //   bajar     pixeles que sube el boton desde el borde inferior
  //   margenIzq pixeles desde el borde izquierdo
  // En ese modo el boton NO cae en el mismo punto de la foto en cada
  // pantalla, porque la foto cambia de altura.
  //
  // Solo cambia los numeros y guarda con Ctrl + S.
  // ---------------------------------------------------------------------
  banda: {
    modo: "coordenadas",
    texto: "Agenda tu reu",
    sobreImagen: true,
    x: 10,
    y: 19.8,
    xMovil: 5,
    yMovil: 14,
  },

  // ---------------------------------------------------------------------
  // LOGOS DE BANCOS E INMOBILIARIAS
  // Para cada uno: deja el archivo en landing/assets/img/ con el nombre
  // "archivo" y el nombre que quieres que se vea si el archivo no existe.
  // Para agregar uno mas, copia una linea.
  // ---------------------------------------------------------------------
  bancos: [
    { archivo: "banco-1", nombre: "Banco 1" },
    { archivo: "banco-2", nombre: "Banco 2" },
    { archivo: "banco-3", nombre: "Banco 3" },
    { archivo: "banco-4", nombre: "Banco 4" },
    { archivo: "banco-5", nombre: "Banco 5" },
    { archivo: "banco-6", nombre: "Banco 6" },
    { archivo: "banco-7", nombre: "Banco 7" },
    { archivo: "banco-8", nombre: "Banco 8" },
  ],

  inmobiliarias: [
    { archivo: "inmobiliaria-1", nombre: "Inmobiliaria 1" },
    { archivo: "inmobiliaria-2", nombre: "Inmobiliaria 2" },
    { archivo: "inmobiliaria-3", nombre: "Inmobiliaria 3" },
    { archivo: "inmobiliaria-4", nombre: "Inmobiliaria 4" },
    { archivo: "inmobiliaria-5", nombre: "Inmobiliaria 5" },
    { archivo: "inmobiliaria-6", nombre: "Inmobiliaria 6" },
    { archivo: "inmobiliaria-7", nombre: "Inmobiliaria 7" },
    { archivo: "inmobiliaria-8", nombre: "Inmobiliaria 8" },
  ],

  // ---------------------------------------------------------------------
  // CARRUSEL DE BANCOS E INMOBILIARIAS
  //
  // tamano     lado del recuadro cuadrado, en pixeles (ej: 440)
  // segundos   duracion de una vuelta completa. Mas alto = mas lento.
  //            40 es un ritmo semilento, comodo de leer.
  // pausaAlPasarElMouse  true = se detiene al poner el mouse encima
  // ---------------------------------------------------------------------
  carrusel: {
    tamano: 110,
    segundos: 40,
    pausaAlPasarElMouse: false,
  },
};

// Extensiones aceptadas al buscar una imagen en assets/img/.
// El orden importa: primero se prueba .webp porque pesa mucho menos que un
// PNG para la misma foto. Si el archivo no existe, se cae al siguiente.
var EXTENSIONES = [".webp", ".png", ".jpg", ".jpeg", ".svg"];

(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var header = document.getElementById("site-header");
  var navToggle = document.getElementById("nav-toggle");
  var navList = document.getElementById("site-nav");

  /* ----------------------- Utilidades ----------------------- */

  /* Convierte un valor de configuracion en numero. Si esta vacio o no es un
     numero, devuelve el valor por defecto indicado. */
  function numero(valor, porDefecto) {
    var n = parseFloat(valor);
    return isNaN(n) ? porDefecto : n;
  }

  /* true cuando el valor esta vacio (para usar los valores de escritorio
     en el celular). */
  function vacio(valor) {
    return valor === "" || valor === null || valor === undefined;
  }

  function qs(sel, ctx) {
    return (ctx || document).querySelector(sel);
  }

  function qsa(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }

  /* -------------------- Imagenes por nombre -------------------- */
  /* Solo deja el archivo en assets/img/ con el nombre esperado y la pagina
     lo muestra. Si el archivo no existe, se conserva el recuadro punteado. */

  function rutasImagen(holder) {
    var base = holder.getAttribute("data-img") || "";
    var bases = base.split(/\s+/).filter(Boolean);
    var rutas = [];
    bases.forEach(function (b) {
      EXTENSIONES.forEach(function (ext) {
        rutas.push("assets/img/" + b + ext);
      });
    });
    return rutas;
  }

  /* La franja respeta la PROPORCION REAL de la foto (por ejemplo 1921x1081).
     Eso es lo que hace que la imagen se vea EXACTAMENTE igual en computadora,
     tablet y celular: nunca se recorta, siempre se muestra completa.

     Antes se limitaba la altura entre un minimo y un maximo. Eso obligaba a
     recortar la foto en pantallas angostas y por eso el boton terminaba
     sobre partes distintas de la imagen segun el tamano de la pantalla.
     Ahora solo se fija la proporcion, sin limites de alto.

     La posicion del boton (CONFIG.banda x / y) son porcentajes de esta misma
     franja, asi que cubren siempre el mismo punto de la foto. */
  function ajustarFranja(holder, img) {
    function aplicar() {
      if (!img.naturalWidth || !img.naturalHeight) return;
      // La proporcion manda: la altura sale sola del ancho disponible.
      holder.style.aspectRatio = img.naturalWidth + " / " + img.naturalHeight;
      holder.style.height = "auto";
    }

    if (img.complete) {
      aplicar();
    } else {
      img.addEventListener("load", aplicar);
    }
    window.addEventListener(
      "resize",
      function () {
        window.requestAnimationFrame(aplicar);
      },
      { passive: true }
    );
  }

  function mostrarImagen(holder, ruta) {
    var img = document.createElement("img");
    img.src = ruta;
    img.alt = holder.getAttribute("data-img-alt") || "";
    img.decoding = "async";
    if (!holder.classList.contains("media--project")) {
      img.loading = "lazy";
    }
    holder.textContent = "";
    holder.appendChild(img);
    holder.classList.add("media--filled");
    // Al cargar la foto, el recuadro deja de ser "de reserva" y pierde el borde punteado
    holder.classList.remove("carrusel__item--vacio");

    if (holder.classList.contains("media--band")) {
      ajustarFranja(holder, img);
    }

    var ocultar = holder.getAttribute("data-hide");
    if (ocultar) {
      qsa(ocultar).forEach(function (el) {
        el.hidden = true;
      });
    }
  }

  function cargarImagenes() {
    qsa("[data-img]").forEach(function (holder) {
      var rutas = rutasImagen(holder);
      var i = 0;
      (function siguiente() {
        if (i >= rutas.length) return;
        var ruta = rutas[i++];
        var prueba = new Image();
        prueba.onload = function () {
          mostrarImagen(holder, ruta);
        };
        prueba.onerror = siguiente;
        prueba.src = ruta;
      })();
    });
  }

  /* --------- Genera los recuadros cuadrados de bancos e inmobiliarias --------- */
  /* Cada recuadro mide lo mismo (carrusel.tamano) y la foto se adapta
     dentro sin deformarse, gracias a object-fit: contain en el CSS. */

  function generarLogos(idLista, items) {
    var lista = document.getElementById(idLista);
    if (!lista || !items || !items.length) return;

    items.forEach(function (item) {
      var li = document.createElement("li");
      var holder = document.createElement("span");
      holder.className = "carrusel__item carrusel__item--vacio";
      holder.setAttribute("data-img", item.archivo);
      holder.setAttribute("data-img-alt", item.nombre);
      holder.setAttribute("role", "img");
      holder.setAttribute("aria-label", "Espacio reservado para el logo de " + item.nombre);

      var pista = document.createElement("span");
      pista.className = "media__hint";
      pista.textContent = item.nombre;

      holder.appendChild(pista);
      li.appendChild(holder);
      lista.appendChild(li);
    });
  }

  generarLogos("banks-list", CONFIG.bancos);
  generarLogos("developers-list", CONFIG.inmobiliarias);

  /* -------------- Carrusel infinito de bancos / inmobiliarias -------------- */
  /* La lista se duplica para que al llegar al final el salto sea invisible.
     Se duplica ANTES de cargar las fotos, para que las copias tambien
     reciban su imagen y el bucle no muestre recuadros vacios.
     El desplazamiento se hace con transform, que no recarga nada y va fluido.
     Si la persona eligio "reducir movimiento" en su sistema, no se anima. */

  function duplicarPista(contenedor) {
    var pista = contenedor.querySelector(".carrusel__pista");
    if (!pista || !pista.children.length) return null;

    // El tamano del recuadro sale de CONFIG.carrusel.tamano
    var opcion = CONFIG.carrusel || {};
    if (typeof opcion.tamano === "number" && opcion.tamano > 0) {
      pista.style.setProperty("--carrusel-tamano", opcion.tamano + "px");
    }

    pista.innerHTML += pista.innerHTML;
    return pista;
  }

  qsa("[data-carrusel]").forEach(duplicarPista);

  // Ahora si se cargan las fotos, tanto en la lista original como en la copia
  cargarImagenes();

  function iniciarCarrusel(contenedor) {
    var pista = contenedor.querySelector(".carrusel__pista");
    if (!pista) return;

    var total = pista.children.length;
    if (!total) return;

    // La lista ya viene duplicada: se mide solo la mitad original
    var originales = total / 2;
    if (originales < 1) return;

    var grupoAncho = 0;
    for (var i = 0; i < originales; i++) {
      grupoAncho += pista.children[i].getBoundingClientRect().width;
    }
    var estilos = window.getComputedStyle(pista);
    var separacion = parseFloat(estilos.columnGap || estilos.gap || "0") || 0;
    grupoAncho += separacion * (originales - 1);

    if (grupoAncho <= 0) return;
    // Si todo el grupo ya cabe en pantalla, moverlo se notaria: no anima
    if (grupoAncho <= contenedor.clientWidth) return;
    if (reducedMotion) return;

    var opcion = CONFIG.carrusel || {};
    var segundos = typeof opcion.segundos === "number" ? opcion.segundos : 40;
    if (segundos <= 0) return;

    // La direccion la marca el HTML con data-carrusel-direccion.
    // "izquierda" (default) usa carrusel-mover, "derecha" usa el sentido inverso.
    var direccion = contenedor.getAttribute("data-carrusel-direccion") === "derecha" ? "derecha" : "izquierda";
    var animacion = "carrusel-mover-" + direccion + " " + segundos * 1000 + "ms linear infinite";

    pista.style.setProperty("--carrusel-desplazamiento", grupoAncho + "px");
    pista.style.animation = animacion;

    // Al cambiar el tamano de la ventana, los recuadros se encogen o crecen:
    // se vuelve a medir un solo grupo (sin contar la copia) y se reinicia la animacion.
    window.addEventListener(
      "resize",
      function () {
        pista.style.animation = "none";
        void pista.offsetWidth;

        var nuevoAncho = 0;
        for (var j = 0; j < originales; j++) {
          nuevoAncho += pista.children[j].getBoundingClientRect().width;
        }
        nuevoAncho += separacion * (originales - 1);

        if (nuevoAncho > 0) {
          pista.style.setProperty("--carrusel-desplazamiento", nuevoAncho + "px");
        }
        pista.style.animation = animacion;
      },
      { passive: true }
    );
  }

  qsa("[data-carrusel]").forEach(function (contenedor) {
    var pista = contenedor.querySelector(".carrusel__pista");
    if (!pista) return;

    // Se espera a que las imagenes carguen para medir el ancho real de cada una
    function arrancar() {
      if (pista.dataset.carruselListo === "1") return;
      pista.dataset.carruselListo = "1";
      iniciarCarrusel(contenedor);
    }

    window.requestAnimationFrame(arrancar);
    // Si alguna foto se demora, el carrusel arranca igual tras un rato
    window.setTimeout(arrancar, 2500);
  });

  /* -------------- Posicion del boton de la franja de foto -------------- */

  (function aplicarBanda() {
    var band = document.querySelector(".band");
    if (!band) return;

    var opcion = CONFIG.banda || {};
    var cta = document.getElementById("band-cta");
    var acciones = document.querySelector(".band__actions");

    if (cta && opcion.texto) {
      cta.childNodes[0].nodeValue = opcion.texto + " ";
    }

    band.classList.toggle("band--over", opcion.sobreImagen !== false);

    /* --- Modo "coordenadas": el boton se ancla con PORCENTAJES de la foto,
           asi cae en el mismo punto de la imagen en cualquier pantalla. --- */
    if (opcion.modo === "coordenadas") {
      band.classList.add("band--coordenadas");
      if (acciones) {
        var x = numero(opcion.x, 7);
        var y = numero(opcion.y, 14);
        var xMovil = vacio(opcion.xMovil) ? x : numero(opcion.xMovil, x);
        var yMovil = vacio(opcion.yMovil) ? y : numero(opcion.yMovil, y);

        acciones.style.setProperty("--band-x", x + "%");
        acciones.style.setProperty("--band-y", y + "%");
        acciones.style.setProperty("--band-x-movil", xMovil + "%");
        acciones.style.setProperty("--band-y-movil", yMovil + "%");
      }
      return;
    }

    /* --- Modo "margenes" (pixeles fijos, el anterior) --- */
    var posiciones = ["izquierda", "centro", "derecha"];
    var posicion = posiciones.indexOf(opcion.posicion) > -1 ? opcion.posicion : "centro";

    band.classList.remove("band--izquierda", "band--centro", "band--derecha");
    band.classList.add("band--" + posicion);

    if (acciones) {
      if (typeof opcion.bajar === "number" && opcion.sobreImagen !== false) {
        acciones.style.marginTop = -opcion.bajar + "px";
      }
      if (typeof opcion.margenIzq === "number" && posicion === "izquierda") {
        acciones.style.paddingLeft = opcion.margenIzq + "px";
      }
    }
  })();

  /* ------------------------- Año del pie ------------------------- */

  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* ------------------ Telefono y correo del pie ------------------ */

  function digitsOnly(value) {
    return (value || "").replace(/\D/g, "");
  }

  qsa("[data-phone-link]").forEach(function (el) {
    var digits = digitsOnly(CONFIG.whatsappNumber);
    if (digits) {
      el.href = "tel:+" + digits;
    } else {
      el.removeAttribute("href");
      el.style.opacity = "0.7";
    }
  });

  /* El correo sale de CONFIG.email: se cambia en un solo lugar y se actualiza
     el enlace y el texto visible, en el pie y en el aviso de privacidad. */
  qsa("[data-mail-link]").forEach(function (el) {
    if (!CONFIG.email) {
      el.removeAttribute("href");
      return;
    }
    el.href = "mailto:" + CONFIG.email;
    if (el.hasAttribute("data-mail-text")) {
      el.textContent = CONFIG.email;
    }
  });

  /* -------------------- Boton flotante de WhatsApp -------------------- */

  function mostrarToast(mensaje) {
    var toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = mensaje;
    toast.hidden = false;
    window.requestAnimationFrame(function () {
      toast.classList.add("is-visible");
    });
    window.clearTimeout(toast._temporizador);
    toast._temporizador = window.setTimeout(function () {
      toast.classList.remove("is-visible");
      window.setTimeout(function () {
        toast.hidden = true;
      }, 300);
    }, 4000);
  }

  var waFloat = document.getElementById("wa-float");
  if (waFloat) {
    var waTexto = qs(".wa-float__text", waFloat);
    if (waTexto && CONFIG.whatsappTexto) {
      waTexto.textContent = CONFIG.whatsappTexto;
    }

    var waNumero = digitsOnly(CONFIG.whatsappNumber);

    if (waNumero) {
      waFloat.href =
        "https://wa.me/" +
        waNumero +
        "?text=" +
        encodeURIComponent(CONFIG.whatsappMensaje || "");
    } else {
      // Sin numero: el boton sigue visible y avisa que falta configurarlo
      waFloat.href = "#";
      waFloat.addEventListener("click", function (event) {
        event.preventDefault();
        mostrarToast(
          "Falta configurar el numero de WhatsApp en landing/script.js (CONFIG.whatsappNumber)."
        );
      });
    }
  }

  /* ------------------------- Menu movil ------------------------- */

  function closeNav() {
    if (!navToggle || !navList) return;
    navToggle.setAttribute("aria-expanded", "false");
    navList.classList.remove("is-open");
  }

  if (navToggle && navList) {
    navToggle.addEventListener("click", function () {
      var open = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!open));
      navList.classList.toggle("is-open", !open);
    });

    navList.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        closeNav();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeNav();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) {
        closeNav();
      }
    });
  }

  /* ------------------- Sombra del encabezado ------------------- */

  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* -------------- Animaciones y seccion activa -------------- */

  var revealItems = qsa("[data-reveal]");
  var sections = qsa("main section[id]");
  var navLinks = qsa('.site-nav__list a[href^="#"]');

  if (revealItems.length) {
    if (reducedMotion || !("IntersectionObserver" in window)) {
      revealItems.forEach(function (el) {
        el.classList.add("is-visible");
      });
    } else {
      var revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
      );
      revealItems.forEach(function (el, index) {
        el.style.transitionDelay = Math.min(index % 4, 3) * 70 + "ms";
        revealObserver.observe(el);
      });
    }
  }

  if (sections.length && navLinks.length && "IntersectionObserver" in window) {
    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navLinks.forEach(function (link) {
            var isCurrent = link.getAttribute("href") === "#" + entry.target.id;
            link.classList.toggle("is-active", isCurrent);
            if (isCurrent) {
              link.setAttribute("aria-current", "true");
            } else {
              link.removeAttribute("aria-current");
            }
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach(function (section) {
      navObserver.observe(section);
    });
  }

  /* ------------------------- Formulario ------------------------- */

  var form = document.getElementById("lead-form");
  if (!form) return;

  var statusEl = document.getElementById("form-status");
  var submitBtn = document.getElementById("form-submit");
  var submitLabel = qs(".btn__label", submitBtn);

  /* Las reglas viven en validacion.js para poder probarlas sin navegador.
     Aqui solo se conectan con el formulario. */
  var V = window.CRMValidacion;
  var reglas = V ? V.REGLAS : [];

  /* Los grupos de opciones (ingreso y DICOM) son <fieldset>, no <input>,
     asi que el error se muestra marcando el grupo completo. */
  var grupos = {};

  function valorDe(campo) {
    if (grupos[campo]) {
      var marcado = qs('input[name="' + campo + '"]:checked', form);
      return marcado ? marcado.value : "";
    }
    var el = document.getElementById("f-" + campo);
    return el ? el.value.trim() : "";
  }

  function leerDatos() {
    return {
      name: valorDe("name"),
      phone: valorDe("phone"),
      email: valorDe("email"),
      income: valorDe("income"),
      dicom: valorDe("dicom"),
      message: qs("#f-message") ? qs("#f-message").value.trim() : "",
    };
  }

  /* Todas las reglas se evaluan contra el valor leido del formulario, no
     contra el elemento: un <fieldset> no tiene propiedad .value, asi que
     leerlo directamente daria "undefined" y marcaria error sin motivo. */
  function reglaDe(campo) {
    for (var i = 0; i < reglas.length; i++) {
      if (reglas[i].campo === campo) return reglas[i];
    }
    return null;
  }

  function esValido(campo, datos) {
    var regla = reglaDe(campo);
    return regla ? regla.validar(datos[campo]) === true : true;
  }

  function setError(campo, show) {
    var regla = reglaDe(campo);
    if (!regla) return;
    var errorEl = document.getElementById(regla.error);
    if (!errorEl) return;

    /* En un grupo de opciones el aviso vive en el <fieldset>. */
    if (grupos[campo]) {
      var fieldset = grupos[campo];
      fieldset.classList.toggle("is-invalid", show);
      fieldset.setAttribute("aria-invalid", String(show));
      errorEl.textContent = show ? regla.mensaje : "";
      if (show) {
        fieldset.setAttribute("aria-describedby", regla.error);
      } else {
        fieldset.removeAttribute("aria-describedby");
      }
      return;
    }

    var field = document.getElementById(regla.id);
    if (!field) return;
    field.classList.toggle("is-invalid", show);
    field.setAttribute("aria-invalid", String(show));
    if (show) {
      errorEl.textContent = regla.mensaje;
      field.setAttribute("aria-describedby", regla.error);
    } else {
      errorEl.textContent = "";
      field.removeAttribute("aria-describedby");
    }
  }

  /* Al marcar una opcion el error del grupo desaparece al instante. */
  qsa("[data-grupo]", form).forEach(function (fieldset) {
    var campo = fieldset.getAttribute("data-grupo");
    grupos[campo] = fieldset;
    fieldset.addEventListener("change", function () {
      if (qs('input[name="' + campo + '"]:checked', form)) {
        setError(campo, false);
      }
    });
  });

  /* Los campos de texto se revisan al salir y al escribir.
     Los grupos ya se atienden con el evento "change" de arriba. */
  reglas.forEach(function (regla) {
    if (grupos[regla.campo]) return;
    var field = document.getElementById(regla.id);
    if (!field) return;
    function revisar() {
      setError(regla.campo, !esValido(regla.campo, leerDatos()));
    }
    field.addEventListener("blur", revisar);
    field.addEventListener("input", function () {
      if (field.classList.contains("is-invalid")) {
        revisar();
      }
    });
  });

  var consent = document.getElementById("f-consent");
  var consentError = document.getElementById("err-consent");
  if (consent) {
    consent.addEventListener("change", function () {
      if (consent.checked && consentError) {
        consentError.textContent = "";
      }
    });
  }

  function setStatus(message, kind) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.remove("is-ok", "is-error");
    if (kind) {
      statusEl.classList.add(kind);
    }
  }

  function buildMessage(data) {
    var lines = [
      "Hola Capitalizarme, quiero invertir en un inmueble.",
      "",
      "Nombre: " + data.name,
      "Teléfono: " + data.phone,
      "Correo: " + data.email,
    ];
    if (V) {
      var ingreso = V.textoIngreso(data.income);
      if (ingreso) {
        lines.push("Ingreso mensual: " + ingreso);
      }
      var dicom = V.textoDicom(data.dicom);
      if (dicom) {
        lines.push("DICOM: " + dicom);
      }
    }
    if (data.message) {
      lines.push("", "Mensaje: " + data.message);
    }
    return lines.join("\n");
  }

  function setLoading(loading) {
    if (!submitBtn) return;
    submitBtn.disabled = loading;
    submitBtn.classList.toggle("is-loading", loading);
    if (submitLabel) {
      submitLabel.textContent = loading ? "Enviando..." : "Solicitar asesoria";
    }
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var firstInvalid = null;
    var datos = leerDatos();

    /* Revisa los 5 campos obligatorios en el orden en que aparecen. */
    reglas.forEach(function (regla) {
      var valid = esValido(regla.campo, datos);
      setError(regla.campo, !valid);
      if (valid) return;
      // En los grupos de opciones el foco va a la primera opcion.
      var destino = grupos[regla.campo]
        ? qs('input[name="' + regla.campo + '"]', form)
        : document.getElementById(regla.id);
      if (destino && !firstInvalid) {
        firstInvalid = destino;
      }
    });

    if (consent && !consent.checked) {
      if (consentError) {
        consentError.textContent = "Necesitamos tu autorización para poder contactarte.";
      }
      if (!firstInvalid) {
        firstInvalid = consent;
      }
    }

    if (firstInvalid) {
      setStatus("Revisa los campos marcados para enviar el formulario.", "is-error");
      firstInvalid.focus({ preventScroll: false });
      return;
    }

    // limpiar() recorta espacios y descarta cualquier clave inesperada.
    var data = V ? V.limpiar(datos) : datos;

    if (CONFIG.formEndpoint) {
      setLoading(true);
      fetch(CONFIG.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      })
        .then(function (response) {
          if (!response.ok) {
            throw new Error("HTTP " + response.status);
          }
          form.reset();
          setStatus("¡Gracias! Recibimos tu solicitud y te responderemos en menos de 24 horas hábiles.", "is-ok");
        })
        .catch(function () {
          setStatus("No pudimos enviar el formulario. Intenta de nuevo o escríbenos por WhatsApp.", "is-error");
        })
        .then(function () {
          setLoading(false);
        });
      return;
    }

    if (CONFIG.whatsappNumber) {
      var url = "https://wa.me/" + digitsOnly(CONFIG.whatsappNumber) + "?text=" + encodeURIComponent(buildMessage(data));
      window.open(url, "_blank", "noopener");
      setStatus("Abrimos WhatsApp con tu solicitud ya redactada. Envíala para completarla.", "is-ok");
      return;
    }

    setStatus(
      "El formulario está pendiente de configuración. Escríbenos por los teléfonos del pie de página.",
      "is-error"
    );
  });
})();
