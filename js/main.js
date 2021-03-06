var vm = new Vue({
	el:'#app',
	data: {
		pokemonListRaw: [],
		pokemonList: [],
		paginate: ['pokemonList'],
		pokemonData: {
			types: [{ 'type': {'name': 'grass'} }, { 'type': {'name': 'poison'} }], 
			description: 'BULBASAUR CAN BE SEEN NAPPING IN BRIGHT SUNLIGHT. THERE IS A SEED ON ITS BACK. BY SOAKING UP THE SUN’S RAYS, THE SEED GROWS PROGRESSIVELY LARGER.'
		},
		menu: 'MENU',
		initialLoad: true,
		isOpen: false,
		visorOpen: false,
		visorId: 0,
		isLoadingDesc: false,
		isLoadingTypes: false,
		searchByName: null,
		searchByLetter: 'Letter',
		searchByGen: 'Gen',
		filtering: false,
		results: true,
	},
	created() {
		for(var i = 1; i <= 807; i++) {

			// Temporal viariable for current pokemon
			var pkmn = { id: null, number: null, name: null, sprite: null }

			// Saves the sprite of the current pokemon
			pkmn.sprite = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/' + i + '.png'
	
			// Saves the id and number of the current pokemon 
			pkmn.id = i;

			if( i <= 9 ) {
				pkmn.number = '00' + i;
			} else if( i >= 10 && i<= 99 ) {
				pkmn.number = '0' + i;
			} else {
				pkmn.number = i;
			}

			// Saves the name of the current pokemon from the pokeList array
			pkmn.name = pokeList[i - 1];
			
			// Push the current pokemon to the pokemonList Raw
			this.pokemonListRaw.push(pkmn);

			this.pokemonList = this.pokemonListRaw;
		}
	},

	mounted() {
		this.initialLoad = false;
	},

	methods: {
		pkmnData(id, index) {

			// Determines the id to use when loading data in the visor sections
			this.visorId = id - 1;

			var options = { protocol: 'https' };
			var P = new Pokedex.Pokedex(options);

			this.isLoadingTypes = true;
			var pokemon = 'https://pokeapi.co/api/v2/pokemon/' + id + '/';
			P.resource(pokemon)
				 .then( (response)=> { 				 	
					this.pokemonData.types = response.types.reverse();
					this.isLoadingTypes = false; 
				 } )
				 .catch( (error)=> {
				 	console.log(error);
				 } )

			this.isLoadingDesc = true;
			var species = 'https://pokeapi.co/api/v2/pokemon-species/' + id + '/';
			P.resource(species)
				 .then( (response)=> {
					var flavorText = response.flavor_text_entries;
					var counter = 0;

					for(var i = 0; i < flavorText.length; i++) {
						if( flavorText[i].language.name == 'en' && counter == 0 ) {
							this.pokemonData.description = response.flavor_text_entries[i].flavor_text;
							counter = 1;
						}
					}

					this.isLoadingDesc = false;
					
				 } )
				  .catch( (error)=> {
				 	console.log(error);
				 } )

		},

		filterPKMN() {

			// Resets the query to default
			this.pokemonList = this.pokemonListRaw;
			this.results = true;
			this.visorId = 0;

			// Temporal variable to store the filtered data
			var filteredList = [];
	

			//-------------------------------------//
			// Search by name in the raw data array
			if(this.searchByName) {

				var searchFilter = this.searchByName.toLowerCase();

				for(var i = 0; i < this.pokemonListRaw.length; i++) {	
					if( this.pokemonListRaw[i].name.indexOf(searchFilter) != -1 || 
				   		this.pokemonListRaw[i].id == searchFilter ) {

						filteredList.push(this.pokemonListRaw[i]);
					}
				}
			}

			//-------------------------------------//
			// Search by Letter in the raw data array
			if(this.searchByLetter != 'Letter') {

				var searchFilter = []

				switch (this.searchByLetter) {
					case 'abc':
						searchFilter = ['a', 'b', 'c'];
						break;
					case 'def':
						searchFilter = ['d', 'e', 'f'];
						break;
					case 'ghi':
						searchFilter = ['g', 'h', 'i'];
						break;
					case 'jkl':
						searchFilter = ['j', 'k', 'l'];
						break;
					case 'mno':
						searchFilter = ['m', 'n', 'o'];
						break;
					case 'pqrs':
						searchFilter = ['p', 'q', 'r', 's'];
						break;
					case 'tuv':
						searchFilter = ['t', 'u', 'v'];
						break;
					case 'wxyz':
						searchFilter = ['w', 'x', 'y', 'z'];
						break;
				}

				for(var i = 0; i < this.pokemonListRaw.length; i++) {
					if( searchFilter.includes( this.pokemonListRaw[i].name.charAt(0) ) ) {
						filteredList.push(this.pokemonListRaw[i]);
					}
				}


				// The result is ordered alphabetically
				function compare(a, b) {
					var comparison = 0;
					if(a.name > b.name) { 
						comparison = 1; 
					} else if(a.name < b.name) {
						comparison = -1;
					}

					return comparison;
				}

				filteredList.sort(compare);
			}


			// -------------------------------------- //
			// Search By Generation in the raw data array
			if(this.searchByGen != 'Gen') {

				var genMin = 0;
				var genMax = 0;

				switch (this.searchByGen) {
					case 'genI':
						genMin = 0;
						genMax = 151;
						break;
					case 'genII':
						genMin = 151;
						genMax = 251;
						break;
					case 'genIII':
						genMin = 251;
						genMax = 386;
						break;
					case 'genIV':
						genMin = 386;
						genMax = 493;
						break;
					case 'genV':
						genMin = 493;
						genMax = 649;
						break;
					case 'genVI':
						genMin = 649;
						genMax = 721;
						break;
					case 'genVII':
						genMin = 721;
						genMax = 807;
						break;
				}

				for(var i = genMin; i < genMax; i++) {
					filteredList.push(this.pokemonListRaw[i]);
				}

			}


			//--------------------------------------//
			// Determines if there are results or not
			if(filteredList.length > 0) {
				this.pokemonList = filteredList;
				this.filtering = true;
			} else {
				this.results = false;
			}

			// Finally, reset the value of inputs
			this.searchByName = null;
			this.searchByLetter = 'Letter';
			this.searchByGen = 'Gen';
			this.isOpen = false;
			this.menu = 'MENU';
			this.$refs.paginator.goToPage(1);
			
		},

		allPKMN() {
			this.pokemonList = this.pokemonListRaw;
			this.results = true;
			this.filtering = false;
			this.isOpen = false;
			this.menu = 'MENU';

			if(this.$refs.paginator.currentPage !== 0) {
				this.$refs.paginator.goToPage(1)
			}
		
		},

		openMenu() {

			this.isOpen = !this.isOpen;

			if(this.menu == 'MENU') {
				this.menu = 'CLOSE';
			} else {
				this.menu = 'MENU';
			}
		}

	},

});
