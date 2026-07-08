/* ==========================================================
   Perto de Ti - main.js
   Funcionalidades JavaScript do site (funções próprias, sem
   bibliotecas de terceiros para a lógica).
   ========================================================== */

document.addEventListener("DOMContentLoaded", function () {
    inicializarMenuResponsivo();
    inicializarBotaoTopo();
    inicializarValidacaoCadastro();
    inicializarModoEscuro();
    inicializarCarrosseis();
    inicializarPartilhaSocial();
    inicializarRastreamento();
});

/* ----------------------------------------------------------
   1. Menu de navegação responsivo (hambúrguer)
   ---------------------------------------------------------- */
function inicializarMenuResponsivo() {
    const botao = document.querySelector(".menu-toggle");
    const nav = document.querySelector("header nav");

    if (!botao || !nav) {
        return; // esta página não tem menu (ex: página 404)
    }

    botao.addEventListener("click", function () {
        const aberto = nav.classList.toggle("nav-aberto");
        botao.setAttribute("aria-expanded", aberto ? "true" : "false");
        botao.innerHTML = aberto
            ? '<i class="fas fa-times"></i>'
            : '<i class="fas fa-bars"></i>';
    });

    // fecha o menu automaticamente ao clicar num link (mobile)
    nav.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
            if (nav.classList.contains("nav-aberto")) {
                nav.classList.remove("nav-aberto");
                botao.setAttribute("aria-expanded", "false");
                botao.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    });
}

/* ----------------------------------------------------------
   2. Botão "voltar ao topo"
   ---------------------------------------------------------- */
function inicializarBotaoTopo() {
    const botaoTopo = document.createElement("button");
    botaoTopo.className = "btn-topo";
    botaoTopo.setAttribute("aria-label", "Voltar ao topo");
    botaoTopo.innerHTML = '<i class="fas fa-arrow-up"></i>';
    document.body.appendChild(botaoTopo);

    function verificarScroll() {
        if (window.scrollY > 400) {
            botaoTopo.classList.add("visivel");
        } else {
            botaoTopo.classList.remove("visivel");
        }
    }

    window.addEventListener("scroll", verificarScroll);
    verificarScroll();

    botaoTopo.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

/* ----------------------------------------------------------
   3. Validação de formulário (cadastro.html)
   Funções próprias, sem bibliotecas de validação externas.
   ---------------------------------------------------------- */

// Verifica se um nome/sobrenome é válido: só letras (incluindo
// acentos), espaços e hífen, com pelo menos 2 caracteres.
function validarNome(valor) {
    const texto = valor.trim();
    const padraoNome = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]{2,}$/;

    if (texto.length === 0) {
        return { valido: false, mensagem: "Este campo é obrigatório." };
    }
    if (!padraoNome.test(texto)) {
        return { valido: false, mensagem: "Usa apenas letras (sem números ou símbolos)." };
    }
    return { valido: true, mensagem: "" };
}

// Verifica se um e-mail tem um formato válido (utilizador@dominio.extensão)
function validarEmail(valor) {
    const texto = valor.trim();
    const padraoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (texto.length === 0) {
        return { valido: false, mensagem: "Este campo é obrigatório." };
    }
    if (!padraoEmail.test(texto)) {
        return { valido: false, mensagem: "Insere um e-mail válido (ex: nome@exemplo.com)." };
    }
    return { valido: true, mensagem: "" };
}

function inicializarValidacaoCadastro() {
    const form = document.getElementById("form-cadastro");
    if (!form) {
        return; // esta página não tem o formulário de cadastro
    }

    const campos = {
        nome: { input: document.getElementById("nome"), erro: document.getElementById("erro-nome"), validar: validarNome },
        sobrenome: { input: document.getElementById("sobrenome"), erro: document.getElementById("erro-sobrenome"), validar: validarNome },
        email: { input: document.getElementById("email"), erro: document.getElementById("erro-email"), validar: validarEmail },
    };

    function validarCampo(chave) {
        const campo = campos[chave];
        const resultado = campo.validar(campo.input.value);

        if (resultado.valido) {
            campo.input.classList.remove("input-invalido");
            campo.erro.textContent = "";
        } else {
            campo.input.classList.add("input-invalido");
            campo.erro.textContent = resultado.mensagem;
        }
        return resultado.valido;
    }

    // valida cada campo assim que o utilizador sai dele (blur)
    Object.keys(campos).forEach(function (chave) {
        campos[chave].input.addEventListener("blur", function () {
            validarCampo(chave);
        });
        // remove o erro assim que o utilizador começa a corrigir
        campos[chave].input.addEventListener("input", function () {
            if (campos[chave].input.classList.contains("input-invalido")) {
                validarCampo(chave);
            }
        });
    });

    form.addEventListener("submit", function (evento) {
        evento.preventDefault();

        const nomeValido = validarCampo("nome");
        const sobrenomeValido = validarCampo("sobrenome");
        const emailValido = validarCampo("email");

        const mensagemSucesso = document.getElementById("mensagem-sucesso");

        if (nomeValido && sobrenomeValido && emailValido) {
            mensagemSucesso.textContent = "Cadastro efectuado com sucesso! Bem-vindo(a) ao Perto de Ti.";
            mensagemSucesso.classList.add("visivel");
            form.reset();
        } else {
            mensagemSucesso.textContent = "";
            mensagemSucesso.classList.remove("visivel");
            // move o foco para o primeiro campo inválido
            const primeiroInvalido = form.querySelector(".input-invalido");
            if (primeiroInvalido) {
                primeiroInvalido.focus();
            }
        }
    });
}

