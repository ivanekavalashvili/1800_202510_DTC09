fetch('elements/chat.html')
    .then(response => response.text())
    .then(text => document.getElementById('elementID').innerHTML = text);