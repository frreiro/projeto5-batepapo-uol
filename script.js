const LINKPARTICIPANTES = 'https://mock-api.driven.com.br/api/v4/uol/participants';
const LINKSTATUS = 'https://mock-api.driven.com.br/api/v4/uol/status';
const LINKMENSAGENS = 'https://mock-api.driven.com.br/api/v4/uol/messages';

let nomeUsuario = prompt("Qual o seu nome?");
/* --- Verifica se não é nulo --- */
while(nomeUsuario === "") {
    nomeUsuario = prompt("Qual o seu nome?");
}
console.log(nomeUsuario);
/* --- Objeto do usuario --- */
const usuario = {
    name: nomeUsuario
}

const entrarSala = axios.post(LINKPARTICIPANTES, usuario);
entrarSala.then(usuarioEntrouNaSala)
entrarSala.catch(usuarioNaoEntrouNaSala);


/* --- Mantem conexão com o servidor --- */
setInterval(verificarStatusParticipante,5000);
function verificarStatusParticipante(){
    const statusParticipante = axios.post(LINKSTATUS, usuario);
    statusParticipante.then(console.log("status enviado"));
    // add O statusParticipante.catch posteriormente
}

let mensagensServer = [];
/* --- Busca as msg no server ---*/
trazerMensagens();
setInterval(trazerMensagens,3000);
function trazerMensagens(){
    console.log("msgem atualizada")
    let buscarMensagens = axios.get(LINKMENSAGENS);
    buscarMensagens.then(receberMensagensDoServidor);
}


function receberMensagensDoServidor(respostaServidor){
    mensagensServer = respostaServidor.data
    console.log(mensagensServer);
    filtrarTipoDeDados(mensagensServer)
}

/* -- Mostrar as msgs na tela --- */
let elemento = document.querySelector("main"); 

function filtrarTipoDeDados(usuario){
    elemento.innerHTML = "";
    for(let i=0; i<mensagensServer.length; i++){
        if(usuario[i].type === "status"){
            mostrarStatusUsuario(usuario[i]);
        }else if(usuario[i].type === "message"){
            mostrarMensagemPublica(usuario[i]);
        }else if(usuario[i].type === "private_message"){
            mostrarMensagemPrivada(usuario[i]);
        }
    
    }
}


function mostrarStatusUsuario(usuario){
    elemento.innerHTML += 
    `<div class="mensagem-entrada">
        <p class="mensagem"><span class="hora-mensagem">(${usuario.time}) </span><em>${usuario.from}</em> ${usuario.text}
        </p>
    </div>`
    elemento.lastChild.scrollIntoView(); 
}

function mostrarMensagemPublica(usuario){
    elemento.innerHTML += 
    `<div class="mensagem-publica">
        <p class="mensagem">
        <span class="hora-mensagem">(${usuario.time}) </span><em>${usuario.from}</em>
        para <em>${usuario.to}</em>: ${usuario.text}
        </p>
    </div>`
    elemento.lastChild.scrollIntoView(); 
}

function mostrarMensagemPrivada(usuario){
    elemento.innerHTML += 
    `<div class="mensagem-privada">
        <p class="mensagem">
            <span class="hora-mensagem">(${usuario.time}) </span><em>${usuario.from}</em>
             reservadamente para <em>${usuario.to}</em>: ${usuario.text}
        </p>
    </div>`
    elemento.lastChild.scrollIntoView(); 
}

function usuarioEntrouNaSala(respostaServidor){
    console.log("Usuário entrou no servidor");
}
function usuarioNaoEntrouNaSala(erro){
    console.log(erro.response.status);
    console.log("Usuário não entrou no servidor, msg: " + erro.response.data);

    if(erro.response.status === 400){
    alert("Nome indisponível no momento");
    window.location.reload();
    }
}

/* --- Envia as msg para o servidor ---- */ 
let destinatario = "Todos";
let mensagem = "";

let objetoMensagem =
    {
        from: nomeUsuario,
        to: destinatario, // Ou nome usuario
        text: mensagem,
        type: "message" // ou "private_message" para o bônus
    }

function clickEnviarMsg() {
    let inputHTML = document.querySelector("input");
    let mensagemInput = inputHTML.value;
    console.log(mensagemInput);
    inputHTML.value= "";
    
    montarMenssagem(nomeUsuario,destinatario,mensagemInput);
    enviarMsg(objetoMensagem);    
}

function montarMenssagem(nome,destinatario, mensagem){
    objetoMensagem.from = nome;
    objetoMensagem.to = destinatario;
    objetoMensagem.text = mensagem;
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
}

