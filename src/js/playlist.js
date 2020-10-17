// https://randomuser.me/api/?gender=female

(async function loadPlaylist()
{
    //call to the api
    //user img
    //user name
    async function getData(url) {
        const response = await fetch(url);
        const data = await response.json();
        users = data;
        return data;
    }
    
    const userList = await getData('https://randomuser.me/api/?inc=name,picture&results=10');
    
    function createTemplate(HTMLString){
        const html = document.implementation.createHTMLDocument();
        html.body.innerHTML = HTMLString;
        return html.body.children[0];
      }
   
    //Fill dom elements with the api.
    function renderUser(list,$container){
        
    
        for (var i = 0; i < list; i++) {
          const HTMLString = `
    
          <ul class="playlistFriends">
            <li class="playlistFriends-item">
              <a href="#">
                <img src="${users.results[i].picture.thumbnail}" />
                <span>
                  ${users.results[i].name.last}, ${users.results[i].name.first}
                </span>
              </a>
            </li>
    
    
    
          </ul>
    
            `;
          const userElement = createTemplate(HTMLString);
          $container.append(userElement)
        }
    }

   

    const $userContainer = document.querySelector('#users');
    const listPerson = users.results.length;
    renderUser(listPerson,$userContainer)

})();