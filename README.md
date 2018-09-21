# Download Google Sheets with ESTK

Utility tool for Adobe After Effects to download Google Sheets via ESTK. Available formats: `json, csv, xlsx, ods, pdf, tsv`

## Use case

```javascript
    var url = 'https://docs.google.com/spreadsheets/d/1a0xMqq9VB_eWBjuwqjZT2pjhXl7SOGG3PJSmBgZdHYI/edit#gid=456690232';
    var saveFile = '~/Desktop/GS.json'; // json, csv, xlsx, ods, pdf, tsv
    var myFile = downloadGoogleSheet(url, saveFile, ['csv']);

    /**
     * @param  {string} url             - Link to google sheets, as in https://docs.google.com/spreadsheets/d/{LONG_SPREADSHEET_ID}/edit#gid={SHEET_ID}
     * @param  {string} saveFile        - Path to file object where sheet will be saved
     * @param  {array} optionalFormats 	- Array of optional formats to download, any of ['json', csv', 'xlsx', 'ods', 'pdf', 'tsv'];
     * @return {file object}            - Google Sheet file object
     */
    downloadGoogleSheet(url, saveFile, optionalFormats)
```

## Notes

- Path to `curl.exe` is required to work properly on Windows.
- Make sure your Google Sheet is published to the web:
  - In Google Docs chose `File -> Publish to the web...`
  - Select to publish `Entire Document` as `Web page` and click `Publish`.

----------------

Developed by [Alex White](https://aescripts.com/authors/a-b/alex-white/) and [renderTom](https://aescripts.com/authors/q-r/rendertom/).