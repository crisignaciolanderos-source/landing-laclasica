/* Pruebas de coherencia entre el formulario real (index.html, script.js,
   styles.css) y las reglas de validacion (validacion.js).

   Estas pruebas no necesitan navegador: revisan que el HTML que se publica
   y el JS que se ejecutan sean el mismo formulario. Asi un campo nuevo no
   puede quedar con un valor que el validador nunca aceptara.

   Se ejecutan con el test runner que Node ya trae, sin instalar nada:
     node --test landing/tests/
*/

var test = require("node:test");
var assert = require("node:assert/strict");
var fs = require("node:fs");
var path = require("node:path");
var V = require("../validacion.js");

var LANDING = path.join(__dirname, "..");
var html = fs.readFileSync(path.join(LANDING, "index.html"), "utf8");
var css = fs.readFileSync(path.join(LANDING, "styles.css"), "utf8");
var js = fs.readFileSync(path.join(LANDING, "script.js"), "utf8");

/* Extrae los value="" de los <input type="radio" name="X"> del HTML. */
function radiosDe(campo) {
  var re = new RegExp('type="radio"\\s+name="' + campo + '"\\s+value="([^"]+)"', "g");
  var valores = [];
  var m;
  while ((m = re.exec(html)) !== null) {
    valores.push(m[1]);
  }
  return valores;
}

/* ----------------------------- Campos ----------------------------- */

test("el formulario tiene los 5 campos obligatorios y el mensaje opcional", function () {
  ["f-name", "f-phone", "f-email", "f-income-group", "f-dicom-group"].forEach(function (id) {
    assert.ok(html.indexOf('id="' + id + '"') !== -1, "falta el campo " + id);
  });
  assert.ok(html.indexOf('id="f-message"') !== -1, "falta el campo de mensaje");
});

test("el campo de proyecto de interes ya no esta en el formulario", function () {
  assert.equal(html.indexOf("f-project"), -1, "el selector de proyecto debe estar eliminado");
  assert.equal(html.indexOf('name="project"'), -1);
  assert.equal(js.indexOf("projectSelect"), -1, "no debe quedar la variable vieja");
  assert.equal(js.indexOf('data.project'), -1, "el proyecto no debe enviarse al Excel");
});

test("todos los campos obligatorios estan marcados como requeridos en el HTML", function () {
  ["f-name", "f-phone", "f-email", "f-consent"].forEach(function (id) {
    var re = new RegExp('id="' + id + '"[^>]*required');
    assert.ok(re.test(html), id + " deberia tener required");
  });
});

/* --------------------- Reglas contra el HTML --------------------- */

test("cada regla apunta a un id y a un mensaje de error que existen en el HTML", function () {
  V.REGLAS.forEach(function (regla) {
    assert.ok(
      html.indexOf('id="' + regla.id + '"') !== -1,
      "la regla " + regla.campo + " apunta a " + regla.id + " y ese id no existe"
    );
    assert.ok(
      html.indexOf('id="' + regla.error + '"') !== -1,
      "falta el mensaje de error " + regla.error
    );
    assert.ok(regla.mensaje.length > 0, regla.campo + " necesita un mensaje para la persona");
  });
});

test("el nombre de cada campo en las reglas existe como name en el HTML", function () {
  V.REGLAS.forEach(function (regla) {
    assert.ok(
      html.indexOf('name="' + regla.campo + '"') !== -1,
      "ningun control del formulario usa name=" + regla.campo
    );
  });
});

/* --------------------- Opciones del HTML vs reglas --------------------- */

test("las 3 opciones de ingreso del HTML son exactamente las que acepta el validador", function () {
  var enHtml = radiosDe("income");
  assert.equal(enHtml.length, 3, "deben existir 3 opciones de ingreso");
  enHtml.forEach(function (valor) {
    assert.equal(
      V.opcionValida(valor, V.INGRESOS),
      true,
      'el HTML ofrece el valor "' + valor + '" pero el validador no lo acepta'
    );
  });
  assert.deepEqual(
    enHtml.slice().sort(),
    V.INGRESOS.map(function (o) { return o.valor; }).sort()
  );
});

test("las 3 opciones de DICOM del HTML son exactamente las que acepta el validador", function () {
  var enHtml = radiosDe("dicom");
  assert.equal(enHtml.length, 3, "deben existir 3 opciones de DICOM");
  enHtml.forEach(function (valor) {
    assert.equal(
      V.opcionValida(valor, V.DICOM),
      true,
      'el HTML ofrece el valor "' + valor + '" pero el validador no lo acepta'
    );
  });
  assert.deepEqual(
    enHtml.slice().sort(),
    V.DICOM.map(function (o) { return o.valor; }).sort()
  );
});

