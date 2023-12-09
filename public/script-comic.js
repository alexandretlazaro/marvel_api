let offset = 0;

document.addEventListener('DOMContentLoaded', async function() {

    console.log('DOMContentLoaded event fired');

    // Obtém o comicId da URL
    let comicId = window.location.pathname.split('/').pop();

    try {
        // Faz a solicitação para obter os detalhes da HQ
        const response = await fetch(`/teste/${comicId}`);
        if (!response.ok) {
            throw new Error(`Erro na solicitação: ${response.status} ${response.statusText}`);
        }
        
        const comicDetails = await response.json();

        // Chama a função para mostrar os detalhes da HQ
        showComicDetails(comicDetails);
    } catch (error) {
        console.error('Erro ao obter detalhes da HQ:', error);
        showError('Erro ao obter detalhes da HQ.');
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

    const response = await fetch(`/teste/${comicId}/characters`)

    const data = await response.json();

    console.log(data);

    if (data.length > 0) {
        for (const character of data) {

            charactersListDiv.append(`
                <div class="col">
                    <div class="col-10">
                        <div class="character-item">
                            <img class="character-img img-thumbnail rounded-circle img-fluid" src="${getCharacterImageUrl(character)}" alt="${character.name}">
                        </div>
                        <h5 class="card-title">${character.name}</h5>
                    </div>
                </div>
            `);
        }
    }
}

// Função auxiliar para obter a URL da imagem do personagem
function getCharacterImageUrl(character) {
    const thumbnail = character.thumbnail;
    return `${thumbnail}`;
}

function showError(message) {
    // Lógica para exibir erros (substitua com sua própria lógica)
    console.error(message);
    // Por exemplo, você pode criar um elemento de erro e exibi-lo no DOM
}