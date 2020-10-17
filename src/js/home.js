
(async function load()
{
  //Traer la siguiente información.
  //action
  //terror
  //animation
  async function getData(url) {
    const response = await fetch (url)
    const data = await response.json();
    if (data.data.movie_count > 0) {
      return data;
    }
    throw new Error ('No se encontro ningun resultado.');
  }


  //Se mandan a llamar elementos del DOM para declararlos antes de que algo se ejecute.
  const $home = document.getElementById('home');

  const $featuringContainer = document.getElementById('featuring');
  const $form = document.getElementById('form');

  const $modal = document.getElementById('modal');
  const $overlay = document.getElementById('overlay');
  const $hideModal = document.getElementById('hide-modal');

  const $modalTitle = document.getElementById('modal-movie-title');
  const $modalImage = document.getElementById('modal-movie-image');
  const $modalDescription = document.getElementById('modal-movie-description');

  
  const $actionContainer = document.querySelector("#action");
  const $dramaContainer = document.getElementById('drama');
  const $animationContainer = document.getElementById('animation');

  //
  function setAttributes($element, attributes){
    for(const attribute in attributes){
      $element.setAttribute(attribute, attributes[attribute]);
    }
  }

  //va a llenar el html cuando se enuentre la pelicula.
  function featuringTemplate(peli) {
    return(
      `
      <div class="featuring">
        <div class="featuring-image">
          <img src="${peli.medium_cover_image}" alt="70">
        </div>
        <div class="featuring-content">
          <p class="featuring-title">
            Pelicula encontrada.
          </p>
          <p>
            ${peli.title}
          </p>
        </div>
      </div>
      `
    )
  }

  const BASE_API = 'https://yts.mx/api/v2/'

  //Se ejecutara antes de que se busquen las peliculas.
  $form.addEventListener('submit', async (event) => {
    //debugger
    event.preventDefault(); //previene que la pagina se recargue cada vez.
    $home.classList.add('search-active');//se agrega la calse de css si se hace la busqueda.
    const $loader = document.createElement('img');
    //debugger
    setAttributes($loader, {
      src: 'src/images/loader.gif',
      height : 50,
      width: 50,
    })
    $featuringContainer.append($loader);

    const data = new FormData($form);//para la busqueda.
    
    //manejar los errores
    try {
        const {
          data: {
            movies: pelis
          }
        } = await getData(`${BASE_API}list_movies.json?limit=1&query_term=${data.get('name')}`);
        
        const HTMLString = featuringTemplate(pelis[0]);
        $featuringContainer.innerHTML = HTMLString;
    }
    catch (error){
      alert(error.message);
      //debugger
      $loader.remove();
      $home.classList.remove('search-active');
    }
    
  });

  
  //retorna html con la data de la api dentro.
  function videoItemTemplate(movie, category)
  {
    return(
    `
    <div class="primaryPlayListItem" data-id="${movie.id}" data-category="${category}">
      <div class="primaryPlayListItem-image">
        <img src="${movie.medium_cover_image}" alt="">
      </div>
      <h4 class="primaryPlayListItem-title">
        ${movie.title}
      </h4>
    </div>
   `
   )
  }

  //muestra el modal al darle click a una peli
  function addEventClick($element){
    //addEventListener recibe dos parametros, el evento y la función.
    $element.addEventListener('click', function(){
      showModal($element);
    });
  }

  //retornar la lista y el id de la movie
  function findById(list, id){
    //filtrar datos.
    return list.find(movie => movie.id === parseInt(id, 10))

    //Esta también sirve
    // return list.find(movie=>{
    //   //debugger
    //   return movie.id === parseInt(id, 10);
    // })
  }

  function findMovie (id, category){
    //
    switch (category) 
    {
      case 'action' :{
        return findById(actionList, id)
      }
      case 'drama' :{
        return findById(dramaList, id)
      }
      default: {
        return findById(animationList, id)
      }
    }
  }

  //Muestra el modal.
  function showModal ($element){
    $overlay.classList.add('active');
    $modal.style.animation = 'modalIn .8s forwards'; //el tiempo que se tarda en abrir el modal.
    const id = $element.dataset.id;
    const category = $element.dataset.category;
    const data = findMovie(id, category);
    //llenar el modal.
    $modalTitle.textContent = data.title;
    $modalImage.setAttribute('src', data.medium_cover_image);
    $modalDescription.textContent = data.description_full;
  }

  //Oculta el Modal
  $hideModal.addEventListener('click', hideModal);

  function hideModal() {
    $overlay.classList.remove('active');
    $modal.style.animation = 'modalOut .8s forwards';
  }

  //remueve el loader carga de data a la funcion createTemplate
  function renderMovieList(list, $container, category) {
    if($container.children[0]){
      $container.children[0].remove();
    }else{
      null;
    }
    //carga la data en las funciones correspondientes.
    list.forEach((movie) => {
      const HTMLString = videoItemTemplate(movie, category);
      const movieElement = createTemplate(HTMLString);
      $container.append(movieElement);
      //cargar de poco a poco nuestras imagenes
      const image = movieElement.querySelector('img');
      image.addEventListener('load', (event) => {
        event.target.classList.add('fadeIn');
      })
      
      addEventClick(movieElement); //para cuando den click en una image aparezca el modal.
    });
  }

  //inserta en el DOM la info ya cargada de renderMovieList y va iterando al mismo tiempo lo que hay en videoItemTemplate
  function createTemplate(HTMLString) {
    const html = document.implementation.createHTMLDocument();
    html.body.innerHTML = HTMLString;
    return html.body.children[0];
  }

  async function cacheExist(category) {
    const listName = `${category}List`;
    const cacheList = window.localStorage.getItem(listName);

    //trayendo los datos y poniendolos en cache.
    if(cacheList){
      return JSON.parse(cacheList);
    }
    //si no existe entonces los crea y los obtiene.
    const { data: { movies: data } } = await getData(`${BASE_API}list_movies.json?genre=${category}`);
    window.localStorage.setItem(listName, JSON.stringify(data));
    return data;
  }
  
  //mandar a llamar a la api
  //Se ejecutan las funciones y les enviamos el array y el elemento del DOM
  //const { data: { movies: actionList } } = await getData(`${BASE_API}list_movies.json?genre=action`);
  const actionList = await cacheExist('action');
  renderMovieList(actionList, $actionContainer, 'action');
  
  const dramaList = await cacheExist('drama');
  renderMovieList(dramaList, $dramaContainer, 'drama');

  const animationList = await cacheExist('animation');
  renderMovieList(animationList, $animationContainer, 'animation');

  
})();



  





