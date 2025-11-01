// tipsa-service.js
import fetch from "node-fetch";
import fetchCookie from "fetch-cookie";
import { CookieJar } from "tough-cookie";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const cheerio = require("cheerio");
const he = require("he");

const jar = new CookieJar();
const fetchWithCookies = fetchCookie(fetch, jar);

const POST_URL = "https://dinapaqweb.tipsa-dinapaq.com/consultaDestinatarios/detalle_envio_res_dest.php";
const GET_URL = "https://dinapaqweb.tipsa-dinapaq.com/consultaDestinatarios/detalle_envio_dest.php";

export default async function tipsaTracking(envio) {
  if (!envio) throw new Error("Se requiere un código de envío");

  const params = new URLSearchParams();
  params.append("busqueda", "servicio");
  params.append("envio", envio);
  params.append("referencia", "");
  params.append("cliente", "");

  // 1️⃣ Hacer el POST para generar la cookie de sesión
  await fetchWithCookies(POST_URL, {
    method: "POST",
    body: params.toString(),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Origin": "https://www.tip-sa.com",
      "Referer": "https://www.tip-sa.com/",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    },
    redirect: "manual",
  });

  // 2️⃣ Luego obtener los datos del GET
  const resp = await fetchWithCookies(GET_URL, {
    headers: {
      "Referer": "https://www.tip-sa.com/",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    },
  });

  const html = await resp.text();
  const $ = cheerio.load(html);

  // 3️⃣ Parsear los datos
  const estado = $("#estado-localizado").val() || "";
  const poblacion_destino = $('div:contains("Población destino")').next(".mdl-cell--6-col").text().trim();
  const referencia = $('div:contains("Referencia")').next(".mdl-cell--6-col").text().trim();
  const bultos = $('div:contains("Bultos")').next(".mdl-cell--6-col").text().trim();
  const fecha = $('div:contains("Fecha")').next(".mdl-cell--6-col").text().trim();

  const nombre_agencia = $("#datos-generales-resto").eq(1).find('div:contains("Nombre")').next(".mdl-cell--6-col").text().trim();
  const direccion = $("#datos-generales-resto").eq(1).find('div:contains("Dirección")').next(".mdl-cell--6-col").text().trim();
  const poblacion_agencia = $("#datos-generales-resto").eq(1).find('div:contains("Población")').next(".mdl-cell--6-col").text().trim();
  const codigo_postal = $("#datos-generales-resto").eq(1).find('div:contains("Código Postal")').next(".mdl-cell--6-col").text().trim();

  const historial = [];
  $("#datos-generales-resto2 tbody tr").each((i, el) => {
    const celdas = $(el).find("td");
    historial.push({
      fecha_hora: $(celdas[0]).text().trim(),
      estado: $(celdas[1]).find("span").last().text().trim(),
      poblacion: $(celdas[2]).find("span").last().text().trim(),
    });
  });

  const trazabilidad = [];
  $(".stepper-item").each((i, el) => {
    const fecha_hora = $(el).find("span").first().text().trim();
    const titulo = $(el).find(".step-title").text().trim();
    const descripcion_raw = $("#descL_" + i).text().trim();
    const descripcion = he.decode(descripcion_raw.split(":")[1]?.trim().replace(/\s+/g, " ") || descripcion_raw);
    trazabilidad.push({ fecha_hora, titulo, descripcion });
  });

  // 4️⃣ 🔥 IMPORTANTE: devolver el resultado final
  return {
    ok: true,
    resumen: { numero_envio: envio, estado },
    datos_generales: { poblacion_destino, estado_actual: estado, referencia, bultos, fecha },
    datos_agencia_destino: { nombre_agencia, direccion, poblacion_agencia, codigo_postal },
    trazabilidad,
    historial,
  };
}
