// Charge les models installés au démarrage
document.addEventListener('DOMContentLoaded', () => {
  const modelsList = document.getElementById('modelsList');
  let selectedModel = null;

  // Fetch available models
  function fetchModels() {
      fetch('/api/listAvailableModels')
          .then(response => response.json())
          .then(models => {
              modelsList.innerHTML = '';
              models.forEach(model => {
                  const listItem = document.createElement('li');
                  listItem.textContent = model.name + " (" + model.fullSize + ")";
                  listItem.style.cursor = 'pointer';
                  listItem.addEventListener('click', () => selectModel(listItem, model.name));
                  modelsList.appendChild(listItem);
              });
          })
          .catch(error => console.error('Error fetching models:', error));
  }

  // Select a model and highlight it
  function selectModel(listItem, modelName) {
    console.log("selectedModel using : " + modelName);
      // Remove highlight from previously selected model
      const previousSelection = modelsList.querySelector('.selected');
      if (previousSelection) {
          previousSelection.classList.remove('selected');
      }

      // Highlight the selected model
      listItem.classList.add('selected');
      selectedModel = modelName;

    // Reset chatbox
    responseBox.innerHTML = "";
  }

  // Handle form submission
  document.getElementById('messageForm').addEventListener('submit', (event) => {
      event.preventDefault();
      const message = document.getElementById('messageInput').value;

      if (!selectedModel) {
          alert('Please select a model first.');
          return;
      }

  // Récupère la textbox où afficher la réponse de l'IA
  const responseBox = document.getElementById('responseBox');
  const time1 = new Date();
  responseBox.innerHTML += `<div class="message user-message"><b>Vous</b> <i>(${time1.toLocaleTimeString()})</i><br />${message}</div>`;

      fetch('/api/message', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'X-Model-Name': selectedModel
          },
          body: JSON.stringify({ message })
      })
      .then(response => response.json())
      .then(data => {
        const responseBox = document.getElementById('responseBox');
        const formattedCodeBox = document.getElementById('formattedCode');
        const codeContent = document.getElementById('codeContent');
        responseBox.style.display = 'block';
        
        // Check if the response contains code (example: wrapped in "```")
        // and formats it
        const codeMatch = data.response.match(/```([\s\S]*?)```/);
        if (codeMatch) {
            formattedCodeBox.style.display = 'block';
            codeContent.textContent = codeMatch[1].trim();
        } else {
            formattedCodeBox.style.display = 'none';
        }
        
        // Calcul le temps de réponse et affiche la réponse dans la textbox
        const time2 = new Date();
        const lag = time2 - time1;
        console.log("lag : " + lag + " ms");
        responseBox.innerHTML += `<div class="message ia-message"><b>Pumbaa-KPT</b> <i>(${time2.toLocaleTimeString()}, ${lag}ms)</i><br />${data.response}</div>`;

      })
      .catch(error => console.error('Error sending message:', error));
  });
  
  // Copy button functionality
  document.getElementById('copyCodeButton').addEventListener('click', () => {
    const codeContent = document.getElementById('codeContent');
    navigator.clipboard.writeText(codeContent.textContent)
        .then(() => showNotification('Code copied to clipboard!'))
        .catch(err => console.error('Failed to copy code:', err));
  });
  
  // Show notification when code is successfully copied into clipboard
  function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';

    // Hide the notification after 3 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

  // Initial fetch of models
  fetchModels();
});