/* ----------------------------------------------------------
   4. Dark mode
   A preferência fica guardada no localStorage do navegador,
   por isso mantém-se ao mudar de página ou fechar o browser.
   ---------------------------------------------------------- */
function inicializarModoEscuro() {
    const CHAVE_TEMA = "perto-de-ti-tema";

    if (localStorage.getItem(CHAVE_TEMA) === "escuro") {
        document.body.classList.add("dark-mode");
    }

    const botao = document.createElement("button");
    botao.className = "toggle-dark";
    botao.setAttribute("aria-label", "Alternar modo escuro");
    atualizarIconeModoEscuro(botao);
    document.body.appendChild(botao);

    botao.addEventListener("click", function () {
        document.body.classList.toggle("dark-mode");
        const escuro = document.body.classList.contains("dark-mode");
        localStorage.setItem(CHAVE_TEMA, escuro ? "escuro" : "claro");
        atualizarIconeModoEscuro(botao);
    });
}

function atualizarIconeModoEscuro(botao) {
    const escuro = document.body.classList.contains("dark-mode");
    botao.innerHTML = escuro
        ? '<i class="fas fa-sun"></i>'
        : '<i class="fas fa-moon"></i>';
}

/* ----------------------------------------------------------
   5. Carrossel / slider (genérico, sem bibliotecas externas)
   Funciona em qualquer elemento com [data-carrossel], reaproveitado
   na galeria de fotos e nos destaques da homepage.
   ---------------------------------------------------------- */
function inicializarCarrosseis() {
    document.querySelectorAll("[data-carrossel]").forEach(function (carrossel) {
        const track = carrossel.querySelector(".carrossel-track");
        const slides = Array.from(track.children);
        const pontosContainer = carrossel.querySelector(".carrossel-pontos");
        const efeitoFade = carrossel.dataset.efeito === "fade";
        let indiceAtual = 0;
        let temporizador = null;

        // cria um ponto/indicador por cada slide
        slides.forEach(function (_, i) {
            const ponto = document.createElement("button");
            ponto.setAttribute("aria-label", "Ir para o item " + (i + 1));
            ponto.addEventListener("click", function () {
                irParaSlide(i);
                reiniciarAutoplay();
            });
            pontosContainer.appendChild(ponto);
        });
        const pontos = Array.from(pontosContainer.children);

        function atualizar() {
            if (efeitoFade) {
                // efeito de crossfade: mostra só o slide activo, sobrepostos
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("activo", i === indiceAtual);
                });
            } else {
                // efeito de deslizar (usado na galeria)
                const larguraSlide = slides[0].getBoundingClientRect().width;
                track.style.transform = "translateX(-" + (indiceAtual * larguraSlide) + "px)";
            }
            pontos.forEach(function (ponto, i) {
                ponto.classList.toggle("activo", i === indiceAtual);
            });
        }

        function irParaSlide(i) {
            indiceAtual = (i + slides.length) % slides.length;
            atualizar();
        }

        function iniciarAutoplay() {
            if (carrossel.dataset.autoplay === "true") {
                temporizador = setInterval(function () {
                    irParaSlide(indiceAtual + 1);
                }, 4000);
            }
        }

        function reiniciarAutoplay() {
            if (temporizador) {
                clearInterval(temporizador);
                iniciarAutoplay();
            }
        }

        // pausa o autoplay quando o rato está por cima
        carrossel.addEventListener("mouseenter", function () {
            if (temporizador) clearInterval(temporizador);
        });
        carrossel.addEventListener("mouseleave", iniciarAutoplay);

        // suporte a swipe (arrastar o dedo) em ecrãs táteis
        let posicaoInicialX = 0;
        let arrastando = false;

        track.addEventListener("touchstart", function (evento) {
            posicaoInicialX = evento.touches[0].clientX;
            arrastando = true;
            if (temporizador) clearInterval(temporizador);
        }, { passive: true });

        track.addEventListener("touchend", function (evento) {
            if (!arrastando) return;
            arrastando = false;
            const posicaoFinalX = evento.changedTouches[0].clientX;
            const diferenca = posicaoInicialX - posicaoFinalX;

            if (Math.abs(diferenca) > 40) {
                if (diferenca > 0) {
                    irParaSlide(indiceAtual + 1); // arrastou para a esquerda -> próximo
                } else {
                    irParaSlide(indiceAtual - 1); // arrastou para a direita -> anterior
                }
            }
            reiniciarAutoplay();
        });

        window.addEventListener("resize", atualizar);

        atualizar();
        iniciarAutoplay();
    });
}

