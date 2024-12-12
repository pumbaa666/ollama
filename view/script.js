document.getElementById('messageForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  const message = document.getElementById('messageInput').value;
  console.log("--------------------");
  console.log("received : "+message);

  const responseBox = document.getElementById('responseBox');
  
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
  
  responseBox.textContent = data;
  responseBox.style.display = "block";
});
