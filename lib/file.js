var file = {
	getExtension: function(fileObj) {
		fileObj = this.makeSureItsFileObject(fileObj);

		var fileName, split, extension;

		fileName = fileObj.displayName;
		split = fileName.split('.');
		if (split.length < 2) {
			return null;
		}

		extension = split[split.length - 1];

		return extension;
	},

	changeExtention: function(fileObj, extension) {
		var oldExtension, newFile, split;

		fileObj = this.makeSureItsFileObject(fileObj);
		oldExtension = this.getExtension(fileObj);

		if (!oldExtension) {
			newFile = fileObj.fsName + '.' + extension;
		} else {
			split = fileObj.fsName.split('.');
			split[split.length - 1] = extension;
			newFile = split.join('.');
		}

		return new File(newFile);
	},

	readContent: function(fileObj, encoding) {
		var fileContent;

		fileObj = this.makeSureItsFileObject(fileObj);
		encoding = encoding || 'utf-8';

		fileObj.open('r');
		fileObj.encoding = encoding;
		fileContent = fileObj.read();
		fileObj.close();

		return fileContent;
	},

	write: function(fileObj, fileContent, encoding) {
		fileObj = this.makeSureItsFileObject(fileObj);
		encoding = encoding || 'utf-8';

		fileObj.encoding = encoding;
		fileObj.open("w");
		fileObj.write(fileContent);
		fileObj.close();

		return fileObj;
	},

	makeSureItsFileObject: function(file) {
		return (file instanceof File) ? file : new File(file);
	}
};