//Mundando a tela ---------------------------------------------------------------------------------
const root = document.querySelector('main');
const tbody = root.querySelector('table tbody.filled-tbody');


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
    <button class="remove-user">Remover</button>
    </td>
    `;

    tr.classList.add('user');
    return tr;
}

function updateTable(registeredUsers) {
    const hasSavedUsers = registeredUsers.length;

    clearTable();

    if (!hasSavedUsers) {
        showEmptyTable();
    } else {
        showFilledTable();
        registeredUsers.forEach((user) => {
            const trTemplate = trModel();
            const newTr = changeContent(trTemplate, user);
            tbody.append(newTr);
        });
        return 'screen is showing users';
    }
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

function showEmptyTable() {
    const emptyTable = root.querySelector('div.table-container');
    const emptyTbody = root.querySelector('table tbody.empty-tbody');
    const filledTbody = root.querySelector('table tbody.filled-tbody');

    emptyTable.classList.add('table-container-table-filled');
    emptyTbody.classList.remove('hidden');
    filledTbody.classList.add('hidden');
}

function showFilledTable() {
    const emptyTable = root.querySelector('div.table-container');
    const emptyTbody = root.querySelector('table tbody.empty-tbody');
    const filledTbody = root.querySelector('table tbody.filled-tbody');

    emptyTable.classList.remove('table-container-table-filled');
    emptyTbody.classList.add('hidden');
    filledTbody.classList.remove('hidden');
}

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

async function validateOrder(requestedUser) {
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

        return addUser(newUser);
    } catch (erro) {
        alert(erro);
    }
}

function addUser(newUser) {
    registeredUsers = [newUser, ...registeredUsers];

    saveUsers();
    return updateTable(registeredUsers);
}

function saveUsers() {
    localStorage.setItem('@git-fav', JSON.stringify(registeredUsers));
}

function loadUsers() {
    registeredUsers = JSON.parse(localStorage.getItem('@git-fav')) || [];
}

function deleteUser(userToBeDeleted) {
    registeredUsers = registeredUsers.filter(
        (users) => users.login != userToBeDeleted
    );
    updateTable(registeredUsers);
    saveUsers();
}

//Eventos -----------------------------------------------------------------------------------------
const favoriteButton = root.querySelector('#search button');
const userSearch = root.querySelector('#search input');

favoriteButton.addEventListener('click', receiveOrder);
userSearch.addEventListener('keydown', function (e) {
    if (e.key == 'Enter') {
        receiveOrder();
    }
});

async function receiveOrder() {
    const { value } = userSearch;
    userSearch.value = '';

    const response = await validateOrder(value);

    if (response) {
        addEventToRemove();
    }
}

function addEventToRemove() {
    const removeButtons = Array.from(
        root.querySelectorAll('table tbody.filled-tbody button.remove-user')
    );

    removeButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const reallyWantToDelete = confirm('Realmente deseja excluir?');

            if (reallyWantToDelete) {
                const userOfThisButton = button.parentNode.parentNode
                    .querySelector('span')
                    .textContent.replace('/', '');

                deleteUser(userOfThisButton);
                addEventToRemove();
            }
        });
    });
}

loadUsers();
updateTable(registeredUsers);
addEventToRemove();
