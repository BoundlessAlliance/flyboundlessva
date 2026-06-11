function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (data.action === "registerUser") {
      return jsonResponse(registerUser(data));
    }

    function getNextPilotId() {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const usersSheet = ss.getSheetByName("Users");
      const users = usersSheet.getDataRange().getValues();

      let highestId = 0;

      for (let i = 1; i < users.length; i++) {
        const currentId = String(users[i][6] || "").trim();

        if (!currentId) continue;

        const numericId = parseInt(currentId, 10);

        if (!isNaN(numericId) && numericId > highestId) {
          highestId = numericId;
        }
      }

      const nextId = highestId + 1;

      return String(nextId).padStart(6, "0");
    }

    if (data.action === "loginUser") {
      return jsonResponse(loginUser(data));
    }

    if (data.action === "verifySession") {
      return jsonResponse(verifySession(data.token));
    }

    if (data.action === "updateProfile") {
      return jsonResponse(updateProfile(data));
    }

    if (data.action === "updatePreferences") {
      return jsonResponse(updatePreferences(data));
    }

    if (data.action === "getPendingPireps") {
      if (!isOperationsUser(data.token)) {
        return jsonResponse({
          success: false,
          message: "Unauthorized"
        });
      }

      return jsonResponse(getPendingPireps());
    }

    if (data.action === "approvePirep") {
      if (!isOperationsUser(data.token)) {
        return jsonResponse({
          success: false,
          message: "Unauthorized"
        });
      }

      return jsonResponse(movePirep(data.pirepId, "approved"));
    }

    if (data.action === "denyPirep") {
      if (!isOperationsUser(data.token)) {
        return jsonResponse({
          success: false,
          message: "Unauthorized"
        });
      }

      return jsonResponse(movePirep(data.pirepId, "denied"));
    }

    return submitPirep(data);

  } catch (error) {
    return jsonResponse({
      success: false,
      message: error.toString()
    });
  }
}

function doGet(e) {
  return jsonResponse({
    success: false,
    message: "Unauthorized"
  });
}

function getPendingPireps() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Pending");
  const rows = sheet.getDataRange().getValues();

  const headers = rows[0];
  const dataRows = rows.slice(1);

  const pireps = dataRows.map(row => {
    return {
      headers: headers,
      values: row,
      pirepId: row[39],
      status: row[40],
      submittedAt: row[41]
    };
  });

  return {
    success: true,
    pireps: pireps
  };
}

function submitPirep(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Pending");
  const pirepId = "BA" + Math.floor(100000 + Math.random() * 900000);

  sheet.appendRow([
    data.airline,
    data.flightNumber,
    data.callsign,
    data.aircraftType,
    data.departureAirport,
    data.arrivalAirport,
    data.departureGate,
    data.arrivalGate,
    data.dateOfFlight,
    data.estimatedFlightTime,
    data.blockTime,
    data.flightTime,
    data.route,
    data.landingRate,
    data.groundSpeed,
    data.gForce,
    data.approachType,
    data.passengers,
    data.ticketPrice,
    data.fuelProvider,
    data.fuelingAmount,
    data.unitPrice,
    data.salesTax,
    data.cateringProvider,
    data.cateringQuantity,
    data.cateringUnitPrice,
    data.cateringVat,
    data.groundProvider,
    data.boardingCost,
    data.pushbackCost,
    data.jetwayCost,
    data.jetwayOperationTime,
    data.jetwayOpsCostPerHour,
    data.groundSalesTax,
    data.flightAnomaly1,
    data.flightAnomaly2,
    data.flightAnomaly3,
    data.flightAnomaly4,
    data.additionalComments,
    pirepId,
    "Pending",
    new Date(),
    "",
    "",
    ""
  ]);

  return jsonResponse({
    success: true,
    pirepId: pirepId
  });
}

function registerUser(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const usersSheet = ss.getSheetByName("Users");

  const username = String(data.username || "").trim();
  const password = String(data.password || "");

  if (!username || !password) {
    return {
      success: false,
      message: "Username and password are required."
    };
  }

  if (username.length < 3) {
    return {
      success: false,
      message: "Username must be at least 3 characters."
    };
  }

  if (password.length < 6) {
    return {
      success: false,
      message: "Password must be at least 6 characters."
    };
  }

  const users = usersSheet.getDataRange().getValues();

  for (let i = 1; i < users.length; i++) {
    if (String(users[i][0]).toLowerCase() === username.toLowerCase()) {
      return {
        success: false,
        message: "That username is already taken."
      };
    }
  }

  const salt = Utilities.getUuid();
  const passwordHash = hashPassword(password, salt);

  const pilotId = getNextPilotId();

  usersSheet.appendRow([
    username,
    passwordHash,
    salt,
    "Pilot",
    "Pending",
    new Date(),
    "",
    "",
    "",
    "Cadet",
    "",
    "",
    "America/Phoenix",
    "Enabled"
  ]);

  const newRow = usersSheet.getLastRow();
  usersSheet.getRange(newRow, 7).setNumberFormat("@");
  usersSheet.getRange(newRow, 7).setValue(pilotId);

  return {
    success: true,
    message: "Account created successfully."
  };
}

