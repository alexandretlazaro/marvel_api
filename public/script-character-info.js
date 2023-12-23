$(document).ready(function () {

    $('#loadMoreButton').hide();

    // Adiciona um evento de clique ao botão "Carregar Mais"
    $('#loadMoreButton').click(function () {
        searchComics(true);
    });

    $("#orderBySelect").on('change', function() {

        if($( "#orderBySelect option:selected" ).val() === 'title') {

            $('#relevanceSelect option').each(function (index) {
                if(index === 1) {
                    $(this).text('A - Z');
                }
                if(index === 2) {
                    $(this).text('Z - A');
                }
            });
        }
        else {
            $('#relevanceSelect option').each(function (index) {
                if(index === 1) {
                    $(this).text('Mais atuais');
                }
                if(index === 2) {
                    $(this).text('Mais antigas');
                }
            });
        }
    })

    $("#relevanceSelect").on('change', function() {

        var orderBySelected = $( "#orderBySelect option:selected" ).val();
        var relevanceSelected = $( "#relevanceSelect option:selected" ).val();

        searchComics(false, orderBySelected, relevanceSelected);
    });
});

document.addEventListener('DOMContentLoaded', async function() {

    console.log('DOMContentLoaded event fired');

    // Obtém o characterId da URL
    let characterId = window.location.pathname.split('/').pop();

    try {
        // Faz a solicitação para obter os detalhes do personagem
        const response = await fetch(`/character/${characterId}`);
        if (!response.ok) {
            throw new Error(`Erro na solicitação: ${response.status} ${response.statusText}`);
        }
        
        const characterInfo = await response.json();

        // Chama a função para mostrar os detalhes do personagem
        showCharacterInfo(characterInfo);
    } catch (error) {
        console.error('Erro ao obter detalhes do personagem:', error);
        showError('Erro ao obter detalhes do personagem.');
    }
});

// Variáveis para rastrear o personagem atual e o offset
let currentCharacterId = '';
let offset = 0;

function showCharacterInfo(data) {

    console.log(data)
    
    const characterInfoDiv = $('#characterInfo');
    characterInfoDiv.html(`
        <h2>${data.character.name}</h2>
        <p>${data.character.description || 'Descrição Indisponível.'}</p>
        <img class="img-fluid" src="${data.character.thumbnail}" alt="${data.character.name}">
    `);

    // Atualizar o ID do personagem atual
    currentCharacterId = data.character.id;

    // Chamar searchComics com o novo offset
    searchComics(false);
}

async function searchComics(loadMore, orderBy, relevance) {
    try {

        // Incrementar o offset se for uma carga adicional
        if (loadMore) {
            offset += 20;
        }
        else {
            // Resetar o offset se não for uma carga adicional
            offset = 0;
        }

        const response = await fetch(`/comics/${currentCharacterId}?orderBy=${orderBy}&relevance=${relevance}&offset=${offset}`);
        const data = await response.json();

        console.log('Comics:', data);

        const comicsListDiv = $('#comicsList');

        // Limpar a lista de HQs se não for uma carga adicional
        if (!loadMore) {
            comicsListDiv.html('<h3 class="text-center">HQs:</h3>');
        }

        if (data.length > 0) {
            for (const comic of data) {

                let dateOfPublish = moment(comic.dates[1].date).format('DD-MM-YYYY');
                let paginas = comic.pageCount;

                if(dateOfPublish === 'Invalid date') {
                    dateOfPublish = ' - '
                }
                if(paginas === 0) {
                    paginas = ' - '
                }

                comicsListDiv.append(`
                    <div class="col">
                        <div class="col-10">
                            <div class="comic-item card text-white border-0">
                                <a href="../comic/${comic.id}">
                                    <img class="hq-img" src="${getComicImageUrl(comic)}" alt="${comic.title}">
                                    <div class="card-img-overlay d-none justify-content-center align-items-center flex-column text-center text-white">
                                        <h5 class="card-title text-white">${comic.title}</h5>
                                        <p class="card-text text-white">Data de publicação: ${dateOfPublish}</p>
                                        <p class="card-text text-white">Páginas: ${paginas}</p>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                `);
            }

            // Exibir o botão "Carregar Mais" se houver mais HQs
            $('#loadMoreButton').show();

        }
        else {
            // Ocultar o botão "Carregar Mais" se não houver mais HQs
            $('#loadMoreButton').hide();
        }
    } catch (error) {
        console.error(error);
    }
}

// Função auxiliar para obter a URL da imagem do HQ
function getComicImageUrl(comic) {
    // Substitua 'standard_fantastic' pela chave correta dependendo da estrutura dos dados da API da Marvel
    const thumbnail = comic.thumbnail && comic.thumbnail.path ? comic.thumbnail : comic.images[0];
    return `${thumbnail.path}/standard_fantastic.${thumbnail.extension}`;
}

function formReset() {
    $('#characterForm').trigger("reset");
    location.reload();
}

function showError(message) {
    const errorDiv = $('#error');
    errorDiv.text(message);
    errorDiv.show();

    // Ocultar a mensagem de erro após alguns segundos (opcional)
    setTimeout(() => {
        errorDiv.hide();
    }, 5000); // 5000 milissegundos = 5 segundos
}