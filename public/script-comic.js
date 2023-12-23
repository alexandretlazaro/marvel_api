let offset = 0;

document.addEventListener('DOMContentLoaded', async function() {

    console.log('DOMContentLoaded event fired');

    // Obtém o comicId da URL
    let comicId = window.location.pathname.split('/').pop();

    try {
        // Faz a solicitação para obter os detalhes da HQ
        const response = await fetch(`/hq/${comicId}`);
        const comicDetails = await response.json();

        // Chama a função para mostrar os detalhes da HQ
        showComicDetails(comicDetails);
    } catch (error) {
        alert(error)
    }
});

function showComicDetails(data) {

    console.log(data)

    const comicDetailsDiv = $('#comicDetails');
    comicDetailsDiv.html(`
            <h2 class="mb-3">${data.comicDetails.title}</h2>
            <p class="lead.mb-4">${data.comicDetails.text || 'Nenhuma descrição foi encontrada'}</p>
            <img class="img-fluid" src="${data.comicDetails.image}">
        `);

    getCharacters(data.comicDetails.id);
}

async function getCharacters(comicId) {

    const charactersListDiv = $('#charactersList');

    const response = await fetch(`/hq/${comicId}/characters`)

    const data = await response.json();

    console.log(data);

    if (data.length > 0) {
        for (const character of data) {

            charactersListDiv.append(`
                <div class="col">
                    <div class="character-item">
                        <a href="/character-info/${character.id}">
                            <img class="character-img img-thumbnail rounded-circle img-fluid" src="${getCharacterImageUrl(character)}" alt="${character.name}">
                        </a>
                    </div>
                    <h5 class="card-title">${character.name}</h5>
                </div>
            `);
        }
    }
}

async function searchCharacter(characterName) {

    try {

        // Resetar o offset ao pesquisar um novo personagem
        offset = 0;

        const response = await fetch(`/search?name=${characterName}`);
        const data = await response.json();

        window.location.href = `/character-info/${data.character.id}`

        if (response.status === 404) {
            showAlert('Personagem não encontrado.');
            return;
        }

        console.log('Search Results:', data);

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
    } catch (error) {
        console.error(error);
    }
}

async function searchComics(loadMore) {
    try {
        // Incrementar o offset se for uma carga adicional
        if (loadMore) {
            offset += 20;
        }
        else {
            // Resetar o offset se não for uma carga adicional
            offset = 0;
        }

        const response = await fetch(`/comics/${currentCharacterId}?offset=${offset}`);
        const data = await response.json();

        console.log('Comics:', data);

        const comicsListDiv = $('#comicsList');

        // Limpar a lista de HQs se não for uma carga adicional
        if (!loadMore) {
            comicsListDiv.html('<h3 class="text-center">HQs:</h3>');
        }

        if (data.length > 0) {
            for (const comic of data) {
                comicsListDiv.append(`
                    <div class="col">
                        <div class="col-10">
                            <div class="comic-item card text-white border-0">
                                <a href="comic/${comic.id}">
                                    <img class="hq-img" src="${getComicImageUrl(comic)}" alt="${comic.title}">
                                    <div class="card-img-overlay d-none justify-content-center align-items-center flex-column text-center text-white">
                                        <h5 class="card-title text-white">${comic.title}</h5>
                                        <p class="card-text text-white">${comic.pageCount} páginas</p>
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

// Função auxiliar para obter a URL da imagem do personagem
function getCharacterImageUrl(character) {
    const thumbnail = character.thumbnail;
    return `${thumbnail}`;
}

function showAlert(message) {
    
    $(".alert").text(message);

    $(".alert").show();

    // Ocultar a mensagem de erro após alguns segundos (opcional)
    setTimeout(() => {
        $(".alert").fadeOut("slow", "swing", null);
    }, 5000); // 5000 milissegundos = 5 segundos
}