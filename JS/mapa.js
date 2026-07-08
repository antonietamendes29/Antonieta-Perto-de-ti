/* ==========================================================
   Perto de Ti - mapa.js
   Mapa interactivo (Google Maps JavaScript API) usado na
   página de cadastro para o utilizador indicar a sua
   localização de serviço.

   Funcionalidades:
   - Marcador arrastável (o utilizador pode mover para afinar)
   - Clique no mapa move o marcador para esse ponto
   - Pesquisa por morada/bairro/município (Nominatim OpenStreetMap - Gratuito)
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

// Pesquisa por morada/bairro/município: Usa a API pública do Nominatim (OpenStreetMap)
// para evitar custos e a necessidade de ativar faturação/cartão na Google Cloud.
// O resultado atualiza o mapa e o marcador do Google Maps que já estão a funcionar.
function inicializarPesquisaMorada() {
    const campoPesquisa = document.getElementById("localizacao-busca");
    const botaoPesquisar = document.getElementById("botao-pesquisar-mapa");
    const campoErro = document.getElementById("erro-localizacao");
    if (!campoPesquisa || !botaoPesquisar) {
        return;
    }

    // Transformada em função assíncrona para usar fetch/await de forma limpa
    async function pesquisar() {
        const endereco = campoPesquisa.value.trim();
        if (campoErro) campoErro.textContent = "";

        if (endereco === "") {
            return;
        }

        // acrescenta ", Angola" se o utilizador não o escreveu, para melhorar a precisão
        const consulta = /angola/i.test(endereco) ? endereco : endereco + ", Angola";

        // URL do Nominatim limitando a busca ao país Angola (countrycodes=ao)
        const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=ao&q=${encodeURIComponent(consulta)}`;

        try {
            // É obrigatório enviar um User-Agent na política do Nominatim para identificar a app
            const resposta = await fetch(url, {
                headers: {
                    'User-Agent': 'PertoDeTi_App/1.0'
                }
            });
            const resultados = await resposta.json();

            if (resultados && resultados.length > 0) {
                // Pegamos no primeiro resultado mais relevante retornado
                const primeiroResultado = resultados[0];
                const lat = parseFloat(primeiroResultado.lat);
                const lng = parseFloat(primeiroResultado.lon);
                
                // Estrutura que o Google Maps aceita para posicionamento
                const local = { lat: lat, lng: lng };

                mapaCadastro.setCenter(local);
                mapaCadastro.setZoom(15);
                marcadorCadastro.setPosition(local);
                atualizarCoordenadas(local);
            } else {
                if (campoErro) {
                    campoErro.textContent = "Não foi possível encontrar essa localização. Tenta ser mais específico (ex: bairro + município).";
                }
            }
        } catch (erro) {
            console.error("Erro ao geocodificar com Nominatim:", erro);
            if (campoErro) {
                campoErro.textContent = "Ocorreu um erro ao pesquisar o endereço. Tenta novamente.";
            }
        }
    }

    botaoPesquisar.addEventListener("click", pesquisar);
    campoPesquisa.addEventListener("keydown", function (evento) {
        if (evento.key === "Enter") {
            evento.preventDefault(); // não submete o formulário
            pesquisar();
        }
    });
}
