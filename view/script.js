// Charge les models installés au démarrage
document.addEventListener('DOMContentLoaded', () => {
  const modelsList = document.getElementById('modelsList');
  const modelNameHeading = document.getElementById('modelName');
  let selectedModel = null;

  // Fetch available models
  function fetchModels() {
      fetch('/api/listAvailableModels')
          .then(response => response.json())
          .then(models => {
              modelsList.innerHTML = '';
              models.forEach(model => {
                  const listItem = document.createElement('li');
                  listItem.textContent = model.name + "(" + model.fullSize + ")";
                  listItem.style.cursor = 'pointer';
                  listItem.addEventListener('click', () => selectModel(model.name));
                  modelsList.appendChild(listItem);
              });
          })
          .catch(error => console.error('Error fetching models:', error));
  }

  // Select a model
  function selectModel(modelName) {
    console.log("selectedModel using : " + modelName);
    selectedModel = modelName;
    modelNameHeading.textContent = `Model: ${modelName}`;
    
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
          responseBox.style.display = 'block';
          //responseBox.innerHTML += `<p><strong>Response:</strong> ${data.response}</p>`;
        // Calcul le temps de réponse et affiche la réponse dans la textbox
        const time2 = new Date();
        const lag = time2 - time1;
        console.log("lag : " + lag + " ms");
        responseBox.innerHTML += `<div class="message ia-message"><b>Pumbaa-KPT</b> <i>(${time2.toLocaleTimeString()}, ${lag}ms)</i><br />${data.response}</div>`;

      })
      .catch(error => console.error('Error sending message:', error));
  });

  // Initial fetch of models
  fetchModels();
});