test("cada opcion del HTML muestra el mismo texto que el validador", function () {
  ["income", "dicom"].forEach(function (campo) {
    radiosDe(campo).forEach(function (valor) {
      var texto = campo === "income" ? V.textoIngreso(valor) : V.textoDicom(valor);
      assert.ok(texto.length > 0, "falta el texto de " + campo + " " + valor);
      assert.ok(
        html.indexOf(texto) !== -1,
        'el texto "' + texto + '" no aparece en el HTML'
      );
    });
  });
});

/* --------------------- Carga de scripts --------------------- */

test("validacion.js se carga antes que script.js", function () {
  var iVal = html.indexOf('src="validacion.js"');
  var iScript = html.indexOf('src="script.js"');
  assert.ok(iVal !== -1, "falta la etiqueta script de validacion.js");
  assert.ok(iScript !== -1, "falta la etiqueta script de script.js");
  assert.ok(iVal < iScript, "validacion.js debe cargarse antes que script.js");
});

test("script.js usa el modulo de validacion en vez de reglas propias", function () {
  assert.ok(js.indexOf("CRMValidacion") !== -1, "script.js debe leer window.CRMValidacion");
  assert.ok(js.indexOf("V.REGLAS") !== -1, "script.js debe tomar las reglas de validacion.js");
  assert.ok(js.indexOf("V.limpiar") !== -1, "script.js debe limpiar los datos antes de enviarlos");
});

test("el mensaje de WhatsApp incluye ingreso y DICOM", function () {
  assert.ok(js.indexOf("textoIngreso") !== -1, "falta el ingreso en el mensaje");
  assert.ok(js.indexOf("textoDicom") !== -1, "falta el DICOM en el mensaje");
});

test("el consentimiento menciona que se tratan ingreso y DICOM", function () {
  var i = html.indexOf('id="f-consent"');
  assert.ok(i !== -1, "falta el consentimiento");
  var bloque = html.slice(i, i + 600);
  assert.ok(/dicom/i.test(bloque), "el aviso debe nombrar el dato DICOM que se pide");
});

test("existe el aviso corto de privacidad bajo el formulario", function () {
  var i = html.indexOf('class="form__legal"');
  assert.ok(i !== -1, "falta el aviso de privacidad");
  var bloque = html.slice(i, html.indexOf("</p>", i));
  assert.ok(/ingreso/i.test(bloque), "debe nombrar el rango de ingreso");
  assert.ok(/dicom/i.test(bloque), "debe nombrar el DICOM");
assert.ok(
      /data-mail-link/.test(bloque),
      "debe incluir el enlace de correo, que se rellena desde CONFIG.email"
    );
    assert.ok(/elimin|corrij/i.test(bloque), "debe explicar los derechos de la persona");
  });

test("el aviso de privacidad esta despues del cierre del formulario", function () {
  var cierre = html.indexOf("</form>");
  var aviso = html.indexOf('class="form__legal"');
  assert.ok(cierre !== -1 && aviso !== -1);
  assert.ok(aviso > cierre, "el aviso debe ir despues del formulario, no dentro");
});

test("el aviso de privacidad menciona el dato DICOM que se pide", function () {
  var i = html.indexOf('class="form__legal"');
  var bloque = html.slice(i, html.indexOf("</p>", i));
  assert.ok(/dicom/i.test(bloque), "debe nombrar el dato DICOM");
  assert.ok(/ingreso/i.test(bloque), "debe nombrar el rango de ingreso");
  assert.ok(
    /elimin|corrij/i.test(bloque),
    "debe explicar que puede pedir eliminar o corregir sus datos"
  );
});

test("el correo de contacto se configura en un solo lugar", function () {
  var i = js.indexOf("email: \"");
  assert.ok(i !== -1, "CONFIG.email debe tener un correo definido");
  var correo = js.slice(i + 8, js.indexOf("\"", i + 8));
  assert.ok(
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo),
    "el correo de CONFIG no es valido: " + correo
  );

  var conMailto = html.match(/mailto:[^"']+/g) || [];
  assert.deepEqual(
    conMailto,
    [],
    "no debe quedar ningun mailto escrito a mano en el HTML: " + conMailto.join(", ")
  );

  /* El texto del correo se deja escrito en el HTML a proposito, para que se
     pueda leer y copiar aunque el JavaScript no cargue. Lo que no se
     permite es que ese texto se desincronice de CONFIG.email. */
  var conTexto = html.match(/>[^<]*@[a-z0-9.-]+</gi) || [];
  conTexto.forEach(function (trozo) {
    assert.equal(
      ">" + correo + "<",
      trozo.toLowerCase(),
      "el texto de respaldo debe ser igual a CONFIG.email, o quedara desactualizado: " + trozo
    );
  });

  var enlaces = html.match(/data-mail-link/g) || [];
  assert.equal(enlaces.length, 2, "deben existir 2 enlaces de correo (aviso y pie)");
});

test("el aviso y el pie se rellenan desde CONFIG.email", function () {
  assert.ok(
    js.indexOf('if (el.hasAttribute("data-mail-text"))') !== -1,
    "el texto visible del correo debe actualizarse desde CONFIG"
  );
  assert.ok(js.indexOf('el.href = "mailto:" + CONFIG.email') !== -1);
});

test("los datos de contacto son de Chile", function () {
  var placeholder = html.match(/placeholder="(\+\d+[^"]*)"/);
  assert.ok(placeholder, "falta el ejemplo del telefono");
  assert.ok(
    placeholder[1].indexOf("+56") === 0,
    "el ejemplo del telefono deberia empezar con +56 (Chile), dice: " + placeholder[1]
  );
});

