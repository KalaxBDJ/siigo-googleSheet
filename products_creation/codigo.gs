const prop = PropertiesService.getScriptProperties();
const token = getToken()
var sheet = SpreadsheetApp.openById(prop.getProperty('SHEET_ID')).getSheetByName(prop.getProperty('SHEET_NAME'));

function getToken() {
  const username = prop.getProperty('USERNAME');
  const accessKey = prop.getProperty('ACCESS_KEY');

  const options = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Partner-Id': 'appsheetIntegration',
    },
    payload: JSON.stringify({
      'username': username,
      'access_key': accessKey,
    }),
  };

  try {
    const response = UrlFetchApp.fetch('https://api.siigo.com/auth', options);
    return JSON.parse(response.getContentText()).access_token;
  } catch (e) {
    Logger.log("Error fetching token: " + e);
    throw new Error("Failed to fetch token");
  }
}

function removeSpecialChars(str) {
  if (!str) {
    return ''
  }

  const result = str
    .replace(/["\\\n\r\t]/g, '');

  return result;
}

function updateName(rowNumber, name, reference) {
  Utilities.sleep(5000);

  console.log("Updating description and reference of row #", rowNumber)
  var desc = sheet.getRange(Number(rowNumber), 15);
  // Set the new value - Description
  desc.setValue(removeSpecialChars(name));

  var ref = sheet.getRange(Number(rowNumber), 11);
  // Set the new value - Reference
  ref.setValue(removeSpecialChars(reference));
}