const root = document.querySelector('main');
const tbody = root.querySelector('table tbody.filled-table');

//Requisitando dados ------------------------------------------------------------------------------
function consultOrder(user) {
    const urlUser = `https://api.github.com/users/${user}`;
    return fetch(urlUser)
        .then((response) => response.json())
        .then(({ login, name, public_repos, followers }) => ({
            login,
            name,
            public_repos,
            followers,
        }));
}

//Manipulando os dados ----------------------------------------------------------------------------
let registeredUsers;

const favoriteButton = root.querySelector('#search button');
const userSearch = root.querySelector('#search input');

favoriteButton.addEventListener('click', addRequest);
userSearch.addEventListener('keydown', function (e) {
    if (e.key == 'Enter') {
        addRequest();
    }
});

function addRequest() {
    const { value } = userSearch;
    userSearch.value = '';

    addUser(value);
}

async function addUser(requestedUser) {
    try {
        if (!requestedUser) {
            throw new Error('Busca inválida! Por favor digite algo!');
        }

        const alreadyExists = registeredUsers.find(
            (user) => user.login.toLowerCase() == requestedUser.toLowerCase()
        );

        if (alreadyExists) {
            throw new Error('Usuário já cadastrado!');
        }

        const newUser = await consultOrder(requestedUser);

        if (!newUser.login) {
            throw new Error('Usuário não encontrado!');
        }

        registeredUsers = [newUser, ...registeredUsers];

        updateTable();
        saveUsers();
    } catch (erro) {
        console.log(erro);
    }
}

function saveUsers() {
    localStorage.setItem('@git-fav', JSON.stringify(registeredUsers));
}

function loadUsers() {
    registeredUsers = JSON.parse(localStorage.getItem('@git-fav')) || [];
}

//Mundando a tela ---------------------------------------------------------------------------------
function trModel() {
    const tr = document.createElement('tr');
    tr.innerHTML = `
    <td>
      <img
        src="https://github.com/maykbrito.png"
        alt="Foto de Mayk Brito"
      />
      <a href="https://github.com/maykbrito" target="_blank">
        <p>Mayk Brito</p>
        <span>/maykbrito</span>
      </a>
    </td>
    <td class="repositories">123</td>
    <td class="followers">1234</td>
    <td>
      <button class="remover">Remover</button>
    </td>
    `;

    tr.classList.add('user');
    return tr;
}

function updateTable() {
    clearTable();
    registeredUsers.forEach((user) => {
        const trTemplate = trModel();
        const newTr = changeContent(trTemplate, user);
        tbody.append(newTr);
    });
}

function clearTable() {
    const tbodyLines = Array.from(tbody.children);
    tbodyLines.forEach((tr) => tr.remove());
}

function changeContent(tr, user) {
    tr.querySelector('img').src = `https://github.com/${user.login}.png`;
    tr.querySelector('img').alt = `Foto de ${user.name}`;
    tr.querySelector('a').href = `https://github.com/${user.login}`;
    tr.querySelector('a p').textContent = `${user.name}`;
    tr.querySelector('a span').textContent = `/${user.login}`;
    tr.querySelector('td.repositories').textContent = `${user.public_repos}`;
    tr.querySelector('td.followers').textContent = `${user.followers}`;

    return tr;
}

loadUsers();
updateTable();
