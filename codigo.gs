const prop = PropertiesService.getScriptProperties();
const token = getToken()
const spreadsheetId = 'xxxxxxx';  // Replace with your spreadsheet ID

function getToken() {
  const username = prop.getProperty('USERNAME');
  const accessKey = prop.getProperty('ACCESS_KEY');

  const options = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Partner-Id': 'custom01',
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

// Function to fetch data from a specified endpoint and page number
function getEndPointInfo(endPoint, pageNumber) {
  try {
    const baseUrl = endPoint;
    const url = `${baseUrl}?page=${pageNumber}&page_size=100`;

    // Configuration for the GET request, including authorization header with the token
    const options = {
      'method': 'get',
      'headers': {
        'Content-Type': 'application/json',
        'Partner-Id': 'custom01',
        'Authorization': `Bearer ${token}`
      },
    };

    // Fetch and return the data from the endpoint
    const response = UrlFetchApp.fetch(url, options);
    return JSON.parse(response.toString());
  } catch (e) {
    Logger.log(`Error fetching ${endPoint}:   ${e}`);
    throw new Error(`Failed to fetch ${endPoint}`);
  }
}