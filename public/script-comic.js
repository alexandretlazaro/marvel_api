document.addEventListener('DOMContentLoaded', async function() {

    console.log('DOMContentLoaded event fired');

    // Obtém o comicId da URL
    const comicId = window.location.pathname.split('/').pop();

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

function showComicDetails(comicDetails) {

    console.log(comicDetails)
    
    const comicDetailsDiv = $('#comicDetails');
    comicDetailsDiv.html(`
            <h2 class="mb-3">${comicDetails.title}</h2>
            <p class="lead.mb-4">${comicDetails.text || 'Nenhuma descrição foi encontrada'}</p>
            <img class="img-fluid" src="${comicDetails.image}">
        `);
}

function showError(message) {
    // Lógica para exibir erros (substitua com sua própria lógica)
    console.error(message);
    // Por exemplo, você pode criar um elemento de erro e exibi-lo no DOM
}