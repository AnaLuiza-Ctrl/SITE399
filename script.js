let meuGrafico;
let modoGerenteAtivo = false;

// Função para Adicionar ou Salvar Edição
function adicionarAvaliacao() {
    const nome = document.getElementById('nome').value;
    const nota = document.getElementById('nota').value;
    const comentario = document.getElementById('comentario').value;
    const editIndex = document.getElementById('edit-index').value;

    if (!nome || !comentario) {
        alert("Preencha todos os campos!");
        return;
    }

    let avaliacoes = JSON.parse(localStorage.getItem('avaliacoes')) || [];
    const novaAvaliacao = { nome, nota: Number(nota), comentario };

    if (editIndex === "-1") {
        avaliacoes.push(novaAvaliacao);
        alert("Obrigado! Avaliação enviada.");
    } else {
        // AQUI ESTAVA O ERRO: Atualizando o índice correto
        avaliacoes[parseInt(editIndex)] = novaAvaliacao;
        alert("Avaliação atualizada!");
        cancelarEdicao();
    }

    localStorage.setItem('avaliacoes', JSON.stringify(avaliacoes));
    
    // Limpar campos e atualizar tela
    document.getElementById('nome').value = '';
    document.getElementById('comentario').value = '';
    document.getElementById('lista-avaliacoes').style.display = 'block';
    carregarAvaliacoes();
    if(modoGerenteAtivo) atualizarGrafico();
}

// Carregar os Cards na Tela
function carregarAvaliacoes() {
    const container = document.getElementById('container-cards');
    container.innerHTML = '';
    const avaliacoes = JSON.parse(localStorage.getItem('avaliacoes')) || [];

    avaliacoes.forEach((aval, index) => {
        let corNota = "#27ae60"; 
        let corTexto = "#fff";
        if (aval.nota <= 4) corNota = "#e74c3c"; 
        else if (aval.nota <= 7) { corNota = "#f1c40f"; corTexto = "#000"; }

        const card = document.createElement('div');
        card.className = 'card-avaliacao';
        card.style.borderLeft = `10px solid ${corNota}`;

        // Botão de excluir individual (Só aparece para o gerente ao lado da nota)
        let botaoExcluir = modoGerenteAtivo 
            ? `<button onclick="excluirAvaliacao(${index})" class="btn-excluir-lado">×</button>` 
            : '';

        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <strong>${aval.nome}</strong>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="background:${corNota}; color:${corTexto}; padding:5px 15px; border-radius:50px; font-weight:bold;">
                        Nota: ${aval.nota}/10
                    </span>
                    ${botaoExcluir}
                </div>
            </div>
            <p>"${aval.comentario}"</p>
            <button class="btn-editar" onclick="prepararEdicao(${index})">Modificar meu comentário</button>
        `;
        container.appendChild(card);
    });
}

// Preparar formulário para edição
function prepararEdicao(index) {
    const avaliacoes = JSON.parse(localStorage.getItem('avaliacoes'));
    const aval = avaliacoes[index];

    document.getElementById('nome').value = aval.nome;
    document.getElementById('nota').value = aval.nota;
    document.getElementById('comentario').value = aval.comentario;
    document.getElementById('edit-index').value = index; // Define o índice da edição
    
    document.getElementById('titulo-form').innerText = "Editando sua avaliação";
    document.getElementById('btn-enviar').innerText = "Salvar Alterações";
    document.getElementById('btn-cancelar').style.display = 'block';
    
    window.scrollTo({top: 0, behavior: 'smooth'});
}

function cancelarEdicao() {
    document.getElementById('edit-index').value = "-1";
    document.getElementById('nome').value = '';
    document.getElementById('comentario').value = '';
    document.getElementById('titulo-form').innerText = "Deixe sua avaliação";
    document.getElementById('btn-enviar').innerText = "Publicar Avaliação";
    document.getElementById('btn-cancelar').style.display = 'none';
}

// Excluir UMA avaliação
function excluirAvaliacao(index) {
    if (confirm("Excluir esta avaliação?")) {
        let avaliacoes = JSON.parse(localStorage.getItem('avaliacoes'));
        avaliacoes.splice(index, 1);
        localStorage.setItem('avaliacoes', JSON.stringify(avaliacoes));
        carregarAvaliacoes();
        atualizarGrafico();
    }
}

// Limpar TUDO (Botão Geral)
// Dentro do loop de avaliacoes.forEach na função carregarAvaliacoes:

let botaoExcluir = modoGerenteAtivo 
    ? `<button onclick="excluirAvaliacao(${index})" class="btn-excluir-lado" title="Excluir">×</button>` 
    : '';

card.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center;">
        <strong>${aval.nome}</strong>
        <div class="nota-container">
            <span style="background:${corNota}; color:${corTexto}; padding:5px 15px; border-radius:50px; font-weight:bold; font-size:0.9rem;">
                Nota: ${aval.nota}/10
            </span>
            ${botaoExcluir}
        </div>
    </div>
    <p>"${aval.comentario}"</p>
    <button class="btn-editar" onclick="prepararEdicao(${index})">Modificar meu comentário</button>
`;

function acessoGerente() {
    if (prompt("Senha do Gerente:") === "399ADM") {
        modoGerenteAtivo = true;
        document.getElementById('dashboard').style.display = 'block';
        document.getElementById('lista-avaliacoes').style.display = 'block';
        carregarAvaliacoes();
        atualizarGrafico();
    } else { alert("Senha incorreta!"); }
}

function atualizarGrafico() {
    const avaliacoes = JSON.parse(localStorage.getItem('avaliacoes')) || [];
    const boas = avaliacoes.filter(a => a.nota >= 7).length;
    const ruins = avaliacoes.filter(a => a.nota < 7).length;
    
    document.getElementById('total-votos').innerText = avaliacoes.length;
    const media = avaliacoes.length > 0 ? (avaliacoes.reduce((acc, curr) => acc + curr.nota, 0) / avaliacoes.length).toFixed(1) : "0.0";
    document.getElementById('media-geral').innerText = media;

    const ctx = document.getElementById('meuGrafico').getContext('2d');
    if (meuGrafico) meuGrafico.destroy();
    meuGrafico = new Chart(ctx, {
        type: 'bar', 
        data: {
            labels: ['Satisfeitos', 'Insatisfeitos'],
            datasets: [{ label: 'Feedbacks', data: [boas, ruins], backgroundColor: ['#27ae60', '#e74c3c'] }]
        }, 
        options: { indexAxis: 'y' }
    });
}