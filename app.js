// Função para manipular login e criação de conta
function handleLogin() {
    const username = document.getElementById('username').value;
    if (username && !localStorage.getItem(username)) {
        alert("Usuário não encontrado. Crie uma conta.");
    } else if (username) {
        localStorage.setItem('loggedInUser', username);
        loadAppScreen();
    } else {
        alert("Por favor, insira um nome de usuário.");
    }
}

function handleCreateAccount() {
    const username = document.getElementById('username').value;
    if (username) {
        if (localStorage.getItem(username)) {
            alert("Usuário já existe. Faça login.");
        } else {
            localStorage.setItem(username, JSON.stringify([]));
            localStorage.setItem('loggedInUser', username);
            loadAppScreen();
        }
    } else {
        alert("Por favor, insira um nome de usuário.");
    }
}

function loadAppScreen() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-screen').style.display = 'block';

    const loggedInUser = localStorage.getItem('loggedInUser');
    document.getElementById('current-user').textContent = loggedInUser;

    renderUserList();
}

// Função para adicionar o nome do usuário à lista
function addUser() {
    const loggedInUser = localStorage.getItem('loggedInUser');
    let userList = JSON.parse(localStorage.getItem('userList')) || [];

    // Verificar se o nome já está na lista
    if (!userList.some(user => user.name === loggedInUser)) {
        userList.push({ name: loggedInUser, timeLimit: null });
        localStorage.setItem('userList', JSON.stringify(userList));
        renderUserList();
    } else {
        alert("Seu nome já está na lista.");
    }
}

// Função para remover o nome do usuário da lista
function removeUser(userName) {
    const loggedInUser = userName || localStorage.getItem('loggedInUser');
    let userList = JSON.parse(localStorage.getItem('userList')) || [];

    // Verifica se o usuário está na lista
    if (userList.some(user => user.name === loggedInUser)) {
        // Exibe um popup de confirmação
        const confirmRemoval = confirm("Você tem certeza que deseja remover seu nome da lista?");
        if (confirmRemoval) {
            userList = userList.filter(user => user.name !== loggedInUser);
            localStorage.setItem('userList', JSON.stringify(userList));
            renderUserList();
            alert("Seu nome foi removido com sucesso.");
        } else {
            alert("Remoção cancelada.");
        }
    } else {
        alert("Seu nome não está na lista.");
    }
}

// Função para mover o nome do usuário para o final da lista (Abaixar Nome)
function moveToEnd(userName) {
    const loggedInUser = userName || localStorage.getItem('loggedInUser');
    let userList = JSON.parse(localStorage.getItem('userList')) || [];

    if (userList.some(user => user.name === loggedInUser)) {
        // Remove o nome da lista e coloca no final
        userList = userList.filter(user => user.name !== loggedInUser);
        userList.push({ name: loggedInUser, timeLimit: null });
        localStorage.setItem('userList', JSON.stringify(userList));
        renderUserList();
    } else {
        alert("Seu nome não está na lista.");
    }
}

function renderUserList() {
    const userList = JSON.parse(localStorage.getItem('userList')) || [];
    const userListElement = document.getElementById('user-list');
    userListElement.innerHTML = '';

    const now = Date.now();
    const loggedInUser = localStorage.getItem('loggedInUser'); // Recuperar o usuário logado

    const updatedUserList = userList.map((user, index) => {
        const li = document.createElement('li');
        li.style.display = 'flex'; // Para alinhar o texto e os botões na mesma linha
        li.style.alignItems = 'center';
        li.style.justifyContent = 'space-between';

        // Para os 6 primeiros, exibir o temporizador
        if (index < 6) {
            if (user.timeLimit === null) {
                // Inicia a contagem de 60 minutos quando o usuário entra entre as 6 primeiras posições
                user.timeLimit = now + 60 * 60 * 1000; // Define o limite de 1 hora a partir deste momento
            }

            const timeRemaining = user.timeLimit - now;

            if (timeRemaining > 0) {
                const minutes = Math.floor(timeRemaining / (1000 * 60));
                const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
                li.textContent = `${index + 1}. ${user.name} - ${minutes}:${seconds} restantes`;
            } else {
                // Tempo expirado
                li.textContent = `${index + 1}. ${user.name} - Tempo expirado`;
            }
        } else {
            // Para posições abaixo da 6ª, exibir apenas o nome
            li.textContent = `${index + 1}. ${user.name}`;
        }

        // Adicionar botões somente para o usuário logado
        if (user.name === loggedInUser) {
            const buttonsContainer = document.createElement('div');
            buttonsContainer.style.display = 'flex';
            buttonsContainer.style.gap = '10px';

            const moveButton = document.createElement('button');
            moveButton.textContent = '↓';
            moveButton.className = 'move'; // Classe para estilo azul
            moveButton.onclick = () => moveToEnd(user.name);

            const removeButton = document.createElement('button');
            removeButton.textContent = '−';
            removeButton.className = 'remove'; // Classe para estilo vermelho
            removeButton.onclick = () => {
                if (confirm('Deseja realmente remover seu nome da lista?')) {
                    removeUser(user.name);
                }
            };

            buttonsContainer.appendChild(moveButton);
            buttonsContainer.appendChild(removeButton);
            li.appendChild(buttonsContainer);
        }

        userListElement.appendChild(li);
        return user;
    });

    // Atualizar a lista no localStorage
    localStorage.setItem('userList', JSON.stringify(updatedUserList));

    // Verificação para remoção de nomes com tempo expirado
    removeExpiredUsers(updatedUserList);
}



// Função para remover usuários com tempo expirado
function removeExpiredUsers(userList) {
    const now = Date.now();
    const updatedUserList = userList.filter((user, index) => index >= 6 || user.timeLimit > now);

    if (userList.length !== updatedUserList.length) {
        localStorage.setItem('userList', JSON.stringify(updatedUserList));
        renderUserList();
    }
}

// Função para logout
function logout() {
    localStorage.removeItem('loggedInUser');
    document.getElementById('app-screen').style.display = 'none';
    document.getElementById('login-screen').style.display = 'block';
    document.getElementById('username').value = '';
}

// Verifica periodicamente a lista para remover nomes expirados
setInterval(() => {
    const userList = JSON.parse(localStorage.getItem('userList')) || [];
    renderUserList();
}, 1000);

// Função para bloquear adições fora do horário permitido
function isAddUserAllowed() {
    const now = new Date();
    const hours = now.getHours();
    return (hours < 7 || hours >= 12);
}

// Modifique a função addUser para verificar o horário permitido
function addUser() {
    if (!isAddUserAllowed()) {
        alert("Adições só são permitidas antes das 7h e após as 12h.");
        return;
    }

    const loggedInUser = localStorage.getItem('loggedInUser');
    let userList = JSON.parse(localStorage.getItem('userList')) || [];

    // Verificar se o nome já está na lista
    if (!userList.some(user => user.name === loggedInUser)) {
        userList.push({ name: loggedInUser, timeLimit: null });
        localStorage.setItem('userList', JSON.stringify(userList));
        renderUserList();
    } else {
        alert("Seu nome já está na lista.");
    }
}
