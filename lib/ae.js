var ae = {
	canWriteFiles: function() {
		if (isSecurityPrefSet()) return true;

		alert('Utiflity requires access to write files.\n' +
			'Go to the "General" panel of the application preferences and make sure ' +
			'"Allow Scripts to Write Files and Access Network" is checked.');
		app.executeCommand(2359);

		return isSecurityPrefSet();

		function isSecurityPrefSet() {
			return app.preferences.getPrefAsLong(
				"Main Pref Section",
				"Pref_SCRIPTING_FILE_NETWORK_SECURITY"
			) === 1;
		}
	}
};