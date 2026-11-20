#!/usr/bin/env python3
"""Busca el último video de YouTube y de TikTok y actualiza data/publicaciones.json.

Lo ejecuta GitHub automáticamente (ver .github/workflows). Si algo falla, no toca
lo que ya estaba guardado y el proceso termina sin error.
"""
import json
import pathlib
import re
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

RAIZ = pathlib.Path(__file__).resolve().parent.parent
JSON_RUTA = RAIZ / "data" / "publicaciones.json"
TIKTOK_MANUAL = RAIZ / "data" / "tiktok_ultimo.txt"
CARPETA_IMG = RAIZ / "img" / "ultimos"

YOUTUBE_CANAL = "UCg8D8vsJX5izERwKosD30gg"
TIKTOK_USUARIO = "teondres"

NS = {"a": "http://www.w3.org/2005/Atom", "yt": "http://www.youtube.com/xml/schemas/2015"}
AGENTE = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
          "(KHTML, like Gecko) Chrome/124.0 Safari/537.36")


def descargar(url, binario=False):
    peticion = urllib.request.Request(url, headers={"User-Agent": AGENTE, "Accept-Language": "es,en;q=0.8"})
    with urllib.request.urlopen(peticion, timeout=30) as respuesta:
        datos = respuesta.read()
    return datos if binario else datos.decode("utf-8", "replace")


def guardar_imagen(urls, nombre):
    """Prueba cada dirección hasta que una sirva; guarda la imagen en img/ultimos."""
    CARPETA_IMG.mkdir(parents=True, exist_ok=True)
    for url in urls:
        try:
            datos = descargar(url, binario=True)
        except Exception as error:
            print("  no se pudo bajar", url, "->", error)
            continue
        if len(datos) > 2000:
            (CARPETA_IMG / nombre).write_bytes(datos)
            return True
    return False


# ---------------- YouTube ----------------
def leer_feed_youtube(texto_xml):
    entrada = ET.fromstring(texto_xml).find("a:entry", NS)
    if entrada is None:
        return None
    return {
        "id": entrada.find("yt:videoId", NS).text,
        "titulo": " ".join(entrada.find("a:title", NS).text.split()),
    }


def actualizar_youtube(datos):
    feed = descargar("https://www.youtube.com/feeds/videos.xml?channel_id=" + YOUTUBE_CANAL)
    video = leer_feed_youtube(feed)
    if not video:
        print("YouTube: el canal no tiene videos")
        return
    base = "https://i.ytimg.com/vi/" + video["id"]
    if guardar_imagen([base + "/maxresdefault.jpg", base + "/mqdefault.jpg"], "youtube.jpg"):
        datos["youtube"] = {
            "titulo": video["titulo"],
            "imagen": "img/ultimos/youtube.jpg?v=" + video["id"],
            "enlace": "https://www.youtube.com/watch?v=" + video["id"],
        }
        print("YouTube: listo ->", video["titulo"])
    else:
        print("YouTube: no se pudo bajar la portada")


# ---------------- TikTok ----------------
def url_video_tiktok():
    """1) la dirección escrita a mano en data/tiktok_ultimo.txt; 2) si no hay, se intenta leer el perfil."""
    if TIKTOK_MANUAL.exists():
        texto = TIKTOK_MANUAL.read_text(encoding="utf-8").strip()
        if texto.startswith("http"):
            return texto
    html = descargar("https://www.tiktok.com/@" + TIKTOK_USUARIO)
    for patron in (r"tiktok\.com/@" + TIKTOK_USUARIO + r"/video/(\d{15,22})",
                   r'"itemList":\["(\d{15,22})"'):
        encontrado = re.search(patron, html)
        if encontrado:
            return "https://www.tiktok.com/@%s/video/%s" % (TIKTOK_USUARIO, encontrado.group(1))
    return None


def actualizar_tiktok(datos):
    url = url_video_tiktok()
    if not url:
        print("TikTok: no se encontró el último video (escribe su enlace en data/tiktok_ultimo.txt)")
        return
    info = json.loads(descargar("https://www.tiktok.com/oembed?url=" + urllib.parse.quote(url, safe="")))
    miniatura = info.get("thumbnail_url")
    if miniatura and guardar_imagen([miniatura], "tiktok.jpg"):
        identificador = url.rstrip("/").split("/")[-1]
        datos["tiktok"] = {
            "titulo": " ".join((info.get("title") or "Último video").split()),
            "imagen": "img/ultimos/tiktok.jpg?v=" + identificador,
            "enlace": url,
        }
        print("TikTok: listo ->", url)
    else:
        print("TikTok: no se pudo bajar la portada")


def main():
    try:
        datos = json.loads(JSON_RUTA.read_text(encoding="utf-8"))
    except Exception:
        datos = {}
    for nombre, funcion in (("YouTube", actualizar_youtube), ("TikTok", actualizar_tiktok)):
        try:
            funcion(datos)
        except Exception as error:
            print(nombre + ": falló ->", error)
    JSON_RUTA.parent.mkdir(parents=True, exist_ok=True)
    JSON_RUTA.write_text(json.dumps(datos, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
