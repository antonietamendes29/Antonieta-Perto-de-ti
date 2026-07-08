/* ==========================================================
   Perto de Ti - mapa.js
   Mapa interactivo (Google Maps JavaScript API) usado na
   página de cadastro para o utilizador indicar a sua
   localização de serviço.

   Funcionalidades:
   - Marcador arrastável (o utilizador pode mover para afinar)
   - Clique no mapa move o marcador para esse ponto
   - Pesquisa por morada/bairro/município (Places Autocomplete)
   - Guarda a latitude/longitude em campos escondidos do
     formulário, prontos a ser enviados com o cadastro
   ========================================================== */

// Centro por omissão: Luanda, Angola
const CENTRO_PADRAO = { lat: -8.8368, lng: 13.2343 };

let mapaCadastro;
let marcadorCadastro;

// Esta função é chamada automaticamente pela Google Maps API
// assim que o script termina de carregar (ver o "callback=" no
// URL do script, em cadastro.html).
function inicializarMapaCadastro() {
    const elementoMapa = document.getElementById("mapa-cadastro");
    if (!elementoMapa) {
        return; // esta página não tem o mapa de cadastro
    }

    mapaCadastro = new google.maps.Map(elementoMapa, {
        center: CENTRO_PADRAO,
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
    });

    marcadorCadastro = new google.maps.Marker({
        position: CENTRO_PADRAO,
        map: mapaCadastro,
        draggable: true,
        title: "A tua localização de serviço",
    });

    atualizarCoordenadas(CENTRO_PADRAO);

    // arrastar o marcador actualiza os campos escondidos
    marcadorCadastro.addListener("dragend", function () {
        atualizarCoordenadas(marcadorCadastro.getPosition());
    });

    // clicar em qualquer ponto do mapa move o marcador para lá
    mapaCadastro.addListener("click", function (evento) {
        marcadorCadastro.setPosition(evento.latLng);
        atualizarCoordenadas(evento.latLng);
    });

    inicializarPesquisaMorada();
}

// Actualiza os campos escondidos do formulário e o texto visível
// com as coordenadas seleccionadas (lat/lng podem vir como
// objecto simples {lat,lng} ou como google.maps.LatLng)
function atualizarCoordenadas(posicao) {
    const lat = typeof posicao.lat === "function" ? posicao.lat() : posicao.lat;
    const lng = typeof posicao.lng === "function" ? posicao.lng() : posicao.lng;

    const campoLat = document.getElementById("latitude");
    const campoLng = document.getElementById("longitude");
    if (campoLat) campoLat.value = lat;
    if (campoLng) campoLng.value = lng;

    const texto = document.getElementById("mapa-coordenadas");
    if (texto) {
        texto.textContent = "Localização seleccionada: " + lat.toFixed(5) + ", " + lng.toFixed(5);
    }
}

// Pesquisa por morada/bairro (Google Places Autocomplete):
// ao escolher um resultado, o mapa centra-se lá e move o marcador
function inicializarPesquisaMorada() {
    const campoPesquisa = document.getElementById("localizacao-busca");
    if (!campoPesquisa) {
        return;
    }

    const autocomplete = new google.maps.places.Autocomplete(campoPesquisa, {
        componentRestrictions: { country: "ao" }, // restringe a resultados em Angola
        fields: ["geometry", "formatted_address"],
    });

    autocomplete.addListener("place_changed", function () {
        const local = autocomplete.getPlace();
        if (!local.geometry || !local.geometry.location) {
            return; // o utilizador escreveu algo sem escolher uma sugestão válida
        }

        mapaCadastro.setCenter(local.geometry.location);
        mapaCadastro.setZoom(15);
        marcadorCadastro.setPosition(local.geometry.location);
        atualizarCoordenadas(local.geometry.location);
    });
}
