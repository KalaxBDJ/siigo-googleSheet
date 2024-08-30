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