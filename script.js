const LINKPARTICIPANTES = 'https://mock-api.driven.com.br/api/v4/uol/participants';
const LINKSTATUS = 'https://mock-api.driven.com.br/api/v4/uol/status';
const LINKMENSAGENS = 'https://mock-api.driven.com.br/api/v4/uol/messages';


/* --- Objeto do usuario --- */
const usuario = {}

/* --- Recebe o nome da tela de entrada --- */
let nomeUsuario = null;
function obterNomeUsuario(){
    nomeUsuario = document.querySelector(".tela-entrada input").value;
    if(verificarSeNomeUsuarioNaoENulo(nomeUsuario)){
        usuario.name = nomeUsuario;
        entradaDoUsuarioServidor();
    }

}

/* --- Verifica se não é nulo --- */
function verificarSeNomeUsuarioNaoENulo(nome){
    if(nome === "" || nome === null){
        alert("Seu nome deve conter mais letras");
    }else {
        return true;
    }
}

/* --- Entrada do usuario no servidor --- */
function entradaDoUsuarioServidor(){
    const entrarSala = axios.post(LINKPARTICIPANTES, usuario);
    entrarSala.then(usuarioEntrouNaSala)
    exibirTelaDeLoading();
    entrarSala.catch(usuarioNaoEntrouNaSala);
}

/* --- usuario entrou no servidor ---*/
function usuarioEntrouNaSala(respostaServidor){
    console.log("Usuário entrou no servidor");
    esconderTelaDeLoading();
    setInterval(verificarStatusParticipante,5000); // a cada 5s ele envia o status do participante
}

/* --- usuario nao entrou no servidor ---*/
function usuarioNaoEntrouNaSala(erro){
    console.log(erro.response.status);
    console.log("Usuário não entrou no servidor, msg: " + erro.response.data);

    if(erro.response.status === 400){
    alert("Nome indisponível no momento");
    window.location.reload();
    }
}

/* --- exibe a tela de loading ---*/
function exibirTelaDeLoading(){
    const div = document.querySelector(".tela-entrada div");
    div.innerHTML = `
    <img src="imagens/loader.gif"/>
    <p>Entrando...<p>  `
}

/*--- esconde a tela de loading ---*/
function esconderTelaDeLoading(){
    const telaInicio = document.querySelector("section.tela-entrada");
    telaInicio.classList.add("escondido");
}


/* --- funcao que mantem conexão com o servidor --- */
function verificarStatusParticipante(){
    const statusParticipante = axios.post(LINKSTATUS, usuario);
    // statusParticipante.then(console.log("status enviado"));
    // add O statusParticipante.catch posteriormente
}



/* --- Busca as msg no server ---*/
let mensagensServer = [];
trazerMensagens();
setInterval(trazerMensagens,3000);
function trazerMensagens(){
    let buscarMensagens = axios.get(LINKMENSAGENS);
    buscarMensagens.then(receberMensagensDoServidor);
}

/* ---  recebe as mensagens do servidor ---*/
function receberMensagensDoServidor(respostaServidor){
    mensagensServer = respostaServidor.data
    filtrarTipoDeDados(mensagensServer)
    
}


/* --- filtra as mensagens privadas que contem o nome do usuario ---*/
function eProUsuario(mensagem){
    if(mensagem.type === "private_message"){
        if(mensagem.from === nomeUsuario || mensagem.to === nomeUsuario){
            mostrarMensagemPrivada(mensagem)
        }
    }   
}

/* -- Mostrar as msgs na tela de acordo com as condições--- */
let elemento = document.querySelector("main"); 
function filtrarTipoDeDados(mensagem){
    elemento.innerHTML = "";
    for(let i=0; i<mensagensServer.length; i++){
        if(mensagem[i].type === "status"){
            mostrarStatusUsuario(mensagem[i]);
        }else if(mensagem[i].type === "message"){
            mostrarMensagemPublica(mensagem[i]);
        }else if(mensagem[i].type === "private_message"){
            eProUsuario(mensagem[i]);
        }
    
    }
}

