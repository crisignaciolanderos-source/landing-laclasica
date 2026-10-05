/* =====================================================================
   Capitalizarme - reglas de validacion del formulario de inscripcion.

   Este archivo NO dibuja nada: solo contiene las reglas puras que
   decidir si un campo esta bien o mal. Eso permite probarlas por
   separado (ver tests/validacion.test.js) sin abrir un navegador.

   Funciona en los dos lados:
     - en la pagina, como script normal (expone window.CRMValidacion)
     - en Node, con require() para las pruebas

   Al escribir o cambiar algo aqui, recuerda: estas mismas reglas se
   tendran que repetir en el servidor cuando se conecte el envio real.
   ===================================================================== */

(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  } else {
    root.CRMValidacion = api;
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /* Valores permitidos de "Ingreso mensual". Son los unicos que el
     formulario acepta; cualquier otro texto se descarta. */
  var INGRESOS = [
    { valor: "menos-1-3", texto: "Menos de $1.300.000" },
    { valor: "1-3-a-2", texto: "Entre $1.300.000 y $2.000.000" },
    { valor: "mas-de-2", texto: "Mas de $2.000.000" },
  ];

  /* Valores permitidos de "Situacion DICOM". */
  var DICOM = [
    { valor: "actualmente", texto: "Actualmente estoy en DICOM" },
    { valor: "hace-tiempo", texto: "Estuve en DICOM hace tiempo" },
    { valor: "nunca", texto: "Nunca he estado en DICOM" },
  ];

  function texto(valor) {
    return typeof valor === "string" ? valor.trim() : "";
  }

  function soloDigitos(valor) {
    return texto(valor).replace(/\D+/g, "");
  }

  function emailValido(valor) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(texto(valor));
  }

  function nombreValido(valor) {
    return texto(valor).length >= 3;
  }

  function telefonoValido(valor) {
    var digitos = soloDigitos(valor);
    return digitos.length >= 7 && digitos.length <= 15;
  }

  /* Una opcion es valida solo si esta en la lista. Esto descarta que
     alguien escriba un valor inventado manipulando la pagina. */
  function opcionValida(valor, lista) {
    var actual = texto(valor);
    if (!actual) return false;
    return lista.some(function (item) {
      return item.valor === actual;
    });
  }

  /* El mensaje es opcional: siempre es valido, incluso vacio. */
  function mensajeValido() {
    return true;
  }

  /* ---------------------------------------------------------------
     Cada regla del formulario: campo, como se valida y que mensaje
     se le muestra a la persona si esta mal.
     --------------------------------------------------------------- */
  var REGLAS = [
    {
      campo: "name",
      id: "f-name",
      error: "err-name",
      etiqueta: "nombre",
      validar: nombreValido,
      mensaje: "Escribe tu nombre (minimo 3 caracteres).",
    },
    {
      campo: "phone",
      id: "f-phone",
      error: "err-phone",
      etiqueta: "telefono",
      validar: telefonoValido,
      mensaje: "Escribe un telefono o WhatsApp valido (solo numeros).",
    },
    {
      campo: "email",
      id: "f-email",
      error: "err-email",
      etiqueta: "correo",
      validar: emailValido,
      mensaje: "Escribe un correo valido, por ejemplo nombre@correo.com.",
    },
    {
      campo: "income",
      id: "f-income-group",
      error: "err-income",
      etiqueta: "ingreso",
      validar: function (valor) {
        return opcionValida(valor, INGRESOS);
      },
      mensaje: "Elige un rango de ingreso mensual.",
    },
    {
      campo: "dicom",
      id: "f-dicom-group",
      error: "err-dicom",
      etiqueta: "DICOM",
      validar: function (valor) {
        return opcionValida(valor, DICOM);
      },
      mensaje: "Elige una opcion de DICOM.",
    },
  ];

  /* Devuelve la lista de campos que estan mal, en el orden en que
     aparecen en el formulario. Si todo esta bien, devuelve []. */
  function revisar(datos) {
    var valores = datos || {};
    var malos = [];
    REGLAS.forEach(function (regla) {
      if (!regla.validar(valores[regla.campo])) {
        malos.push({ campo: regla.campo, etiqueta: regla.etiqueta, mensaje: regla.mensaje });
      }
    });
    return malos;
  }

  /* Normaliza los datos antes de enviarlos: texto limpio y solo las
     claves conocidas. Asi nada inesperado viaja al servidor. */
  function limpiar(datos) {
    var entrada = datos || {};
    var salida = {
      name: texto(entrada.name),
      phone: texto(entrada.phone),
      email: texto(entrada.email),
      income: opcionValida(entrada.income, INGRESOS) ? texto(entrada.income) : "",
      dicom: opcionValida(entrada.dicom, DICOM) ? texto(entrada.dicom) : "",
      message: texto(entrada.message),
    };
    return salida;
  }

  /* Convierte un valor tecnico en el texto que ve la persona. */
  function textoOpcion(valor, lista) {
    var encontrado = lista.filter(function (item) {
      return item.valor === texto(valor);
    })[0];
    return encontrado ? encontrado.texto : "";
  }

  function textoIngreso(valor) {
    return textoOpcion(valor, INGRESOS);
  }

  function textoDicom(valor) {
    return textoOpcion(valor, DICOM);
  }

  /* Llena los <option> de un <select> a partir de la lista, dejando
     primero la opcion vacia. Se usa para generar el HTML desde JS si
     mas adelante se agregan mas opciones. */
  function opcionesHtml(lista) {
    return lista
      .map(function (item) {
        return '<option value="' + item.valor + '">' + item.texto + "</option>";
      })
      .join("");
  }

  return {
    INGRESOS: INGRESOS,
    DICOM: DICOM,
    REGLAS: REGLAS,
    nombreValido: nombreValido,
    telefonoValido: telefonoValido,
    emailValido: emailValido,
    opcionValida: opcionValida,
    mensajeValido: mensajeValido,
    soloDigitos: soloDigitos,
    revisar: revisar,
    limpiar: limpiar,
    textoIngreso: textoIngreso,
    textoDicom: textoDicom,
    opcionesHtml: opcionesHtml,
  };
});