test("el estilo del aviso de privacidad existe", function () {
  assert.ok(css.indexOf(".form__legal") !== -1, "falta el estilo .form__legal");
});

test("el formulario envia exactamente los 6 campos acordados", function () {
  var esperado = ["name", "phone", "email", "income", "dicom", "message"];
  var i = js.indexOf("function leerDatos()");
  assert.ok(i !== -1, "falta leerDatos");
  var bloque = js.slice(i, i + 400);
  esperado.forEach(function (campo) {
    assert.ok(
      bloque.indexOf(campo + ": valorDe") !== -1 || bloque.indexOf(campo + ": qs(") !== -1,
      "leerDatos no manda el campo " + campo
    );
  });
  var claves = Object.keys(V.limpiar({}));
  assert.deepEqual(claves.sort(), esperado.slice().sort());
});

test("las imagenes buscan primero el .webp para no cargar un PNG pesado", function () {
  var i = js.indexOf("var EXTENSIONES");
  assert.ok(i !== -1, "falta la lista de extensiones");
  var lista = js.slice(i, js.indexOf("];", i));
  assert.ok(lista.indexOf('".webp"') !== -1, "debe incluir webp");
  assert.ok(
    lista.indexOf('".webp"') < lista.indexOf('".png"'),
    "webp debe probarse antes que png, si no la pagina carga el PNG de 1,6 MB"
  );
  assert.ok(fs.existsSync(path.join(LANDING, "assets", "img", "hero-proyecto.webp")),
    "falta la version ligera de la imagen principal");
});

test("la imagen principal pesa poco para abrirla en datos moviles", function () {
  var webp = fs.statSync(path.join(LANDING, "assets", "img", "hero-proyecto.webp")).size;
  assert.ok(
    webp < 400 * 1024,
    "la imagen principal deberia pesar menos de 400 KB, pesa " + Math.round(webp / 1024) + " KB"
  );
});

/* --------------------- Estilos --------------------- */

test("existen los estilos de las tarjetas de opcion y sus estados", function () {
  [".choice__opcion", ".field--group", ".field__legend", ".choice__texto"].forEach(function (sel) {
    assert.ok(css.indexOf(sel) !== -1, "falta el estilo " + sel);
  });
  assert.ok(css.indexOf(":has(input:checked)") !== -1, "falta el estilo de opcion marcada");
  assert.ok(css.indexOf(":has(input:focus-visible)") !== -1, "falta el foco visible con teclado");
  assert.ok(
    css.indexOf(".field--group.is-invalid") !== -1,
    "falta el estilo de grupo con error"
  );
});

test("el borde de foco de los campos ya no usa el blanco (seria invisible)", function () {
  var bloque = css.slice(css.indexOf(".field input:focus"), css.indexOf(".field input:focus") + 220);
  assert.ok(bloque.indexOf("navy") !== -1, "el foco de los campos debe usar el azul");
  assert.equal(bloque.indexOf("--gold"), -1, "el dorado ahora es blanco: no puede ser el foco");
});

test("la casilla de consentimiento se pinta con el azul, no con el blanco", function () {
  assert.ok(css.indexOf("accent-color: var(--navy-600)") !== -1);
  assert.equal(css.indexOf("accent-color: var(--gold"), -1);
});

test("en celular las tres opciones se apilan", function () {
  var iCel = css.indexOf("@media (max-width: 640px)");
  assert.ok(iCel !== -1, "falta la regla para celular");
  var bloque = css.slice(iCel, css.indexOf("}", css.indexOf(".choice {", iCel)));
  assert.ok(bloque.indexOf("minmax(0, 1fr)"), "las opciones deben ocupar una columna en celular");
});

test("el CSS esta balanceado", function () {
  var abiertas = (css.match(/\{/g) || []).length;
  var cerradas = (css.match(/\}/g) || []).length;
  assert.equal(abiertas, cerradas, "llaves desbalanceadas en styles.css");
});