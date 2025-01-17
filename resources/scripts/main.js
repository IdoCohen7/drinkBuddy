import { config } from './config.js';


async function getJWTToken(authCode) {
  const clientId = config.CLIENT_ID;  // מזהה האפליקציה
  const clientSecret = config.CLIENT_SECRET;  // ה-CLIENT SECRET
  const tokenUrl = config.TOKEN_URL;
  const redirectUri = config.REDIRECT_URI;

  console.log("Sending token request...");
  console.log("Auth Code:", authCode);

  // הצפנת client_id:client_secret ל-Base64
  const credentials = btoa(`${clientId}:${clientSecret}`);

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: authCode,
    client_id: clientId,  // עדיין מציינים את client_id כאן לצורך התיעוד
    redirect_uri: redirectUri,
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${credentials}`  // הוספת ה-Authorization Header
    },
    body: body.toString(),
  });

  console.log("Token request response status:", response.status);

  if (!response.ok) {
    const errorDetails = await response.text();  // מקבל את פרטי השגיאה מהשרת
    console.error("Token request error details:", errorDetails);
    throw new Error("Failed to get token");
  }

  const data = await response.json();
  console.log("Received JWT Token:", data.id_token);  // הדפסת ה-JWT

  return data.id_token;  // ה-JWT Token
}

function decodeJWT(token) {
  console.log("Decoding JWT Token...");
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );

  const decodedData = JSON.parse(jsonPayload);
  console.log("Decoded JWT Payload:", decodedData);  // הדפסת הפלט המפורק

  return decodedData;
}

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const authCode = urlParams.get('code');

  console.log("Auth Code from URL:", authCode);

  if (authCode) {
    try {
      const jwtToken = await getJWTToken(authCode);  // קבלת ה-JWT
      const userInfo = decodeJWT(jwtToken);  // פענוח הנתונים מה-JWT
      console.log("User Info:", userInfo);  // הדפסת פרטי המשתמש
      alert(`Welcome, ${userInfo.given_name || userInfo.email || "User"}!`);
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  } else {
    console.log("No authorization code in URL.");
  }
});

