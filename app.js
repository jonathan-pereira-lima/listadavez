// Função para manipular login e criação de conta
function handleLogin() {
    const username = document.getElementById('username').value.trim();
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
    const username = document.getElementById('username').value.trim();
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

    if (!userList.some(user => user.name === loggedInUser)) {
        userList.push({ name: loggedInUser, timeLimit: null, moveCount: 0, lastMovedTime: null });
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

    if (userList.some(user => user.name === loggedInUser)) {
        const confirmRemoval = confirm("Você tem certeza que deseja remover seu nome da lista?");
        if (confirmRemoval) {
            userList = userList.filter(user => user.name !== loggedInUser);
            localStorage.setItem('userList', JSON.stringify(userList));
            renderUserList();
        }
    } else {
        alert("Seu nome não está na lista.");
    }
}

// Função para mover o nome do usuário para o final da lista (Abaixar Nome)
function moveToEnd(userName) {
    const loggedInUser = userName || localStorage.getItem('loggedInUser');
    let userList = JSON.parse(localStorage.getItem('userList')) || [];

    const user = userList.find(user => user.name === loggedInUser);
    if (user) {
        const now = Date.now();
        
        // Verifica se 10 minutos se passaram desde o último movimento
        if (user.lastMovedTime && (now - user.lastMovedTime < 10 * 60 * 1000)) {
            alert("Você só pode mover o nome novamente após 10 minutos.");
            return;
        }

        // Atualiza o contador de movimentos e o tempo do último movimento
        user.moveCount += 1;
        user.lastMovedTime = now;

        // Remove o usuário da lista e coloca no final
        userList = userList.filter(user => user.name !== loggedInUser);
        userList.push(user); // Coloca o usuário no final da lista

        localStorage.setItem('userList', JSON.stringify(userList));
        renderUserList();
    } else {
        alert("Seu nome não está na lista.");
    }
}

function renderUserList() {
    const userList = JSON.parse(localStorage.getItem('userList')) || [];
    const userListElement = document.getElementById('user-list');
    const addUserButton = document.getElementById('add-user-button');
    userListElement.innerHTML = '';

    const now = Date.now();
    const loggedInUser = localStorage.getItem('loggedInUser'); // Recuperar o usuário logado

    const updatedUserList = userList.map((user, index) => {
        const li = document.createElement('li');
        li.style.display = 'flex'; // Para alinhar o texto e os botões na mesma linha
        li.style.alignItems = 'center';
        li.style.justifyContent = 'space-between';

        if (index < 6) {
            if (user.timeLimit === null) {
                user.timeLimit = now + 60 * 60 * 1000; // Define o limite de 1 hora a partir deste momento
            }

            const timeRemaining = user.timeLimit - now;

            if (timeRemaining > 0) {
                const minutes = Math.floor(timeRemaining / (1000 * 60));
                const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
                li.textContent = `${index + 1}. ${user.name} - ${minutes}:${seconds} restantes`;
            } else {
                li.textContent = `${index + 1}. ${user.name} - Tempo expirado`;
            }
        } else {
            li.textContent = `${index + 1}. ${user.name}`;
        }

        // Mostrar o contador de movimentos ao lado do nome
        const moveCountSpan = document.createElement('span');
        moveCountSpan.textContent = `(${user.moveCount} movimentos)`;
        li.appendChild(moveCountSpan);

        // Adicionar botões somente para o usuário logado
        if (user.name === loggedInUser) {
            const buttonsContainer = document.createElement('div');
            buttonsContainer.style.display = 'flex';
            buttonsContainer.style.gap = '10px';

            const moveButton = document.createElement('button');
            moveButton.textContent = '↓';
            moveButton.className = 'move';
            moveButton.onclick = () => moveToEnd(user.name);

            const removeButton = document.createElement('button');
            removeButton.textContent = '−';
            removeButton.className = 'remove';
            removeButton.onclick = () => removeUser(user.name);

            buttonsContainer.appendChild(moveButton);
            buttonsContainer.appendChild(removeButton);
            li.appendChild(buttonsContainer);
        }

        userListElement.appendChild(li);
        return user;
    });

    localStorage.setItem('userList', JSON.stringify(updatedUserList));

    removeExpiredUsers(updatedUserList);

    const isUserInList = userList.some(user => user.name === loggedInUser);
    if (isUserInList) {
        addUserButton.style.display = 'none';
    } else {
        addUserButton.style.display = 'inline-block';
    }
}

function removeExpiredUsers(userList) {
    const now = Date.now();
    const updatedUserList = userList.filter((user, index) => index >= 6 || user.timeLimit > now);

    if (userList.length !== updatedUserList.length) {
        localStorage.setItem('userList', JSON.stringify(updatedUserList));
        renderUserList();
    }
}

function logout() {
    localStorage.removeItem('loggedInUser');
    document.getElementById('app-screen').style.display = 'none';
    document.getElementById('login-screen').style.display = 'block';
    document.getElementById('username').value = '';
}

setInterval(() => {
    const userList = JSON.parse(localStorage.getItem('userList')) || [];
    renderUserList();
}, 1000);

function isAddUserAllowed() {
    const now = new Date();
    const hours = now.getHours();
    return (hours < 7 || hours >= 12);
}

function addUser() {
    if (!isAddUserAllowed()) {
        alert("Adições só são permitidas antes das 7h e após as 12h.");
        return;
    }

    const loggedInUser = localStorage.getItem('loggedInUser');
    let userList = JSON.parse(localStorage.getItem('userList')) || [];

    if (!userList.some(user => user.name === loggedInUser)) {
        userList.push({ name: loggedInUser, timeLimit: null, moveCount: 0, lastMovedTime: null });
        localStorage.setItem('userList', JSON.stringify(userList));
        renderUserList();
    } else {
        alert("Seu nome já está na lista.");
    }
}
