/* Pruebas de las reglas del formulario de inscripcion.
   Se ejecutan con el test runner que Node ya trae, sin instalar nada:
     node --test landing/tests/
*/

var test = require("node:test");
var assert = require("node:assert/strict");
var V = require("../validacion.js");

function datosValidos(extra) {
  var base = {
    name: "Maria Fernandez",
    phone: "+56912345678",
    email: "maria@correo.cl",
    income: "1-3-a-2",
    dicom: "nunca",
    message: "",
  };
  return Object.assign(base, extra || {});
}

/* ----------------------------- Nombre ----------------------------- */

test("nombre: acepta nombres de 3 caracteres o mas", function () {
  assert.equal(V.nombreValido("Ana"), true);
  assert.equal(V.nombreValido("Maria Fernandez"), true);
});

test("nombre: rechaza vacio, solo espacios y muy corto", function () {
  assert.equal(V.nombreValido(""), false);
  assert.equal(V.nombreValido("   "), false);
  assert.equal(V.nombreValido("  A  "), false);
  assert.equal(V.nombreValido("Jo"), false);
});

/* ---------------------------- Telefono ----------------------------- */

test("telefono: acepta entre 7 y 15 digitos", function () {
  assert.equal(V.telefonoValido("9123456"), true);
  assert.equal(V.telefonoValido("+56 9 1234 5678"), true);
  assert.equal(V.telefonoValido("+56912345678"), true);
});

test("telefono: cuenta solo los digitos, no los simbolos", function () {
  assert.equal(V.telefonoValido("+56 (9) 1234-5678"), true);
  assert.equal(V.telefonoValido("(9) 1234 567"), true);
});

test("telefono: rechaza vacio, muy corto y demasiado largo", function () {
  assert.equal(V.telefonoValido(""), false);
  assert.equal(V.telefonoValido("123456"), false);
  assert.equal(V.telefonoValido("1234567890123456"), false);
});

/* ----------------------------- Correo ------------------------------ */

test("correo: acepta formatos validos", function () {
  assert.equal(V.emailValido("maria@correo.cl"), true);
  assert.equal(V.emailValido("maria.perez@correo.com.ar"), true);
});

test("correo: rechaza formatos invalidos", function () {
  assert.equal(V.emailValido(""), false);
  assert.equal(V.emailValido("maria"), false);
  assert.equal(V.emailValido("maria@"), false);
  assert.equal(V.emailValido("maria@correo"), false);
  assert.equal(V.emailValido("maria @correo.cl"), false);
  assert.equal(V.emailValido("maria@correo.cl "), true, "los espacios al final se limpian");
});

/* ------------------------ Ingreso mensual -------------------------- */

test("ingreso: acepta los 3 rangos", function () {
  assert.equal(V.opcionValida("menos-1-3", V.INGRESOS), true);
  assert.equal(V.opcionValida("1-3-a-2", V.INGRESOS), true);
  assert.equal(V.opcionValida("mas-de-2", V.INGRESOS), true);
});

test("ingreso: rechaza vacio y valores inventados", function () {
  assert.equal(V.opcionValida("", V.INGRESOS), false);
  assert.equal(V.opcionValida("   ", V.INGRESOS), false);
  assert.equal(V.opcionValida("millonario", V.INGRESOS), false);
  assert.equal(V.opcionValida("menos-130", V.INGRESOS), false);
});

test("ingreso: son exactamente 3 opciones y sus textos son los acordados", function () {
  assert.equal(V.INGRESOS.length, 3);
  assert.deepEqual(
    V.INGRESOS.map(function (o) {
      return o.texto;
    }),
    ["Menos de $1.300.000", "Entre $1.300.000 y $2.000.000", "Mas de $2.000.000"]
  );
});

/* ------------------------------ DICOM ------------------------------ */

test("DICOM: acepta las 3 opciones", function () {
  assert.equal(V.opcionValida("actualmente", V.DICOM), true);
  assert.equal(V.opcionValida("hace-tiempo", V.DICOM), true);
  assert.equal(V.opcionValida("nunca", V.DICOM), true);
});

test("DICOM: rechaza vacio y valores inventados", function () {
  assert.equal(V.opcionValida("", V.DICOM), false);
  assert.equal(V.opcionValida("moroso", V.DICOM), false);
});

