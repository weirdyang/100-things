const cells = 100;
const app = { data: [], dark: false, counter: 0 };
const modalOverlay = document.querySelector("#modal-overlay");
const main = document.querySelector("main");
const storageKey = "hundo";
const themeKey = "theme";
const button = document.querySelector(".done-button");
const save = document.querySelector(".save-button");
const modal = document.getElementById("modal");
const info = document.querySelector(".subtitle");
const cellContainer = document.querySelector(".cells");
const theme = document.querySelector(".theme-button");
const exportButton = document.querySelector(".export-button");
const reset = document.querySelector(".reset-button");
const progress = "--progress-width";
const barWidth = 200;
const truncate = (str, n = 55) =>
    str.length > n ? str.substr(0, n - 1).trim() + "..." : str;
const defaultText = (i) => `week ${i}`;
const hideModal = () => {
    modal.style.display = "none";
    modalOverlay.classList.toggle("close");
    clearInfo();
};
const showModal = () => {
    modal.style.display = "block";
    modalOverlay.classList.toggle("close");
};
const setUpModal = (modal) => {
    const close = document.querySelector(".close-button");
    // When the user clicks on <span> (x), close the modal
    close.addEventListener("click", () => {
        hideModal();
    });
    // When the user clicks anywhere outside of the modal, close it
    modalOverlay.addEventListener("click", () => {
        hideModal();
    });
};
const checkAndParse = (key, prop) => {
    const data = localStorage.getItem(key);
    if (!data) {
        return app[prop];
    }
    return JSON.parse(data);
};
const toggleDark = () => {
    main.classList.toggle("dark");
    modal.classList.toggle("dark");
};
const downloadFile = (jsonStr, fileName) => {
    let element = document.createElement("a");
    element.setAttribute(
        "href",
        "data:text/json;charset=utf-8," + encodeURIComponent(jsonStr)
    );
    element.setAttribute("download", fileName);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
};
const setUpListeners = () => {
    reset.addEventListener("click", () => {
        resetData();
    });
    exportButton.addEventListener("click", () => {
        const data = JSON.stringify(app);
        downloadFile(data, `${new Date().toISOString().slice(0, 10)}.json`);
    });
    save.addEventListener("click", () => {
        const id = modal.dataset.cell;
        const data = modal.querySelector(".item-text-content").value;
        app.data[id].text = data;
        const text = data ?? "The thing";
        const cellText = document.querySelector(`.cell-text-${id}`);
        cellText.innerText = truncate(text);
        saveToLocal(storageKey, app.data);
        updateInfo();
    });
    theme.addEventListener("click", () => {
        toggleDark();
        app.dark = !app.dark;
        saveToLocal(themeKey, app.dark);
    });
    button.addEventListener("click", () => {
        const data = modal.dataset.cell;

        app.data[data].filled = !app.data[data].filled;
        toggleDone(app.data[data].filled, button, data);
        saveToLocal(storageKey, app.data);
        updateInfo();
    });
};
const updateInfo = () => {
    info.innerText = `Updated: ${new Date().toLocaleTimeString()}`;
};
const clearInfo = () => {
    info.innerText = ``;
};
const toggleDone = (done, button, id) => {
    button.innerText = done ? "undo" : "done";
    app.counter = done ? app.counter + 1 : app.counter - 1;
    updateWidth(app.counter, cells, barWidth);
    document.getElementById(id).classList.toggle("done");
};
const saveToLocal = (storageKey, data) => {
    localStorage.setItem(storageKey, JSON.stringify(data));
};
const updateWidth = (num, cells, width) => {
    const accumulated = Math.ceil((num / cells) * width);
    document.documentElement.style
        .setProperty(progress, `${accumulated}px`);
}
const createCells = (cells) => {
    console.clear();
    for (let i = 0; i < cells; i++) {
        const cell = document.createElement("article");
        const cellNumber = i + 1;
        cell.classList.add("cell");
        cell.id = i;
        const cellNum = document.createElement("section");
        cellNum.classList.add("cell-num");
        cellNum.innerText = cellNumber;
        cell.appendChild(cellNum);

        const cellText = document.createElement("section");
        cellText.classList.add("cell-text", `cell-text-${i}`);
        cell.appendChild(cellText);
        const info = app.data[i];
        if (info) {
            if (info.filled) {
                cell.classList.toggle("done");
            }
            const text = info.text
        } else {
            app.data.push({
                id: i,
                text: "",
                filled: false
            });
        }
        cellText.innerText = truncate(app.data[i].text);
        cell.addEventListener("click", () => {
            modal.setAttribute("data-cell", i);
            modalOverlay.classList.toggle("close");
            modal.style.display = "block";
            modal.querySelector(".item-text-content").value = app.data[i].text;
            button.innerText = app.data[i].filled ? "undo" : "done";
        });

        cellContainer.appendChild(cell);
    }
};
const resetData = () => {
    localStorage.removeItem(storageKey);
    localStorage.removeItem(themeKey);
    resetUpApp();
};
const resetUpApp = () => {
    app.data = [];
    app.dark = true;
    app.counter = 0;
    modal.classList.add("dark");
    main.classList.add("dark");
    cellContainer.innerHTML = "";
    createCells(cells);
    localStorage.setItem(storageKey, JSON.stringify(app.data));
};
document.addEventListener("DOMContentLoaded", () => {
    setUpModal(modal);
    app.data = checkAndParse(storageKey, "data");
    app.dark = checkAndParse(themeKey, "dark");

    if (app.dark) {
        toggleDark();
    }
    createCells(cells);
    setUpListeners();
    localStorage.setItem(storageKey, JSON.stringify(app.data));
});