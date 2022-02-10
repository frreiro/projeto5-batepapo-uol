const LINKPARTICIPANTES = 'https://mock-api.driven.com.br/api/v4/uol/participants';
const LINKSTATUS = 'https://mock-api.driven.com.br/api/v4/uol/status';
const LINKMENSAGENS = 'https://mock-api.driven.com.br/api/v4/uol/messages';

let nomeUsuario = prompt("Qual o seu nome?");
/* --- Verifica se não é nulo --- */
while(nomeUsuario === "") {
    nomeUsuario = prompt("Qual o seu nome?");
}
console.log(nomeUsuario);
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
setInterval(trazerMensagens,60000);
function trazerMensagens(){
    console.log("msgem atualizada")
    let buscarMensagens = axios.get(LINKMENSAGENS);
    buscarMensagens.then(receberMensagensDoServidor);
}


function receberMensagensDoServidor(respostaServidor){

mensagensServer = respostaServidor.data
// console.log(mensagensServer);
mostrarStatusUsuario(mensagensServer)



}

function mostrarStatusUsuario(usuario){
    let msgNaTela = document.querySelector("main");
    for(let i=0; i<mensagensServer.length; i++){
        msgNaTela.innerHTML += `<div class="mensagem-entrada">
                                <p class="mensagem"><span class="hora-mensagem">(${usuario[i].time}) </span><em>${usuario[i].from}</em> ${usuario[i].text}
                                </p>
                            </div>`
        msgNaTela.scrollIntoView();
    }

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


function enviarMsg() {
    let inputHTML = document.querySelector("input");
    let mensagem = inputHTML.value;
    console.log(mensagem);
    inputHTML.value= "";
    

    
    let msgTela = document.querySelector("main div");
    msgTela.scrollIntoView();
}

