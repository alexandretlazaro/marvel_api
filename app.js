const express = require('express');
const axios = require('axios');
const md5 = require('md5');
require('dotenv').config();

var app = express();
var port = 4200;

app.set('view engine', 'pug');
app.use(express.static('public'));

const publicKey = process.env.MARVEL_PUBLIC_KEY
const privateKey = process.env.MARVEL_PRIVATE_KEY

const timestamp = new Date().getTime();

const hash = md5(timestamp + privateKey + publicKey);

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/comic/:comicId', (req, res) => {

	const comicId = req.params.comicId;

	res.render('comic', { comicId });
});

app.get('/character-info/:characterId', (req, res) => {

	const characterId = req.params.characterId;

	res.render('character-info', { characterId });
});

app.get('/autocomplete', async (req, res) => {
	
	const term = req.query.term.toLowerCase();
	
	try {

		const apiUrl = 'https://gateway.marvel.com:443/v1/public/characters';
      	const requestUrl = `${apiUrl}?nameStartsWith=${term}&apikey=${publicKey}&ts=${timestamp}&hash=${hash}`;

		const response = await axios.get(requestUrl);

		const suggestions = response.data.data.results.map(character => character.name);
		res.json(suggestions);
	} catch (error) {
		console.error(error);
		res.status(500).send('Erro ao obter sugestões de personagens');
	}
});

// Função para buscar informações do personagem
async function getCharacterInfo(characterName) {
 
	try {
		const apiUrl = 'https://gateway.marvel.com:443/v1/public/characters';
		const requestUrl = `${apiUrl}?name=${characterName}&apikey=${publicKey}&ts=${timestamp}&hash=${hash}`;

		const response = await axios.get(requestUrl);
		const character = response.data.data.results[0];

		if (!character) {
		throw new Error('Personagem não encontrado');
		}

		return {
			name: character.name,
			description: character.description,
			thumbnail: `${character.thumbnail.path}.${character.thumbnail.extension}`,
			id: character.id
		};
	} catch (error) {
		console.error(error);
		throw error;
	}
}

// Endpoint para buscar informações do personagem e quadrinhos
app.get('/search', async (req, res) => {
  try {
      const characterName = req.query.name;
      const characterInfo = await getCharacterInfo(characterName);

      // Obter o offset da query, se não estiver presente, padrão é 0
      const offset = parseInt(req.query.offset) || 0;

      // Obter quadrinhos do personagem com base no offset
      const comics = await getComics(characterInfo.id, offset);

      // Enviar resposta com informações do personagem e quadrinhos
      res.json({
          character: characterInfo,
          comics: comics
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Função para buscar quadrinhos do personagem
async function getComics(characterId, offset = 0) {
	try {
		const limit = 5;
		const apiUrl = 'https://gateway.marvel.com:443/v1/public/characters';
		const requestUrl = `${apiUrl}/${characterId}/comics?apikey=${publicKey}&ts=${timestamp}&hash=${hash}&offset=${offset}&limit=${limit}`;

		const response = await axios.get(requestUrl);

		return response.data.data.results;

	} catch (error) {
		console.error(error);
		throw error;
	}
}

// Rota para obter quadrinhos de um personagem
app.get('/comics/:characterId', async (req, res) => {
  try {
      const characterId = req.params.characterId;
      const offset = req.query.offset || 0; //Parâmetro de offset, padrão é 0

      const apiUrl = `https://gateway.marvel.com/v1/public/characters/${characterId}/comics?apikey=${publicKey}&ts=${timestamp}&hash=${hash}&offset=${offset}`;

      const response = await axios.get(apiUrl);
      const comics = response.data.data.results;

      // Envia as HQs como resposta para o json
      res.json(comics);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Rota para obter o id da HQ ao selecioná-la
app.get('/hq/:comicId', async (req, res) => {

	try {
		
		// Obter o offset da query, se não estiver presente, padrão é 0
		const offset = parseInt(req.query.offset) || 0;
		
		const comicDetails = await getComicById(req.params.comicId);
		const characters = getCharactersByComic(comicDetails.id, offset);
		
		res.json({
			comicDetails: comicDetails,
			characters: characters
		});
		
	} catch (error) {
		console.error(error);
      	res.status(500).json({ error: 'Internal Server Error' });
	}
});

async function getComicById(comicId) {

	try {

		const apiUrl = 'https://gateway.marvel.com:443/v1/public/comics';
		const requestUrl = `${apiUrl}/${comicId}?apikey=${publicKey}&ts=${timestamp}&hash=${hash}`;

		const response = await axios.get(requestUrl);
		const comic = response.data.data.results[0];

		if (!comic) {
			throw new Error('HQ não encontrada');
		}

		return {

			id: comic.id,
			title: comic.title,
			text: !comic.textObjects[0] ? comic.description : comic.textObjects[0].text,
			pageCount: comic.pageCount,
			image: `${comic.images[0].path}.${comic.images[0].extension}`
		}
	} catch (error) {
		console.error(error);
		throw error;
	}
	
}

async function getCharactersByComic(comicId, offset = 0) {
	
	try {
		
		const limit = 5;
		
		const apiUrl = 'https://gateway.marvel.com:443/v1/public/comics';
		const requestUrl = `${apiUrl}/${comicId}/characters?apikey=${publicKey}&ts=${timestamp}&hash=${hash}&offset=${offset}&limit=${limit}`;

		const response = await axios.get(requestUrl);

		return response.data.data.results;

	} catch (error) {
		console.error(error);
		throw error;
		
	}
}

app.get('/hq/:comicId/characters', async(req, res) => {

	try {

		const comicId = req.params.comicId;
		const offset = req.query.offset || 0; //Parâmetro de offset, padrão é 0

		const apiUrl = 'https://gateway.marvel.com:443/v1/public/comics';
		const requestUrl = `${apiUrl}/${comicId}/characters?apikey=${publicKey}&ts=${timestamp}&hash=${hash}&offset=${offset}`;

		const response = await axios.get(requestUrl);
		const characters = response.data.data.results.map(character => ({
			id: character.id,
			name: character.name,
			description: character.description,
			thumbnail: `${character.thumbnail.path}.${character.thumbnail.extension}`,
		}));

		// Envia os personagens como resposta para o json
		res.json(characters);

	} catch (error) {
		console.error(error);
		throw error;
	}
})

app.get("/character/:characterId", async (req, res) => {

	try {

		const characterId = req.params.characterId;

		const character = await getCharacterById(characterId);

		if(!character) {
			throw new Error("Personagem não encontrado");
		}

		res.json({
			character: character
		})


	} catch (error) {
		console.error(error);
		throw error;
	}
})

async function getCharacterById(characterId) {

	try {
		
		const apiUrl = 'https://gateway.marvel.com:443/v1/public/characters';
		const requestUrl = `${apiUrl}/${characterId}?apikey=${publicKey}&ts=${timestamp}&hash=${hash}`;

		const response = await axios.get(requestUrl);

		const characterInfo = response.data.data.results[0];

		return {
			name: characterInfo.name,
			description: characterInfo.description,
			thumbnail: `${characterInfo.thumbnail.path}.${characterInfo.thumbnail.extension}`,
			id: characterInfo.id
		};

	} catch (error) {
		
	}
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});


module.exports = app;