/* --- mostras as mensagens de saida/entrada ---*/
function mostrarStatusUsuario(usuario){
    elemento.innerHTML += 
    `<div class="mensagem-entrada" data-identifier="message">
        <p class="mensagem"><span class="hora-mensagem">(${usuario.time}) </span><em>${usuario.from}</em> ${usuario.text}
        </p>
    </div>`
    elemento.lastChild.scrollIntoView(); 
}

/* --- mostras as mensagens que são publicas ---*/
function mostrarMensagemPublica(usuario){
    elemento.innerHTML += 
    `<div class="mensagem-publica" data-identifier="message">
        <p class="mensagem">
        <span class="hora-mensagem">(${usuario.time}) </span><em>${usuario.from}</em>
        para <em>${usuario.to}</em>: ${usuario.text}
        </p>
    </div>`
    elemento.lastChild.scrollIntoView(); 
}
/* --- mostras as mensagens que são privadas ---*/
function mostrarMensagemPrivada(usuario){
    elemento.innerHTML += 
    `<div class="mensagem-privada" data-identifier="message">
        <p class="mensagem">
            <span class="hora-mensagem">(${usuario.time}) </span><em>${usuario.from}</em>
             reservadamente para <em>${usuario.to}</em>: ${usuario.text}
        </p>
    </div>`
    elemento.lastChild.scrollIntoView(); 
}




/* --- Configuracoes menu lateral --- */
buscarParticipantesServidor();
setInterval(buscarParticipantesServidor,10000);

/* --- busca no servidor os usuarios online ---*/
function buscarParticipantesServidor(){
    let buscarParticipantes = axios.get(LINKPARTICIPANTES);
    buscarParticipantes.then(participantesServidor);
}

let participantes = {};
let temCheck = {};
let usuarios = document.querySelector("ul.usuarios");
function participantesServidor(respostaServidor){
    resetarParticipantesMenuLateral();
    participantes = respostaServidor.data;
    temCheck = participantes.filter(encontrarAntigoContatoSelecionado); // Filtra o usuario selecionado

    participantes.forEach(renderizarParticipantesMenuLateral); // Renderiza os usuários na tela
}

/* ---  renderiza somente o o usuario "Todos" --*/
function resetarParticipantesMenuLateral(){
    if(contato === "Todos"){
        usuarios.innerHTML = 
        `<li class="lateral-estilo usuario" onclick="contatoMensagem(this) "data-identifier="participant">
                <div>
                <ion-icon name="people"></ion-icon>
                <p>Todos</p>
                </div>
            <ion-icon class="check" name="checkmark-sharp"></ion-icon>
        </li>`
    }else {
        usuarios.innerHTML = 
        `<li class="lateral-estilo usuario" onclick="contatoMensagem(this) "data-identifier="participant">
                <div>
                <ion-icon name="people"></ion-icon>
                <p>Todos</p>
                </div>
            <ion-icon class="check escondido" name="checkmark-sharp"></ion-icon>
        </li>`
    }
}

/* ---  renderiza os usuarios online no menu lateral ---*/
function renderizarParticipantesMenuLateral(participante){
    if(temCheck[0] !== undefined && participante.name === temCheck[0].name){
        usuarios.innerHTML += 
        `<li class="lateral-estilo usuario" onclick="contatoMensagem(this)" data-identifier="participant">
            <div>
                <ion-icon name="person-circle"></ion-icon>
                <p class="usuario-nome">${participante.name}</p>
            </div>
            <ion-icon class="check" name="checkmark-sharp"></ion-icon>
        </li>`
    }else{
        usuarios.innerHTML += 
    `<li class="lateral-estilo usuario" onclick="contatoMensagem(this)" data-identifier="participant">
        <div>
            <ion-icon name="person-circle"></ion-icon>
            <p class="usuario-nome">${participante.name}</p>
        </div>
        <ion-icon class="check escondido" name="checkmark-sharp"></ion-icon>
    </li>`
    }
}




/* --- Abrir menu lateral --- */
function mostrarMenuLateral(){
    let menuLateral = document.querySelector(".menu-lateral");
    menuLateral.classList.remove("escondido");

    let fundo = document.querySelector(".background-lateral");
    fundo.classList.remove("escondido");
}

