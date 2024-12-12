// Charge les models installés au démarrage
document.addEventListener('DOMContentLoaded', () => {
  console.log("starting");
  // Fetch the models list from the API
  fetch('/api/listAvailableModels')
      .then(response => response.json())
      .then(models => {
          const modelsList = document.getElementById('modelsList');
          console.log("models found : " + modelsList.length)
          models.forEach(model => {
              const listItem = document.createElement('li');
              listItem.textContent = `${model.name} (${model.fullSize})`;
              modelsList.appendChild(listItem);
          });
      })
      .catch(error => console.error('Error fetching models:', error));
});

// Traite les messages (question de l'utilisateur et réponse de l'ia)
document.getElementById('messageForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  // Récupère la question de l'utilisateur
  const messageInput = document.getElementById('messageInput');
  const message = messageInput.value;
  messageInput.value = "";
  
  console.log("\n--------------------");
  console.log("received : "+message);

  // Récupère la textbox où afficher la réponse de l'IA
  const responseBox = document.getElementById('responseBox');
  const time1 = new Date();
  responseBox.innerHTML += `<div class="message user-message"><b>Vous</b> <i>(${time1.toLocaleTimeString()})</i><br />${message}</div>`;

  let data;
  try {
    // envoie la question à l'API et attend la réponse
    const response = await fetch('/api/message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
    });
    data = await response.json();
    data = data.response || "No response received";
    console.log("response : " + data);
  } catch (error) {
    data = error.message || "Unknown error";
    console.error("Error: " + data);
  }
  
  // Calcul le temps de réponse et affiche la réponse dans la textbox
  const time2 = new Date();
  const lag = time2 - time1;
  console.log("lag : " + lag + " ms");
  responseBox.innerHTML += `<div class="message ia-message"><b>Pumbaa-KPT</b> <i>(${time2.toLocaleTimeString()}, ${lag}ms)</i><br />${data}</div>`;

  responseBox.style.display = "block";
});