function loginUser(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const usersSheet = ss.getSheetByName("Users");
  const sessionsSheet = ss.getSheetByName("Sessions");

  const username = String(data.username || "").trim();
  const password = String(data.password || "");

  if (!username || !password) {
    return {
      success: false,
      message: "Username and password are required."
    };
  }

  const users = usersSheet.getDataRange().getValues();

  for (let i = 1; i < users.length; i++) {
    const savedUsername = String(users[i][0]);
    const savedHash = String(users[i][1]);
    const savedSalt = String(users[i][2]);
    const role = String(users[i][3]);
    const status = String(users[i][4]);

    if (savedUsername.toLowerCase() === username.toLowerCase()) {
      if (status !== "Active") {
        return {
          success: false,
          message: "This account is not active."
        };
      }

      const attemptedHash = hashPassword(password, savedSalt);

      if (attemptedHash !== savedHash) {
        return {
          success: false,
          message: "Incorrect password."
        };
      }

      const token = Utilities.getUuid();

      sessionsSheet.appendRow([
        token,
        savedUsername,
        role,
        new Date()
      ]);

      return {
        success: true,
        message: "Login successful.",
        token: token,
        username: savedUsername,
        role: role
      };
    }
  }

  return {
    success: false,
    message: "Username not found."
  };
}

function verifySession(token) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sessionsSheet = ss.getSheetByName("Sessions");
  const usersSheet = ss.getSheetByName("Users");

  if (!token) {
    return {
      success: false,
      message: "No session token provided."
    };
  }

  const sessions = sessionsSheet.getDataRange().getValues();

  for (let i = sessions.length - 1; i >= 1; i--) {
    if (String(sessions[i][0]) === String(token)) {
      const username = String(sessions[i][1]);

      const users = usersSheet.getDataRange().getValues();

      for (let j = 1; j < users.length; j++) {
        if (String(users[j][0]).toLowerCase() === username.toLowerCase()) {
          return {
            success: true,
            username: users[j][0],
            role: users[j][3],
            status: users[j][4],
            createdAt: formatUserDate(users[j][5]),
            pilotId: users[j][6],
            fullName: users[j][7],
            email: users[j][8],
            rank: users[j][9],
            preferredAircraft: users[j][10],
            homeBase: users[j][11],
            timeZone: users[j][12],
            emailNotifications: users[j][13]
          };
        }
      }

      return {
        success: false,
        message: "User profile not found."
      };
    }
  }

  return {
    success: false,
    message: "Invalid session."
  };
}

function updateProfile(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const usersSheet = ss.getSheetByName("Users");
  const sessionsSheet = ss.getSheetByName("Sessions");

  const token = String(data.token || "").trim();
  const newUsername = String(data.username || "").trim();
  const fullName = String(data.fullName || "").trim();
  const email = String(data.email || "").trim();

  if (!token) {
    return {
      success: false,
      message: "Missing login token."
    };
  }

  if (!newUsername) {
    return {
      success: false,
      message: "Username is required."
    };
  }

  const sessions = sessionsSheet.getDataRange().getValues();
  let currentUsername = "";

  for (let i = sessions.length - 1; i >= 1; i--) {
    if (String(sessions[i][0]) === token) {
      currentUsername = String(sessions[i][1]);
      break;
    }
  }

  if (!currentUsername) {
    return {
      success: false,
      message: "Invalid session."
    };
  }

  const users = usersSheet.getDataRange().getValues();
  let userRow = -1;

  for (let i = 1; i < users.length; i++) {
    const sheetUsername = String(users[i][0]).trim();

    if (
      sheetUsername.toLowerCase() === newUsername.toLowerCase() &&
      sheetUsername.toLowerCase() !== currentUsername.toLowerCase()
    ) {
      return {
        success: false,
        message: "That username is already taken."
      };
    }

    if (sheetUsername.toLowerCase() === currentUsername.toLowerCase()) {
      userRow = i + 1;
    }
  }

  if (userRow === -1) {
    return {
      success: false,
      message: "User not found."
    };
  }

  usersSheet.getRange(userRow, 1).setValue(newUsername);
  usersSheet.getRange(userRow, 8).setValue(fullName);
  usersSheet.getRange(userRow, 9).setValue(email);

  for (let i = 1; i < sessions.length; i++) {
    if (String(sessions[i][1]).toLowerCase() === currentUsername.toLowerCase()) {
      sessionsSheet.getRange(i + 1, 2).setValue(newUsername);
    }
  }

  return {
    success: true,
    message: "Profile updated successfully.",
    username: newUsername,
    fullName: fullName,
    email: email
  };
}

