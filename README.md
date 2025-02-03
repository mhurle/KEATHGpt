# KEATHGPT

![KEATHGPT](./banner.png)

<h1 align="center">KEATHGPT</h1>
<h2 align="center">Internal Company LLM Interface</h2>
<p align="center">A clean, privacy‐focused and customisable UI for interacting with our company LLMs.</p>

KEATHGPT is an internal, white‐labelled chat interface for our large language models. It has been streamlined to only allow model switching among the available models:
- gpt4o
- gpt o3 mini
- claude 3.5 sonnet
- deepseek R1

No personal API key input is needed – the company key is used automatically.

## Running with Docker

```bash
docker run --name keathgpt -d -p 8080:80 your-company/keathgpt:latest