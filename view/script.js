document.getElementById('messageForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  const message = document.getElementById('messageInput').value;
  console.log("\n--------------------");
  console.log("received : "+message);

  const responseBox = document.getElementById('responseBox');
  const time1 = new Date();
  responseBox.innerHTML += `<div class="message user-message"><b>Vous</b> <i>(${time1.toLocaleTimeString()})</i><br />${message}</div>`;

  let data;
  try {
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
  
  const time2 = new Date();
  const lag = time2 - time1;
  console.log("lag : " + lag + " ms");
  responseBox.innerHTML += `<div class="message ia-message"><b>Pumbaa-KPT</b> <i>(${time2.toLocaleTimeString()}, ${lag}ms)</i><br />${data}</div>`;

  responseBox.style.display = "block";
});
