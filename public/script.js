$(document).ready(function () {

    $('#loadMoreButton').hide();

    $('#characterForm').submit(function (event) {
        event.preventDefault();
        searchCharacter();
    });

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
});

// Variáveis para rastrear o personagem atual e o offset
let currentCharacterId = '';
let offset = 0;

async function searchCharacter() {

    const characterName = $('#characterName').val();
    const orderBy = $('#orderBySelect').val();
    const relevance = $('#relevanceSelect').val();

    if(!characterName) {
        $('#characterName').addClass('border-danger');
        $('#div-error').removeClass('d-none');
        $('#div-error').addClass('d-block');
        return;
    }
    else {
        $('#characterName').removeClass('border-danger');
        $('#div-error').removeClass('d-block');
        $('#div-error').addClass('d-none');
    }

    try {
        // Resetar o offset ao pesquisar um novo personagem
        offset = 0;

        const response = await fetch(`/search?name=${characterName}&orderBy=${orderBy}&relevance=${relevance}`);

        if(!response.ok) {
            const textMessage = await response.text();
            const parseJson = JSON.parse(textMessage);
            showAlert(parseJson.error);
            return;
        }
        const data = await response.json();

        console.log('Search Results:', data);

        const characterInfoDiv = $('#characterInfo');
        characterInfoDiv.html(`
            <div class="container mt-5 text-center">
                <h1 class="mb-4">Informações do personagem</h1>
            </div>
            <h2>${data.character.name}</h2>
            <p>${data.character.description || 'Descrição Indisponível.'}</p>
            <img class="img-fluid" src="${data.character.thumbnail}" alt="${data.character.name}">
        `);

        // Atualizar o ID do personagem atual
        currentCharacterId = data.character.id;

        // Chamar searchComics com o novo offset
        searchComics(false, orderBy, relevance);
    } catch (error) {
        console.error(error);
    }
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
                                <a href="comic/${comic.id}">
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
    const thumbnail = comic.thumbnail && comic.thumbnail.path ? comic.thumbnail : comic.images[0];
    return `${thumbnail.path}/standard_fantastic.${thumbnail.extension}`;
}

const characterNameInput = document.getElementById('characterName');
const awesomplete = new Awesomplete(characterNameInput, {
    list: [],
    minChars: 1, // Mínimo de caracteres para iniciar a busca
    maxItems: 20, // Número máximo de sugestões exibidas
    autoFirst: true, // Seleciona automaticamente a primeira sugestão ao pressionar Enter
});

characterNameInput.addEventListener('input', async function() {
    const term = this.value.toLowerCase();
    const suggestions = await fetch(`/autocomplete?term=${term}`)
    .then(response => response.json())
    .catch(error => console.error(error));

    awesomplete.list = suggestions;
});

function formReset() {
    $('#characterForm').trigger("reset");
    location.reload();
}

function showAlert(message) {
    
    $(".alert").text(message);
    $(".alert").show();

    // Ocultar a mensagem de erro após alguns segundos (opcional)
    setTimeout(() => {
        $(".alert").fadeOut("slow", "swing", null);
    }, 5000); // 5000 milissegundos = 5 segundos
}