/*
	Download Google Sheets with ESTK
	Utility tool for Adobe After Effects & Photoshop to download Google Sheets via ESTK. Available formats: `json, csv, xlsx, ods, pdf, tsv`
	
	Developed by Alex White https://aescripts.com/authors/a-b/alex-white/
	and renderTom https://aescripts.com/authors/q-r/rendertom/
*/

(function() {
	//@include 'lib/ae.js'
	//@include 'lib/array.js'
	//@include 'lib/file.js'
	//@include 'lib/json2.min.js'

	var url = 'https://docs.google.com/spreadsheets/d/1a0xMqq9VB_eWBjuwqjZT2pjhXl7SOGG3PJSmBgZdHYI/edit#gid=456690232';
	var saveFile = '~/Desktop/GS.json'; // json, csv, xlsx, ods, pdf, tsv
	var myFile = downloadGoogleSheet(url, saveFile, ['csv']);

	/**
	 * downloadGoogleSheet description
	 * @param  {string} url             - Link to google sheets, as in https://docs.google.com/spreadsheets/d/{LONG_SPREADSHEET_ID}/edit#gid={SHEET_ID}
	 * @param  {string} saveFile        - Path to file object where sheet will be saved
	 * @param  {array} optionalFormats 	- Array of optional formats to download, any of ['json', 'csv', 'xlsx', 'ods', 'pdf', 'tsv'];
	 * @return {file object}            - Google Sheet file object
	 */
	function downloadGoogleSheet(url, saveFile, optionalFormats) {
		var saveAsFormats = ['csv', 'xlsx', 'ods', 'pdf', 'tsv'];
		var jsonFormat = 'json';
		var patterns = {
			urlPrefix: 'https://docs.google.com',
			spreadsheetID: '/spreadsheets/d/([a-zA-Z0-9-_]+)',
			sheetID: '[#&]gid=([0-9]+)',
		};
		var appName = BridgeTalk.appName;
		var IDs = {
			spreadsheetID: undefined,
			sheetID: undefined,
			sheetIndex: undefined,
			set: function(url) {
				validateURL(url);
				this.spreadsheetID = new RegExp(patterns.spreadsheetID).exec(url)[1];
				this.sheetID = new RegExp(patterns.sheetID).exec(url)[1];

				function validateURL(url) {
					var urlRegex = new RegExp(patterns.urlPrefix + patterns.spreadsheetID + '/edit' + patterns.sheetID);

					if (!urlRegex.test(url)) {
						throw 'Invalid URL address.\nExpected URL should be in form https://docs.google.com/spreadsheets/d/{LONG_SPREADSHEET_ID}/edit#gid={SHEET_ID}';
					}
				}
			},
			/**
			 * setSheetIndex - worksheetsData file has to be downloaded in order to get Sheet Index.
			 * It stores information regarding all available sheets in the document.
			 */
			setSheetIndex: function() {
				var sheetIndex, worksheetsFile, worksheetsContent, worksheetsJSON, dataEntries, href;

				sheetIndex = 0;
				worksheetsFile = downloadFileViaCommandLine(Folder.temp.fsName + '/worksheetsData.json', getURLFor('worksheets'));
				worksheetsContent = file.readContent(worksheetsFile);

				try {
					worksheetsJSON = JSON.parse(worksheetsContent);
				} catch (e) {
					throw 'Unable to parse "' + worksheetsFile.fsName + '" file.\n' + e.toString();
				}

				dataEntries = worksheetsJSON.feed.entry;

				for (var i = 0, il = dataEntries.length; i < il; i++) {
					href = dataEntries[i].link[3].href;
					if (href.match(this.sheetID)) {
						sheetIndex = i + 1;
						break;
					}
				}

				this.sheetIndex = sheetIndex;
				worksheetsFile.remove();
			}
		};

		var getURLFor = function(property) {
			var URLs = {
				'export': 'https://docs.google.com/spreadsheets/d/' + IDs.spreadsheetID + '/export?gid=' + IDs.sheetID + '&format=',
				'cells': 'https://spreadsheets.google.com/feeds/cells/' + IDs.spreadsheetID + "/" + IDs.sheetIndex + '/public/values?alt=json',
				'worksheets': 'https://spreadsheets.google.com/feeds/worksheets/' + IDs.spreadsheetID + '/public/basic?alt=json',
			};

			return URLs[property];
		};

		var saveFormats, extension, newFile;

		try {
			if (appName === 'aftereffects' && !ae.canWriteFiles()) {
				return null;
			}

			IDs.set(url);

			saveFormats = getSaveFormats(saveFile, optionalFormats);
			for (var i = 0, il = saveFormats.length; i < il; i++) {
				extension = saveFormats[i];
				newFile = file.changeExtention(saveFile, extension);

				if (extension.toLowerCase() === jsonFormat) {
					downloadJSON(url, newFile);
				} else {
					downloadAs(url, newFile, extension);
				}
			}

		} catch (error) {
			alert(error.toString());
		}

		function downloadJSON(url, saveFile) {
			var cellsFile, cellsContent, cellsJSON, sheetJSON, sheetContent, gsFile;

			IDs.setSheetIndex();

			cellsFile = downloadFileViaCommandLine(saveFile, getURLFor('cells'));
			cellsContent = file.readContent(cellsFile);

			try {
				cellsJSON = JSON.parse(cellsContent);
			} catch (e) {
				throw 'Unable to parse "' + cellsFile.fsName + '" file.\n' + e.toString();
			}

			sheetJSON = organizeData(cellsJSON.feed.entry);
			sheetContent = JSON.stringify(sheetJSON, false, 4);

			gsFile = file.write(saveFile, sheetContent);

			return gsFile;

			/**
			 * Organises raw GS data into Rows and Columns
			 * @param  {object} entry - JSON object
			 * @return {object}       - object with 'rows' and 'columns' properties
			 */
			function organizeData(entry) {
				var rows, columns, cell, row, col, text;

				rows = [];
				columns = [];

				for (var i = 0, il = entry.length; i < il; i++) {
					cell = entry[i].gs$cell;
					row = parseInt(cell.row) - 1;
					col = parseInt(cell.col) - 1;
					text = cell.$t;

					if (!rows[row]) {
						rows[row] = [];
					}
					rows[row][col] = text;

					if (!columns[col]) {
						columns[col] = [];
					}
					columns[col][row] = text;
				}
				return {
					rows: rows,
					columns: columns,
				};
			}
		}

		function downloadAs(url, saveFile, extension) {
			var fileURL, gsFile;

			fileURL = getURLFor('export') + extension;
			gsFile = downloadFileViaCommandLine(saveFile, fileURL);

			return gsFile;
		}

		/**
		 * downloadFileViaCommandLine downloads a file via system.callSystem() command.
		 * @param  {object} saveFile - File Object to save file to.
		 * @param  {string} fileURL  - File URL online
		 * @return {object}          - Downloaded File Object.
		 */
		function downloadFileViaCommandLine(saveFile, fileURL) {
			var curl, curlExe, isWindows, cmd;

			curl = 'curl';
			// curlExe = File('path_to_curl_on_Windows'); // require curl.exe to work properly on Windows
			isWindows = $.os.indexOf('Windows') != -1;
			saveFile = file.makeSureItsFileObject(saveFile);

			checkInternetConnection();

			if (isWindows) {
				if (typeof curlExe === 'undefined') {
					throw 'In order to download files on Windows OS you need to provide a path to curl.exe file';
				}
				curl = curlExe.fsName;
			}

			cmd = '"' + curl + '" -s -o "' + saveFile.fsName + '" -L "' + fileURL + '"';

			callSystem(cmd);

			if (!saveFile.exists) {
				throw 'Unable to download file.\nRequested URL: ' + fileURL + '\n\nPlease check your internet connection and firewall.';
			}

			return saveFile;

			/**
			 * Poor man's way to check for internet connection using command line and ping;
			 * @return {void} - nothing.
			 */
			function checkInternetConnection() {
				var server, pingCount, waitTime, cmd, response;

				server = '216.58.209.46'; // google.com
				pingCount = 1;
				waitTime = 50;

				cmd = 'ping ' + server + ' -c ' + pingCount + ' -W ' + waitTime;
				if (isWindows) {
					cmd = 'ping ' + server + ' -n ' + pingCount + ' -w ' + waitTime;
				}

				response = callSystem(cmd);
				if (isWindows && response.match('unreachable|(100% loss)') || response.match('100.0% packet loss')) {
					throw 'Cannot connect to the internet';
				}
			}

			function callSystem(cmd) {
				var response, tempOutputFile;

				if (appName === 'aftereffects') {
					response = system.callSystem(cmd);
				} else if (appName === 'photoshop') {
					tempOutputFile = Folder.temp.fsName + '/' + Math.round(Math.random() * (new Date()).getTime() * 21876);

					app.system(cmd + " > " + tempOutputFile);
					response = file.readContent(tempOutputFile);
					File(tempOutputFile).remove();
				} else {
					throw 'Cannot run callSystem function in ' + appName;
				}
				return response;
			}
		}
		/**
		 * @param  {object} saveFile       - File Object to save sheet to.
		 * @param  {array} optionalFormats - Array of optional formats to save sheet to.
		 * @return {array}                 - Array of file extensions
		 */
		function getSaveFormats(saveFile, optionalFormats) {
			var extension, formats;

			extension = file.getExtension(saveFile);
			if (!extension) {
				throw 'Please specify extension for file "' + saveFile + '" first.';
			}

			formats = [];
			formats.push(extension);

			if (typeof optionalFormats !== 'undefined' && array.isArray(optionalFormats)) {
				formats = formats.concat(optionalFormats);
			}

			formats = array.unique(formats);

			validateFormats(formats);

			return formats;

			/**
			 * validateFormats validates if request has unsupported formats/extensions.
			 * @param  {array} extensions - Array of extensions.
			 * @return {void}             - nothing
			 */
			function validateFormats(extensions) {
				var extension, invalidFormats;

				invalidFormats = [];

				for (var i = 0, il = extensions.length; i < il; i++) {
					extension = extensions[i];
					if (extension.toLowerCase() !== jsonFormat && !array.contains(saveAsFormats, extension.toLowerCase())) {
						invalidFormats.push(extension);
					}
				}

				if (invalidFormats.length > 0) {
					throw 'Unsupported ' + invalidFormats.toSource() + ' extensions.\nUse one of these: ' + jsonFormat + ', ' + saveAsFormats.join(', ') + '.';
				}
			}
		}
	}
})();