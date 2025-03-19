function loadElement(elementId, filePath) {
    fetch(filePath)
        .then(response => response.text())
        .then(text => document.getElementById(elementId).innerHTML = text);
}

// Load navbar and footer
loadElement('navbar', 'elements/navbar.html');
loadElement('footer', 'elements/footer.html');