test("DICOM: son exactamente 3 opciones y sus textos son los acordados", function () {
  assert.equal(V.DICOM.length, 3);
  assert.deepEqual(
    V.DICOM.map(function (o) {
      return o.texto;
    }),
    [
      "Actualmente estoy en DICOM",
      "Estuve en DICOM hace tiempo",
      "Nunca he estado en DICOM",
    ]
  );
});

/* ---------------------------- Mensaje ------------------------------ */

test("mensaje: es opcional, siempre valido", function () {
  assert.equal(V.mensajeValido(""), true);
  assert.equal(V.mensajeValido("   "), true);
  assert.equal(V.mensajeValido("quiero invertir"), true);
});

/* --------------------------- Formulario ---------------------------- */

test("revisar: un formulario completo no tiene errores", function () {
  assert.deepEqual(V.revisar(datosValidos()), []);
});

test("revisar: sin ingresos y sin DICOM reporta los dos campos", function () {
  var malos = V.revisar(datosValidos({ income: "", dicom: "" }));
  assert.equal(malos.length, 2);
  assert.deepEqual(
    malos.map(function (m) {
      return m.campo;
    }),
    ["income", "dicom"]
  );
});

test("revisar: mensaje vacio no genera error", function () {
  assert.deepEqual(V.revisar(datosValidos({ message: "" })), []);
});

test("revisar: detecta nombre, telefono y correo mal escritos", function () {
  var malos = V.revisar(datosValidos({ name: "A", phone: "12", email: "maria@" }));
  assert.equal(malos.length, 3);
});

test("revisar: cada error trae un mensaje para la persona", function () {
  var malos = V.revisar({});
  assert.equal(malos.length, 5, "los 5 campos obligatorios");
  malos.forEach(function (m) {
    assert.ok(m.mensaje && m.mensaje.length > 10, "mensaje util para " + m.etiqueta);
  });
});

test("revisar: un objeto vacio o ausente no rompe nada", function () {
  assert.equal(V.revisar({}).length, 5);
  assert.equal(V.revisar().length, 5);
  assert.equal(V.revisar(null).length, 5);
});

test("revisar: un valor de opcion manipulado se rechaza", function () {
  var malos = V.revisar(datosValidos({ income: "100 millones", dicom: "tengo-una-hipoteca" }));
  assert.equal(malos.length, 2);
});

/* ---------------------------- Limpieza ----------------------------- */

test("limpiar: recorta espacios y deja solo las claves conocidas", function () {
  var limpio = V.limpiar({
    name: "  Maria Fernandez  ",
    phone: " +56912345678 ",
    email: " maria@correo.cl ",
    income: "mas-de-2",
    dicom: "hace-tiempo",
    message: "  hola  ",
    hack: "no deberia pasar",
  });
  assert.deepEqual(limpio, {
    name: "Maria Fernandez",
    phone: "+56912345678",
    email: "maria@correo.cl",
    income: "mas-de-2",
    dicom: "hace-tiempo",
    message: "hola",
  });
  assert.equal("hack" in limpio, false);
});

test("limpiar: una opcion invalida queda vacia en vez de viajar", function () {
  var limpio = V.limpiar(datosValidos({ income: "inventado", dicom: "inventado" }));
  assert.equal(limpio.income, "");
  assert.equal(limpio.dicom, "");
});

/* ------------------------- Textos visibles ------------------------- */

test("los valores tecnicos se traducen al texto que ve la persona", function () {
  assert.equal(V.textoIngreso("menos-1-3"), "Menos de $1.300.000");
  assert.equal(V.textoIngreso("1-3-a-2"), "Entre $1.300.000 y $2.000.000");
  assert.equal(V.textoIngreso("mas-de-2"), "Mas de $2.000.000");
  assert.equal(V.textoIngreso(""), "");

  assert.equal(V.textoDicom("actualmente"), "Actualmente estoy en DICOM");
  assert.equal(V.textoDicom("hace-tiempo"), "Estuve en DICOM hace tiempo");
  assert.equal(V.textoDicom("nunca"), "Nunca he estado en DICOM");
  assert.equal(V.textoDicom("inventado"), "");
});

/* --------------------------- Sin proyecto -------------------------- */

test("ya no existe el campo de proyecto de interes", function () {
  var nombres = V.REGLAS.map(function (r) {
    return r.campo;
  });
  assert.equal(nombres.indexOf("project"), -1);
});

test("las reglas cubren exactamente los 5 campos obligatorios", function () {
  assert.deepEqual(
    V.REGLAS.map(function (r) {
      return r.campo;
    }),
    ["name", "phone", "email", "income", "dicom"]
  );
});