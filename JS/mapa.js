const CENTRO_PADRAO = { lat: -8.8368, lng: 13.2343 };

let mapaCadastro;
let marcadorCadastro;

function inicializarMapaCadastro() {
    const elementoMapa = document.getElementById("mapa-cadastro");
    if (!elementoMapa) return;

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

    marcadorCadastro.addListener("dragend", function () {
        atualizarCoordenadas(marcadorCadastro.getPosition());
    });

    mapaCadastro.addListener("click", function (evento) {
        marcadorCadastro.setPosition(evento.latLng);
        atualizarCoordenadas(evento.latLng);
    });

    inicializarPesquisaMorada();
}

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

function inicializarPesquisaMorada() {
    const campoPesquisa = document.getElementById("localizacao-busca");
    const botaoPesquisar = document.getElementById("botao-pesquisar-mapa");
    const campoErro = document.getElementById("erro-localizacao");
    if (!campoPesquisa || !botaoPesquisar) return;

    async function pesquisar() {
        const endereco = campoPesquisa.value.trim();
        if (campoErro) campoErro.textContent = "";

        if (endereco === "") return;

        const consulta = /angola/i.test(endereco) ? endereco : endereco + ", Angola";
        const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=ao&q=${encodeURIComponent(consulta)}`;

        try {
            const resposta = await fetch(url, {
                headers: { 'User-Agent': 'PertoDeTi_App/1.0' }
            });
            const resultados = await resposta.json();

            if (resultados && resultados.length > 0) {
                const primeiroResultado = resultados[0];
                const lat = parseFloat(primeiroResultado.lat);
                const lng = parseFloat(primeiroResultado.lon);
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
            evento.preventDefault();
            pesquisar();
        }
    });
}
