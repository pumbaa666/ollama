# ollama

## Bootstart
```
# Download and install Ollama
# It could take some time ! (more than 10 minutes)
curl -fsSL https://ollama.com/install.sh | sh

# Generate a public key
ollama serve
    Couldn't find '/home/loic/.ollama/id_ed25519'. Generating new private key.
    Your new public key is: in secret.txt

# Pull some models from https://ollama.com/search
# ollama pull llama3.2 # 42 Go !!
ollama pull llama3.2 # 2 Go
ollama pull gemma # 5 Go
ollama pull mistral # 

```

Test the server is running by browsing : [http://127.0.0.1:11434](http://127.0.0.1:11434)


Save the result (except the License) into a file named llama3.2-modelfile
`ollama show llama3.2 --modelfile` > llama3.2-modelfile

Create a shortcut : `sudo ollama create raccourci -f llama3.2-modelfile`
Run the model : `ollama run llama3.2`
Run the shortcut : `ollama run raccourci`