/* --- Fechar menu lateral --- */
function esconderMenuLateral(){
    let menuLateral = document.querySelector(".menu-lateral");
    if(!menuLateral.classList.contains("escondido")){
        menuLateral.classList.add("escondido");
    } 
    let fundoMenuLateral = document.querySelector(".background-lateral");
    if(!fundoMenuLateral.classList.contains("escondido")){
        fundoMenuLateral.classList.add("escondido");
    } 
}

/* --- Click na visibilidade --- */
let visibilidade = "Público";
function visibilidadeMensagem(elemento){
    elementoFilho = elemento.children[1];

    const todosCheck = document.querySelectorAll(".visibilidade li ion-icon.check"); //Pega todos os elementos que tem o check
    todosCheck.forEach(condicaoEsconderCheck);

    elementoFilho.classList.remove("escondido");
    visibilidade = elemento.innerText; //Salva o nome: Publico / Reservadamente
    verificarCondicaoDeMensagem();
    
}

/* --- Click nos nomes de usuarios --- */
let contato = "Todos";
function contatoMensagem(elemento){
    elementoFilho = elemento.children[1];

    const todosCheckUsers = document.querySelectorAll(".usuarios li ion-icon.check"); //Pega todos os elementos que tem o check
    todosCheckUsers.forEach(condicaoEsconderCheck);

    elementoFilho.classList.remove("escondido");
    contato = elemento.innerText; // Salva o nome do contato
    verificarCondicaoDeMensagem();
}

/* --- procura na lista atualizada os usuarios anteriormente clicados ---*/
function encontrarAntigoContatoSelecionado(usuarioLateral){
    nomeUsuarioLateral = usuarioLateral.name
    if (nomeUsuarioLateral === contato){
        return true;
    }else{
        return false;
    }
}


/* --- condicao para esconder ou não o check na lista de contatos --- */
function condicaoEsconderCheck(checkClass){
    if(!checkClass.classList.contains('escondido')){
        checkClass.classList.add('escondido')
        }
}

/* --- condicao para adicionar o texto em baixo do input ---*/
function verificarCondicaoDeMensagem(){
    if(contato !== null && visibilidade !== null){
        renderizarMensagemDeEnvio();
    }
}

/* --- renderiza o <p> --- */
function renderizarMensagemDeEnvio(){
    const rodape = document.querySelector(".rodape div");
    rodape.innerHTML =
     `
    <input type="text" class="text-input" placeholder="Escreva aqui..."/>
    <p>Enviando para ${contato} (${visibilidade})</p>
    `
}

/* --- Envia as msg para o servidor ---- */ 
let mensagem = "";

let objetoMensagem =
    {
        from: nomeUsuario,
        to: contato,
        text: mensagem,
        type: visibilidadeDaMensagemAEnviar() // "message" ou "private_message"
    }

function clickEnviarMsg() {
    let inputHTML = document.querySelector(".rodape input");
    let mensagemInput = inputHTML.value;
    inputHTML.value= "";
    if(retornarCasoInputVazio(mensagemInput)){
        console.log(contato);
        montarMenssagem(nomeUsuario,contato,mensagemInput,visibilidadeDaMensagemAEnviar());
        enviarMsg(objetoMensagem); 
    }  
}

function retornarCasoInputVazio(mensagemInput){
    if(mensagemInput === "" || mensagemInput === " "){
        alert("A mensagem deverá conter pelo menos uma letra");
        return false;
    }else {
        return true;
    }
}

function montarMenssagem(from,to, message,type){
    objetoMensagem.from = from;
    objetoMensagem.to = to;
    objetoMensagem.text = message;
    objetoMensagem.type = type;
}

function enviarMsg(objeto){
    let postarMsg = axios.post(LINKMENSAGENS,objeto);
    postarMsg.then(postarMsgSucesso);
    postarMsg.catch(postarMsgErro);
}

function postarMsgSucesso(resposta){
    console.log("Mensagem Enviada com sucesso")
}
function postarMsgErro(erro){
    console.log("Mensagem Enviada sem sucesso, erro: " + erro.response.status);
    window.location.reload();
}

function visibilidadeDaMensagemAEnviar(){
    if(visibilidade!== null){
        if(visibilidade === "Reservadamente"){
            return "private_message"
        }else if( visibilidade === "Público"){
            return "message"
        }
    }
}

renderizarMensagemDeEnvio();
