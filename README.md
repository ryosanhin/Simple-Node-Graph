# Simple-Node-Graph
**Simple node editor. Perhaps too simple to be useful.**  
You can just write Markdown and connect nodes to each other. It has no other useful features. 
This project consists of HTML, CSS, Javascript. Built with Gemini support.

I'm Japanese. English is not my first language so there may be some mistakes. Suggestions or corrections are always welcome. Thank you for your understanding!

## Usage
Open the `index.html` and you will quickly understand how to use.
* Select a node or link: Click it (it will be highlighted).
* Add node: click "Add node" in the bottom right corner of the canvas.
* Edit and preview:
	* Double-click a node to switch to edit mode.
	* Click outside the node to switch to preview mode.
* Connect nodes: Click the right side socket of a node and drag the link to the left side socket of another node.
* Delete node or link: Select it, then press Del or Backspace.
* Save and load data:
	* Click "Import" in the top left corner of canvas and select your json file.
	* Click "Export" in the top left corner of canvas and download current canvas as json file.

## Acknowledgements
This project uses the following wonderful open-source libraries:
* [Drawflow](https://github.com/jerosoler/Drawflow): MIT License
* [marked](https://github.com/markedjs/marked): MIT License

## License
0BSD