# Contextual for VS Code

<div align="center">

![Contextual Logo](assets/icon.png)

[![Version](https://img.shields.io/visual-studio-marketplace/v/denispanov.contextual)](https://marketplace.visualstudio.com/items?itemName=denispanov.contextual)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/denispanov.contextual)](https://marketplace.visualstudio.com/items?itemName=denispanov.contextual)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/denispanov.contextual)](https://marketplace.visualstudio.com/items?itemName=denispanov.contextual)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[Install from VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=denispanov.contextual)

</div>

Contextual is a VS Code extension that simplifies sharing code context with ChatGPT and other LLMs. It provides intelligent file and folder copying with built-in `.gitignore` support and real-time token counting.

## Features

- **Context Management**
  - Copy contents from files, folders, or your entire workspace
  - Support for multi-file selection
  - Automatic `.gitignore` pattern recognition
  - Custom `.contextignore` file support for additional exclusions
  
- **Performance & Efficiency**
  - Built with Bun for optimal performance
  - Asynchronous processing
  - Minimal resource usage
  
- **Token Analytics**
  - Real-time character count
  - Accurate token estimation (via tiktoken)

## Installation

Install Contextual directly from the VS Code Marketplace:

1. Open VS Code
2. Open the Extensions view (`Ctrl+Shift+X` / `Cmd+Shift+X`)
3. Search for "Contextual"
4. Click Install

Or install it directly from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=denispanov.contextual).

## Usage

### Context Menu
- Right-click any file or folder
- Select "Contextual: Copy Content"
- Paste into your LLM chat

### Command Palette
Press `Ctrl+Shift+P` / `Cmd+Shift+P` and choose:
- Copy File Content
- Copy Folder Content
- Copy Workspace Content
- Copy Selected Content

### Multiple Files
- Select files/folders using Ctrl/Cmd or Shift
- Right-click and select "Copy Selected Content"

## Configuration

### Ignore Patterns
- Automatically respects your project's `.gitignore` patterns
- Create a `.contextignore` file in your workspace to specify additional files and patterns to exclude
- Uses the same syntax as `.gitignore`

## Development

### Prerequisites
- [VS Code](https://code.visualstudio.com/)
- [Bun](https://bun.sh/)

### Setup
```bash
git clone https://github.com/denispanov/contextual.git
cd contextual
bun install
bun run watch
```

### Testing
1. Press F5 to launch the Extension Development Host
2. Make changes and reload the window to test

## Contributing

We welcome contributions! For significant changes, please open an issue first to discuss your proposal.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Open a Pull Request

## License

[MIT License](LICENSE)

## Acknowledgments

- Built with [Bun](https://bun.sh/)
- Uses [tiktoken](https://github.com/openai/tiktoken) for token counting
- [ignore](https://github.com/kaelzhang/node-ignore) for gitignore processing