/* ----------------------------------------------------------
   6. Partilha para redes sociais
   Usa a Web Share API nativa quando disponível (comum em
   telemóveis); caso contrário mostra um pequeno menu com
   ligações directas para WhatsApp e Facebook.
   ---------------------------------------------------------- */
function inicializarPartilhaSocial() {
    const botoesPartilha = document.querySelectorAll("[data-partilhar]");
    if (botoesPartilha.length === 0) {
        return;
    }

    botoesPartilha.forEach(function (botao) {
        botao.addEventListener("click", function (evento) {
            evento.preventDefault();

            const titulo = document.title;
            const url = window.location.href;

            if (navigator.share) {
                navigator.share({ title: titulo, url: url }).catch(function () {
                    // utilizador cancelou a partilha; não é um erro
                });
                return;
            }

            // alternativa para navegadores sem suporte à Web Share API
            const menuExistente = botao.parentElement.querySelector(".menu-partilha");
            if (menuExistente) {
                menuExistente.remove();
                return;
            }

            const menu = document.createElement("div");
            menu.className = "menu-partilha";
            menu.innerHTML =
                '<a href="https://wa.me/?text=' + encodeURIComponent(titulo + " " + url) + '" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i> WhatsApp</a>' +
                '<a href="https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url) + '" target="_blank" rel="noopener"><i class="fab fa-facebook"></i> Facebook</a>';

            botao.parentElement.style.position = "relative";
            botao.parentElement.appendChild(menu);

            document.addEventListener("click", function fechar(e) {
                if (!menu.contains(e.target) && e.target !== botao) {
                    menu.remove();
                    document.removeEventListener("click", fechar);
                }
            });
        });
    });
}

/* ----------------------------------------------------------
   8. Análise de dados (Google Analytics + Meta Pixel)
   Função central que envia o mesmo evento para as duas
   ferramentas, sem quebrar o site se alguma não estiver
   carregada (ex: bloqueador de anúncios do visitante).
   ---------------------------------------------------------- */
function rastrearEvento(nomeEvento, parametros) {
    parametros = parametros || {};

    if (typeof gtag === "function") {
        gtag("event", nomeEvento, parametros);
    }
    if (typeof fbq === "function") {
        fbq("trackCustom", nomeEvento, parametros);
    }
}

function inicializarRastreamento() {
    // Pesquisa realizada
    const botaoPesquisa = document.querySelector(".pesquisa button");
    const campoPesquisa = document.querySelector(".pesquisa input");
    if (botaoPesquisa && campoPesquisa) {
        botaoPesquisa.addEventListener("click", function () {
            rastrearEvento("pesquisa_realizada", { termo: campoPesquisa.value });
        });
    }

    // Envio do formulário de cadastro (só dispara se passar na validação)
    const formCadastro = document.getElementById("form-cadastro");
    if (formCadastro) {
        formCadastro.addEventListener("submit", function () {
            const aindaTemErro = formCadastro.querySelector(".input-invalido");
            if (!aindaTemErro) {
                rastrearEvento("cadastro_enviado");
            }
        });
    }

    // Cliques no botão "Conecte-se" (proxy de pedido de serviço)
    document.querySelectorAll(".nav-botao").forEach(function (botao) {
        botao.addEventListener("click", function () {
            rastrearEvento("clique_conecte_se", { pagina: window.location.pathname });
        });
    });

    // Cliques nas redes sociais do rodapé
    document.querySelectorAll(".redes-sociais a").forEach(function (link) {
        link.addEventListener("click", function () {
            rastrearEvento("clique_rede_social", { rede: link.getAttribute("aria-label") });
        });
    });

    // Partilhas (galeria)
    document.querySelectorAll("[data-partilhar]").forEach(function (botao) {
        botao.addEventListener("click", function () {
            rastrearEvento("partilha_conteudo", { pagina: window.location.pathname });
        });
    });

    // Alternância de dark mode
    document.addEventListener("click", function (evento) {
        if (evento.target.closest(".toggle-dark")) {
            rastrearEvento("alternar_modo_escuro");
        }
    });
}
