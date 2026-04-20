const themeToggle = document.getElementById('theme-toggle');
const manageProfilesButton = document.getElementById('manage-profiles');
const addProfileButton = document.getElementById('add-profile');
const profilesContainer = document.querySelector('.container');
const savedTheme = localStorage.getItem('theme');
const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
const defaultTheme = savedTheme || (prefersLight ? 'light' : 'dark');
let manageMode = false;
let customProfiles = JSON.parse(localStorage.getItem('userProfiles') || '[]');

function setTheme(theme) {
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${theme}-theme`);

    if (themeToggle) {
        const label = themeToggle.querySelector('.theme-label');
        const icon = themeToggle.querySelector('.theme-icon');
        themeToggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
        themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro');

        if (label) {
            label.textContent = theme === 'dark' ? 'Dark mode' : 'Light mode';
        }
        if (icon) {
            icon.textContent = theme === 'dark' ? '🌙' : '☀';
        }
    }

    localStorage.setItem('theme', theme);
}

if (themeToggle) {
    setTheme(defaultTheme);

    themeToggle.addEventListener('click', () => {
        const nextTheme = document.body.classList.contains('dark-theme') ? 'light' : 'dark';
        setTheme(nextTheme);
    });
}

function saveCustomProfiles() {
    localStorage.setItem('userProfiles', JSON.stringify(customProfiles));
}

function createProfileElement(profile, saved = false) {
    const li = document.createElement('li');
    li.className = 'profile';

    const link = document.createElement('a');
    link.href = 'catalogo.html';
    link.className = 'profile-link';
    link.dataset.name = profile.name;
    link.dataset.img = profile.img;
    if (saved) {
        link.dataset.saved = 'true';
    }

    link.innerHTML = `
        <figure>
            <img src="${profile.img}" alt="Foto do perfil ${profile.name}.">
            <figcaption>${profile.name}</figcaption>
        </figure>
    `;

    li.appendChild(link);
    return li;
}

function renderSavedProfiles() {
    if (!profilesContainer) {
        return;
    }

    customProfiles.forEach((profile) => {
        profilesContainer.appendChild(createProfileElement(profile, true));
    });
}

function updateManageModeUI() {
    if (!profilesContainer || !manageProfilesButton) {
        return;
    }

    document.body.classList.toggle('manage-mode', manageMode);
    manageProfilesButton.textContent = manageMode ? 'Sair de gerenciar' : 'Gerenciar perfis';

    profilesContainer.querySelectorAll('.profile').forEach((profileItem) => {
        let deleteButton = profileItem.querySelector('.delete-profile');

        if (manageMode) {
            if (!deleteButton) {
                deleteButton = document.createElement('button');
                deleteButton.type = 'button';
                deleteButton.className = 'delete-profile';
                deleteButton.setAttribute('aria-label', 'Remover perfil');
                deleteButton.textContent = '×';
                profileItem.appendChild(deleteButton);
            }
        } else if (deleteButton) {
            deleteButton.remove();
        }
    });
}

function removeProfile(profileItem) {
    if (!profileItem) {
        return;
    }

    const profileLink = profileItem.querySelector('.profile-link');
    if (profileLink?.dataset.saved === 'true') {
        const name = profileLink.dataset.name;
        const img = profileLink.dataset.img;
        customProfiles = customProfiles.filter((profile) => profile.name !== name || profile.img !== img);
        saveCustomProfiles();
    }

    profileItem.remove();
}

function addProfile() {
    if (!profilesContainer) {
        return;
    }

    const name = prompt('Digite o nome do novo perfil:');
    if (!name || !name.trim()) {
        return;
    }

    const image = prompt('Digite o caminho da imagem do perfil ou deixe em branco para usar a imagem padrão:', 'assets/images/perfil-1.jpg') || 'assets/images/perfil-1.jpg';
    const newProfile = {
        name: name.trim(),
        img: image.trim() || 'assets/images/perfil-1.jpg'
    };

    customProfiles.push(newProfile);
    saveCustomProfiles();
    profilesContainer.appendChild(createProfileElement(newProfile, true));
}

if (manageProfilesButton) {
    manageProfilesButton.addEventListener('click', () => {
        manageMode = !manageMode;
        updateManageModeUI();
    });
}

if (addProfileButton) {
    addProfileButton.addEventListener('click', addProfile);
}

if (profilesContainer) {
    profilesContainer.addEventListener('click', (event) => {
        const deleteButton = event.target.closest('.delete-profile');
        if (deleteButton) {
            event.preventDefault();
            const profileItem = deleteButton.closest('.profile');
            removeProfile(profileItem);
            return;
        }

        const link = event.target.closest('.profile-link');
        if (!link) {
            return;
        }

        if (manageMode) {
            return;
        }

        event.preventDefault();
        const name = link.dataset.name || '';
        const image = link.dataset.img || '';
        const perfil = {
            nome: name,
            imagem: image
        };

        localStorage.setItem('perfilAtivo', JSON.stringify(perfil));
        window.location.href = link.href;
    });
}

renderSavedProfiles();
updateManageModeUI();

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
    if (!savedTheme) {
        setTheme(event.matches ? 'dark' : 'light');
    }
});
