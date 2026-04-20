import { categories } from './data.js';
import { createCarousel } from './components/Carousel.js';
import { shuffleArray } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    let perfil = JSON.parse(localStorage.getItem('perfilAtivo'));

    let personalList = [];
    if (perfil) {
        personalList = JSON.parse(localStorage.getItem('myList_' + perfil.nome) || '[]');
    }

    if (perfil) {
        const kidsLink = document.querySelector('.kids-link');
        const profileIcon = document.querySelector('.profile-icon');

        if (kidsLink) kidsLink.textContent = perfil.nome;
        if (profileIcon && perfil.imagem) profileIcon.src = perfil.imagem;

        // Randomize for specific profiles
        if (['Family', 'Watermelon', 'Orange'].includes(perfil.nome)) {
            categories.forEach(category => {
                if (['Trending', 'Series', 'Shows', 'Popular'].includes(category.title)) {
                    shuffleArray(category.items);
                }
            });
        }
    }

    const container = document.getElementById('main-content');

    if (container) {
        categories.forEach(category => {
            let cat = category;
            if (category.title === "My list") {
                if (perfil && personalList.length > 0) {
                    cat = { title: "My list", items: personalList };
                } else {
                    return;
                }
            }
            const carousel = createCarousel(cat);
            container.appendChild(carousel);
        });

        // Add create list section if no personal list
        if (perfil && personalList.length === 0) {
            const section = document.createElement('div');
            section.className = 'slider-section';
            section.id = 'create-list';

            const header = document.createElement('div');
            header.className = 'slider-header';

            const title = document.createElement('h2');
            title.className = 'slider-title';
            title.innerText = 'Create Your List';

            header.appendChild(title);
            section.appendChild(header);

            const row = document.createElement('div');
            row.className = 'movie-row';

            const card = document.createElement('div');
            card.className = 'movie-card create-list-card';
            card.innerHTML = `
                <div style="padding: 20px; text-align: center; color: white;">
                    <h3>Create Your Own List</h3>
                    <p>Add your favorite movies and series here.</p>
                    <button class="btn-create-list" style="background: #e50914; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Start Creating</button>
                </div>
            `;

            row.appendChild(card);
            section.appendChild(row);
            container.appendChild(section);
        }
    }

    // Make plus buttons functional for all profiles
    if (perfil) {
        document.addEventListener('click', (e) => {
            // Handle Start Creating button
            if (e.target.classList.contains('btn-create-list')) {
                openCreateListModal(perfil.nome, categories);
                return;
            }

            // Handle delete from My list
            const deleteButton = e.target.closest('.btn-delete-list');
            if (deleteButton) {
                try {
                    const itemData = deleteButton.dataset.item;
                    const item = JSON.parse(itemData);
                    
                    const listKey = 'myList_' + perfil.nome;
                    let myList = JSON.parse(localStorage.getItem(listKey) || '[]');
                    myList = myList.filter(i => i.img !== item.img);
                    
                    localStorage.setItem(listKey, JSON.stringify(myList));
                    alert('Removido da sua lista!');
                    location.reload();
                } catch (err) {
                    console.error('Erro ao remover item:', err);
                }
                return;
            }

            const addButton = e.target.closest('.btn-add-list');
            if (addButton) {
                try {
                    const itemData = addButton.dataset.item;
                    const item = JSON.parse(itemData);
                    
                    const listKey = 'myList_' + perfil.nome;
                    let myList = JSON.parse(localStorage.getItem(listKey) || '[]');
                    
                    if (!myList.find(i => i.img === item.img)) {
                        myList.push(item);
                        localStorage.setItem(listKey, JSON.stringify(myList));
                        alert('Adicionado à sua lista!');
                        
                        // Remove create section if exists
                        const createSection = document.getElementById('create-list');
                        if (createSection) createSection.remove();
                        
                        // Reload to update My list section
                        location.reload();
                    } else {
                        alert('Pronto, já está na sua lista!');
                    }
                } catch (err) {
                    console.error('Erro ao adicionar item:', err);
                }
            }
        });

        // Handle close modal
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                e.target.remove();
            }
        });
    }
});

function openCreateListModal(profileName, categories) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
        overflow-y: auto;
        padding: 20px;
    `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: #1f1f1f;
        border-radius: 10px;
        padding: 30px;
        max-width: 900px;
        width: 100%;
        max-height: 80vh;
        overflow-y: auto;
        color: white;
    `;

    let selectedItems = [];
    let allItems = [];

    // Collect all items from relevant categories
    categories.forEach(cat => {
        if (['Trending', 'Series', 'Shows', 'Popular'].includes(cat.title)) {
            allItems = allItems.concat(cat.items.map(item => ({ ...item, category: cat.title })));
        }
    });

    let itemsHTML = '<h2 style="margin-bottom: 20px; color: #e50914;">Select Items for Your List</h2>';
    itemsHTML += '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px; margin-bottom: 20px;">';

    allItems.forEach((item, index) => {
        itemsHTML += `
            <div class="list-item-selector" style="cursor: pointer; border: 2px solid transparent; border-radius: 5px; overflow: hidden; transition: all 0.3s;" data-index="${index}">
                <img src="${item.img}" alt="${item.alt}" style="width: 100%; height: 200px; object-fit: cover; display: block;">
                <div style="padding: 10px; text-align: center; font-size: 12px; background: #0a0a0a;">
                    <span style="color: #999;">${item.category}</span>
                </div>
            </div>
        `;
    });

    itemsHTML += '</div>';
    modalContent.innerHTML = itemsHTML;

    // Add event listeners to item selectors
    modalContent.querySelectorAll('.list-item-selector').forEach(selector => {
        selector.addEventListener('click', () => {
            const index = parseInt(selector.dataset.index);
            const item = allItems[index];

            if (selectedItems.find(i => i.img === item.img)) {
                selectedItems = selectedItems.filter(i => i.img !== item.img);
                selector.style.borderColor = 'transparent';
            } else {
                selectedItems.push(item);
                selector.style.borderColor = '#e50914';
            }
        });
    });

    // Add buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        gap: 10px;
        justify-content: center;
        margin-top: 20px;
    `;

    const saveBtn = document.createElement('button');
    saveBtn.textContent = `Save List (${selectedItems.length} items)`;
    saveBtn.style.cssText = `
        background: #e50914;
        color: white;
        border: none;
        padding: 12px 30px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 16px;
        font-weight: bold;
    `;
    saveBtn.addEventListener('click', () => {
        if (selectedItems.length === 0) {
            alert('Please select at least one item!');
            return;
        }

        const listKey = 'myList_' + profileName;
        let myList = JSON.parse(localStorage.getItem(listKey) || '[]');
        
        selectedItems.forEach(item => {
            if (!myList.find(i => i.img === item.img)) {
                myList.push(item);
            }
        });

        localStorage.setItem(listKey, JSON.stringify(myList));
        alert('List saved successfully!');
        modal.remove();
        location.reload();
    });

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.cssText = `
        background: #333;
        color: white;
        border: none;
        padding: 12px 30px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 16px;
    `;
    cancelBtn.addEventListener('click', () => {
        modal.remove();
    });

    buttonContainer.appendChild(saveBtn);
    buttonContainer.appendChild(cancelBtn);
    modalContent.appendChild(buttonContainer);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}