function updatePreferences(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const usersSheet = ss.getSheetByName("Users");
  const sessionsSheet = ss.getSheetByName("Sessions");

  const token = String(data.token || "").trim();
  const homeBase = String(data.homeBase || "").trim().toUpperCase();
  const timeZone = String(data.timeZone || "").trim();
  const emailNotifications = String(data.emailNotifications || "").trim();

  if (!token) {
    return {
      success: false,
      message: "Missing login token."
    };
  }

  if (!/^[A-Z]{4}$/.test(homeBase)) {
    return {
      success: false,
      message: "Home Base must be a 4-letter uppercase ICAO code."
    };
  }

  if (!timeZone) {
    return {
      success: false,
      message: "Please select a time zone."
    };
  }

  if (emailNotifications !== "Yes" && emailNotifications !== "No") {
    return {
      success: false,
      message: "Email notifications must be Yes or No."
    };
  }

  const sessions = sessionsSheet.getDataRange().getValues();
  let username = "";

  for (let i = sessions.length - 1; i >= 1; i--) {
    if (String(sessions[i][0]) === token) {
      username = String(sessions[i][1]);
      break;
    }
  }

  if (!username) {
    return {
      success: false,
      message: "Invalid session."
    };
  }

  const users = usersSheet.getDataRange().getValues();

  for (let i = 1; i < users.length; i++) {
    if (String(users[i][0]).toLowerCase() === username.toLowerCase()) {
      const row = i + 1;

      usersSheet.getRange(row, 12).setValue(homeBase);
      usersSheet.getRange(row, 13).setValue(timeZone);
      usersSheet.getRange(row, 14).setValue(emailNotifications);

      return {
        success: true,
        message: "Preferences updated successfully.",
        homeBase: homeBase,
        timeZone: timeZone,
        emailNotifications: emailNotifications
      };
    }
  }

  return {
    success: false,
    message: "User not found."
  };
}

function hashPassword(password, salt) {
  const rawHash = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    password + salt
  );

  return rawHash
    .map(byte => {
      const value = byte < 0 ? byte + 256 : byte;
      return ("0" + value.toString(16)).slice(-2);
    })
    .join("");
}

function movePirep(pirepId, decision) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const pendingSheet = ss.getSheetByName("Pending");

  const targetSheetName = decision === "approved" ? "Approved" : "Denied";
  const targetSheet = ss.getSheetByName(targetSheetName);

  const data = pendingSheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    const row = data[i];

    if (String(row[39]).trim() === String(pirepId).trim()) {
      row[40] = decision === "approved" ? "Approved" : "Denied";
      row[41] = new Date();

      targetSheet.appendRow(row);
      pendingSheet.deleteRow(i + 1);

      return {
        success: true,
        message: `PIREP moved to ${targetSheetName}`
      };
    }
  }

  return {
    success: false,
    message: "PIREP not found"
  };
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getNextPilotId() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const usersSheet = ss.getSheetByName("Users");
  const users = usersSheet.getDataRange().getValues();

  let highestId = 0;

  for (let i = 1; i < users.length; i++) {
    const currentId = String(users[i][6] || "").trim();

    if (!currentId) continue;

    const numericId = parseInt(currentId, 10);

    if (!isNaN(numericId) && numericId > highestId) {
      highestId = numericId;
    }
  }

  const nextId = highestId + 1;

  return Utilities.formatString("%06d", nextId);
}

function formatUserDate(value) {
  if (!value) return "";

  if (Object.prototype.toString.call(value) === "[object Date]") {
    return Utilities.formatDate(
      value,
      Session.getScriptTimeZone(),
      "MM/dd/yyyy"
    );
  }

  return String(value);
}

function getSession(token) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sessionsSheet = ss.getSheetByName("Sessions");
  const sessions = sessionsSheet.getDataRange().getValues();

  for (let i = sessions.length - 1; i >= 1; i--) {
    if (String(sessions[i][0]) === String(token)) {
      return {
        token: sessions[i][0],
        username: sessions[i][1],
        role: sessions[i][2],
        createdAt: sessions[i][3]
      };
    }
  }

  return null;
}

function getUserByUsername(username) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const usersSheet = ss.getSheetByName("Users");
  const users = usersSheet.getDataRange().getValues();

  for (let i = 1; i < users.length; i++) {
    if (String(users[i][0]).toLowerCase() === String(username).toLowerCase()) {
      return {
        username: users[i][0],
        role: users[i][3],
        status: users[i][4]
      };
    }
  }

  return null;
}

function isOperationsUser(token) {
  const session = getSession(token);

  if (!session) {
    return false;
  }

  const user = getUserByUsername(session.username);

  if (!user) {
    return false;
  }

  if (String(user.status) !== "Active") {
    return false;
  }

  return [
    "CEO",
    "Developer",
    "Operations"
  ].includes(String(user.role));
}
