document.addEventListener('DOMContentLoaded', function () {
    const pokemonList = document.getElementById('pokemon-list');
    const pokemonListContainer = document.getElementById('pokemon-list-container');
    const pokemonDetailContainer = document.getElementById('pokemon-detail-container');
    const pokemonDetail = document.getElementById('pokemon-detail');
    const backButton = document.getElementById('back-button');
    const searchInput = document.getElementById('search-input');
    const loadingElement = document.getElementById('loading');

    let allPokemons = [];

    // Mostrar loading
    loadingElement.style.display = 'block';

    async function fetchAllPokemons() {
        let nextUrl = 'https://pokeapi.co/api/v2/pokemon?limit=1000';
        let results = [];

        try {
            const response = await fetch(nextUrl);
            const data = await response.json();
            results = results.concat(data.results);
            nextUrl = data.next;

            while (nextUrl) {
                const nextResponse = await fetch(nextUrl);
                const nextData = await nextResponse.json();
                results = results.concat(nextData.results);
                nextUrl = nextData.next;
            }

            return results;
        } catch (error) {
            console.error('Error fetching Pokémon:', error);
            throw error;
        }
    }

    fetchAllPokemons()
        .then(pokemons => {
            allPokemons = pokemons;
            displayPokemons(pokemons);
            loadingElement.style.display = 'none';
        })
        .catch(error => {
            console.error('Error fetching Pokémon:', error);
            loadingElement.style.display = 'none';
            pokemonList.innerHTML = '<p class="text-danger">Error al cargar los Pokémon. Intenta nuevamente.</p>';
        });

    function displayPokemons(pokemons) {
        pokemonList.innerHTML = '';

        if (pokemons.length === 0) {
            pokemonList.innerHTML = '<p class="text-center">No se encontraron Pokémon.</p>';
            return;
        }

        pokemons.forEach(pokemon => {
            const pokemonCard = document.createElement('div');
            pokemonCard.className = 'col-md-4 col-sm-6 mb-4';

            const pokemonId = pokemon.url.split('/').filter(Boolean).pop();

            pokemonCard.innerHTML = `
                <div class="pokemon-card text-center">
                    <div class="pokemon-name">${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</div>
                    <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png" 
                         alt="${pokemon.name}" class="img-fluid mb-2" style="height: 100px;">
                    <button class="btn btn-details btn-sm" data-url="${pokemon.url}">Ver detalles</button>
                </div>
            `;

            pokemonList.appendChild(pokemonCard);
        });

        document.querySelectorAll('.btn-details').forEach(button => {
            button.addEventListener('click', function () {
                const pokemonUrl = this.getAttribute('data-url');
                showPokemonDetails(pokemonUrl);
            });
        });
    }

    async function showPokemonDetails(url) {
        loadingElement.style.display = 'block';
        pokemonListContainer.style.display = 'none';
        pokemonDetailContainer.style.display = 'block';
        pokemonDetail.innerHTML = '';

        try {
            const response = await fetch(url);
            const pokemon = await response.json();

            pokemonDetail.innerHTML = `
                <div class="detail-header">
                    <h2 class="detail-name">${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h2>
                    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" class="img-fluid">
                </div>

                <div class="stats-container">
                    <h4>Estadísticas</h4>
                    ${pokemon.stats.map(stat => `
                        <div class="stat-item">
                            <span class="stat-name">${stat.stat.name.replace('-', ' ')}:</span>
                            <span>${stat.base_stat}</span>
                        </div>
                    `).join('')}
                </div>

                <div class="moves-container">
                    <h4>Movimientos (${pokemon.moves.length})</h4>
                    <div class="moves-list">
                        ${pokemon.moves.map(move => `
                            <span class="move-item">${move.move.name.replace('-', ' ')}</span>
                        `).join('')}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error fetching Pokémon details:', error);
            pokemonDetail.innerHTML = '<p class="text-danger">Error al cargar los detalles del Pokémon. Intenta nuevamente.</p>';
        } finally {
            loadingElement.style.display = 'none';
        }
    }

    backButton.addEventListener('click', function () {
        pokemonListContainer.style.display = 'block';
        pokemonDetailContainer.style.display = 'none';
    });

    searchInput.addEventListener('input', function () {
        const searchTerm = this.value.toLowerCase();
        const filteredPokemons = allPokemons.filter(pokemon =>
            pokemon.name.toLowerCase().includes(searchTerm)
        );
        displayPokemons(filteredPokemons);
    });
});
