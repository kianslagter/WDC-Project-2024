var express = require('express');
const path = require('path');
const { send } = require('process');
var fs = require('fs');
var tools = require('./helpers');
var nodemailer = require('nodemailer');

var router = express.Router();

// MISC ROUTES

router.get('/image/:id', function (req, res, next) {
  // Check image exists
  let query = `SELECT CONCAT(BIN_TO_UUID(file_name_rand), file_name_orig) AS file_name, public, branch_id FROM images WHERE image_id=?;`;
  tools.sqlHelper(query, [req.params.id], req).then(function (results) {
    if (results.length === 0) {
      // Image doesn't exists
      res.status(404).send("No image with that id found");
      return;
    }
    if (results[0].public == true) {
      // It's public, so just send the image back
      res.sendFile(path.join(__dirname, '..', 'images', results[0].file_name));
      return;
    } else {
      // Do this
      if (!req.session.isLoggedIn || (!req.session.admin && !req.session.branches.includes(results[0].branch))) {
        res.status(403).send("Not member of correct branch log in to access");
        return;
      } else {
        res.sendFile(path.join(__dirname, '..', 'images', results[0].file_name));
        return;
      }
    }
  }).catch(function (err) { return tools.sendError(res, err); });
});

/* GET home page. */
router.get('/', function (req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});


async function updateSessionVariables(req, res, user_id) {
  return new Promise((resolve, reject) => {
    // Correct username and password
    // log user in
    req.session.isLoggedIn = true;

    req.session.userID = user_id;

    // Should now get other information about the user from the databases
    // (can likely be done in parralel with an array of promises)

    // Make some SQL queries to check:
    // branches they are a member of
    let query = "SELECT branch_id FROM user_branch_affiliation WHERE user_id = UUID_TO_BIN(?);";
    var branches_member = tools.sqlHelper(query, [req.session.userID], req);
    // Branch they manage
    query = "SELECT branch_managed FROM users WHERE user_id = UUID_TO_BIN(?);";
    var branch_managed = tools.sqlHelper(query, [req.session.userID], req);
    // are they a system admin?
    query = "SELECT system_admin FROM users WHERE user_id = UUID_TO_BIN(?);";
    var system_admin = tools.sqlHelper(query, [req.session.userID], req);

    // Wait for the queries to finish
    Promise.all([branches_member, branch_managed, system_admin]).then(function (values) {

      console.log(values);

      // Check branches they are member of
      let members_results = values[0];
      req.session.branches = [];
      for (let i = 0; i < members_results.length; i++) {
        // Add each branch to the session variable branches
        req.session.branches.push(members_results[i].branch_id);
      }

      // Check branch they manage (if any)
      let manage_results = values[1];
      if (manage_results[0].branch_managed === null) {
        req.session.branch_managed = null;
      } else {
        req.session.branch_managed = manage_results[0].branch_managed;
      }

      // Check if they are a system admin
      let admin_results = values[2];
      if (admin_results[0].system_admin == true) {
        req.session.admin = true;
      } else {
        req.session.admin = false;
      }
      console.log("updateSessionVariables(): User logged in");
      return resolve();
    }).catch((err) => { return reject(err); });
  });
}

const { OAuth2Client } = require('google-auth-library');
const { hasBrowserCrypto } = require('google-auth-library/build/src/crypto/crypto');
const client = new OAuth2Client(process.env.GOOGLE_OAUTH_TOKEN);

async function dbRegisterUser(req, res, google_uid, email, first_name, last_name, phone_num, postcode) {
  return new Promise((resolve, reject) => {
    // Prepare SQL query to insert new user into the database
    const query = `INSERT INTO users (google_uid, email, first_name, last_name, phone_num, postcode)
    VALUES (?, ?, ?, ?, ?, ?);`;

    console.log("About to do DB Register Insert query");
    req.pool.query(query, [google_uid, email, first_name, last_name, phone_num, postcode], function (err,results) {

      if (err) {
        reject(err);
      }
      console.log("Completed DB Register Insert query");
      resolve();
    });
  });
};

router.post('/api/login/google', async (req, res) => {
  const token = req.body.credential;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_OAUTH_TOKEN,
    });

    const payload = ticket.getPayload();

    const google_uid = payload['sub'];
    const first_name = payload['given_name'];
    const last_name = payload['family_name'];
    const image_url = payload['picture'];
    const email = payload['email'];

    // Check for matching user in database
    var query = "SELECT BIN_TO_UUID(user_id) AS user_id FROM users WHERE google_uid = ?";
    var queryPromise = tools.sqlHelper(query, [google_uid], req);

    await queryPromise.then(async function (result) {
      // if user does not exist
      if (!result || !result[0]) {
        console.log("User does not exist. Creating new user record");

        // temporary values for testing
        postcode = 5000;
        phone_num = 1234567890;

        console.log('about to register user function');
        var dbRegisterUserPromise = dbRegisterUser(req, res, google_uid, email, first_name, last_name, phone_num, postcode);
        await dbRegisterUserPromise.then(async function (result) {
          var queryPromise = tools.sqlHelper(query, [google_uid], req);
          await queryPromise.then(async function (result) {
            user_id = result[0].user_id;
            console.log("Fetched user ID of newly made user", user_id);
          });
          console.log("done register user function");
        });

      } else {
        console.log("/api/login/google: user exists and user id is", result[0].user_id);
        user_id = result[0].user_id;
      }
    }).catch(function (err) { tools.sendError(res, err); });; // need a catch error here

    console.log("About to update session variables");
    updateSessionVariables(req, res, user_id).then(function () {
      // Session variables updated succesfully
      res.status(200).send("Log in succesful");
    }).catch(function (err) { tools.sendError(res, err); });

  } catch (error) {
    console.error(error);
  }
});

router.post('/api/login', function (req, res, next) {
  // Need to check validity of inputs (NOT DONE YET)

  const { email, password } = req.body

  if (!email || !password) {
    res.status(400).send("Undefined email or password"); // bad request
    return;
  }

  // Check for matching user in database
  var query = "SELECT COUNT(*) AS count FROM users WHERE email=?";
  var queryPromise = tools.sqlHelper(query, [email], req);

  // Wait for query to complete
  queryPromise.then(async function (result) {
    console.log("YO1");
    // Query completed successfully
    if (result[0].count == 0) {
      // Wrong email or password
      res.status(403).send("Wrong email or password");
      return;
    } else {
      console.log("YO2");
      // Get their user id and password hash
      query = "SELECT BIN_TO_UUID(user_id) AS user_id, password_hash FROM users WHERE email=?;";
      queryPromise2 = tools.sqlHelper(query, [email], req)
      
      queryPromise2.then(async function (result) {
        user_id = result[0].user_id;
        hash = result[0].password_hash.toString();
        console.log("YO3");
        result = await checkUser(password, hash)
        if (result == true) {
          // Log them in by updating the appropriate session variables.
          updateSessionVariables(req, res, user_id).then(function () {
            // Session variables updated succesfully
            res.status(200).send("Log in succesful");
            return;

          }).catch(function (err) { tools.sendError(res, err); });
        } else {
          console.log("Wrong password");
          res.status(403).send("Wrong password");
        }

      }).catch((err) => { tools.sendError(res, err); });
    }
  }
  ).catch((err) => { tools.sendError(res, err); });
});


router.get('/api/access', (req, res) => {
  // default visitor access level
  let access_level = 0;
  // check if logged in
  const isLoggedIn = req.session.isLoggedIn;

  // determine access level
  if (isLoggedIn) {
    access_level = 1; // user
    if (req.session.branch_managed) {
      access_level = 2; // branch manager
    }
    if (req.session.admin) {
      access_level = 3; // admin
    }
  }

  // get branches which user is member
  const branches = req.session.branches || [];

  // get branch managed if any
  const manages = req.session.branch_managed || null;

  // response
  const response = {
    access_level: access_level,
    branches: branches,
    manages: manages
  };
  res.json(response);
});

const bcrypt = require('bcrypt');

async function validateAndHashPassword(plainTextPassword) {
  const saltRounds = 10;
  
  // Password validation requirements
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(plainTextPassword);
  const hasLowerCase = /[a-z]/.test(plainTextPassword);
  const hasNumber = /\d/.test(plainTextPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(plainTextPassword);
  
  // Validate password

  // TODO these errors need to be displayed client side not backend
  if (plainTextPassword.length < minLength) {
    throw new Error('Password must be at least 8 characters long.');
  }
  if (!hasUpperCase) {
    throw new Error('Password must contain at least one uppercase letter.');
  }
  if (!hasLowerCase) {
    throw new Error('Password must contain at least one lowercase letter.');
  }
  if (!hasNumber) {
    throw new Error('Password must contain at least one number.');
  }
  if (!hasSpecialChar) {
    throw new Error('Password must contain at least one special character.');
  }
  
  // Hash password
  try {
    const hash = await bcrypt.hash(plainTextPassword, saltRounds);
    return hash;
  } catch (err) {
    throw new Error('Error hashing the password: ' + err.message);
  }
}

async function checkUser(plainTextPassword, hash) {

  //fetch user from db
  console.log("checkUser(): ", plainTextPassword, hash);
  const match = await bcrypt.compare(plainTextPassword, hash);
  if (match) {
    console.log("checkUser(): good password");
    return true;
  } else {
    console.log("checkUser(): bad password");
    return false;
  }
}

router.post('/api/register', async function (req, res, next) {
  const { email, password, first_name, last_name, phone_num, postcode } = req.body;

  // Validate input fields
  if (!email || !password || !first_name || !last_name || !phone_num || !postcode) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  // Check if the email already exists in the database
  const emailExistsQuery = "SELECT COUNT(*) AS count FROM users WHERE email=?";
  var emailExistsQueryPromise = tools.sqlHelper(emailExistsQuery, [email], req);

  emailExistsQueryPromise.then(async function (result) {
      if (result[0].count > 0) {
        return res.status(400).json({ success: false, message: 'Email already registered' });
      } else {

        await validateAndHashPassword(password).then( function(hash) {
          // Prepare SQL query to insert new user into the database
          const query = `INSERT INTO users (email, password_hash, first_name, last_name, phone_num, postcode)
          VALUES (?, ?, ?, ?, ?, ?);`;

          req.pool.query(query, [email, hash, first_name, last_name, phone_num, postcode], function (err,results) {
            if (err) {
              console.error(err);
              return res.status(500).json({ success: false, message: 'Error registering user' });
            }
            // Registration successful
            res.status(200).json({ success: true, message: 'Registration successful' });
          });
        })
        .catch(err => console.error('Error:', err.message));
      }
    }).catch((err) => tools.sendError(res, err));
});

router.get('/api/logout', function (req, res, next) {
  req.session.destroy();
  res.status(200).redirect('/');
});


// EVENTS ROUTES

router.get('/events/search', function (req, res, next) {
  // Get search terms
  let search_term = req.query.search;
  let from_date = req.query.from;
  let to_date = req.query.to;
  let max_num = req.query.n;
  let branches = req.query.branch;

  // Update to default if they weren't set (if there is a sensible default)
  if (from_date === undefined) {
    let today = new Date().toISOString().slice(0, 10);
    from_date = today;
  }
  if (max_num === undefined) {
    max_num = 20;
  } else {
    max_num = parseInt(max_num);
  }

  // Print the values
  /*
  console.log("Search term: " + search_term);
  console.log("from date: " + from_date);
  console.log("To date: " + to_date);
  console.log("Max num: " + max_num);
  console.log("Branches: " + branches);
  */

  // Construct the SQL query
  let query = `SELECT e.event_id AS id, e.event_name AS title, e.event_description AS description,
             DATE_FORMAT(e.start_date_time, '%D %M') AS date,
             DATE_FORMAT(e.start_date_time, '%l:%i %p') AS startTime,
             DATE_FORMAT(e.end_date_time, '%l:%i %p') AS endTime,
             DAYOFWEEK(e.start_date_time) AS dayOfWeek,
             b.branch_name AS location, e.event_image AS image_url, e.branch_id AS branchID
             FROM events e
             JOIN branches b ON e.branch_id = b.branch_id
             WHERE e.is_public = TRUE`;
  // MODIFY QUERY BASED ON FILTERS
  let params = [];
  if (search_term !== undefined) {
    query += " AND (e.event_name LIKE ? OR e.event_description LIKE ?)";
    params.push('%' + search_term + '%', '%' + search_term + '%');
  }
  if (from_date !== undefined) {
    query += " AND e.start_date_time >= ?";
    params.push(from_date);
  }
  if (to_date !== undefined) {
    query += " AND e.start_date_time <= ?";
    params.push(to_date);
  }
  if (branches !== undefined && branches.length > 0) {
    if (Array.isArray(branches)) {
      query += " AND e.branch_id IN (" + branches.map(() => '?').join(',') + ")";
      params = params.concat(branches);
    } else {
      query += " AND e.branch_id = ?";
      params.push(branches);
    }
  }

  query += " ORDER BY e.start_date_time ASC LIMIT ?;";
  params.push(max_num);


  // Query the SQL database
  req.pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    connection.query(query, params, function (err, rows, fields) {
      connection.release(); // release connection
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }
      res.type('json');
      res.send(JSON.stringify(rows));
      return;
    });
  });
});

router.get('/events/get', function (req, res, next) {
  let from_date = new Date().toISOString().slice(0, 10);
  let branches = req.query.branch;
  // Construct the SQL query
  let query = `SELECT e.event_id AS id, e.event_name AS title, e.event_description AS description,
             DATE_FORMAT(e.start_date_time, '%D %M') AS date,
             DATE_FORMAT(e.start_date_time, '%l:%i %p') AS startTime,
             DATE_FORMAT(e.end_date_time, '%l:%i %p') AS endTime,
             DAYOFWEEK(e.start_date_time) AS dayOfWeek,
             b.branch_name AS location, e.event_image AS image_url, e.branch_id AS branchID
             FROM events e
             JOIN branches b ON e.branch_id = b.branch_id
             WHERE e.is_public = TRUE`;
  let params = [];
  if (from_date !== undefined) {
    query += " AND e.start_date_time >= ?";
    params.push(from_date);
  }
  if (branches !== undefined) {
    query += " AND e.branch_id = ?";
    params.push([branches]);
  }
  query += " ORDER BY e.start_date_time ASC LIMIT 10;";
  // Query the SQL database
  req.pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    connection.query(query, params, function (err, rows, fields) {
      connection.release(); // release connection
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }
      res.type('json');
      res.send(JSON.stringify(rows));
      return;
    });
  });
});


router.get('/events/id/:eventID/details.json', function (req, res, next) {
  let event_id = req.params.eventID;
  // Check if the event exists
  let query = "SELECT EXISTS(SELECT * FROM events WHERE event_id = ?) AS event_exists;";
  tools.sqlHelper(query, [event_id], req).then(function (results) {
    if (results[0].event_exists == 0) {
      // Event does not exist
      res.status(404).send("Event not found");
      return;
    }
    // Get the event details
    query = `SELECT e.event_name AS title, e.event_description AS description,
    DATE_FORMAT(e.start_date_time, '%D %M') AS date,
    DATE_FORMAT(e.start_date_time, '%l:%i %p') AS startTime,
    DATE_FORMAT(e.end_date_time, '%l:%i %p') AS endTime,
    b.branch_name AS location, e.event_image AS image_url,
    e.is_public AS public, e.branch_id AS branch, e.event_details AS details
    FROM events e
    JOIN branches b ON e.branch_id = b.branch_id
    WHERE e.event_id = ?`;
    tools.sqlHelper(query, [event_id], req).then(function (results) {
      if (!results[0].public) {
        // Authenticate user
        if (!req.session.isLoggedIn || (!req.session.admin && !req.session.branches.includes(results[0].branch))) {
          // Not logged in or not correct branch
          res.status(403).send("Not a member of correct branch (or not logged in)");
          return;
        }
      }
      // Send the details
      res.json(results[0]);
      return;
    }).catch(function (err) { tools.sendError(res, err); });
  }).catch(function (err) { tools.sendError(res, err); });
});

// for editing events
router.get('/api/get/event/:eventID/details.json', function (req, res, next) {
  const eventID = req.params.eventID;

  // Ensure the user is authenticated
  if (!req.session.isLoggedIn || !req.session.userID) {
    res.status(401).json({ success: false, message: 'User not logged in' });
    return;
  }

  // Query to retrieve event details
  let query = `SELECT events.event_id, events.branch_id, events.event_name,
                  DATE_FORMAT(events.start_date_time, '%Y-%m-%d') AS start_date,
                  DATE_FORMAT(events.start_date_time, '%H:%i') AS start_time,
                  DATE_FORMAT(events.end_date_time, '%Y-%m-%d') AS end_date,
                  DATE_FORMAT(events.end_date_time, '%H:%i') AS end_time,
                  events.event_description, events.event_details, events.event_location,
                  events.event_image, events.is_public,
                  branches.branch_name AS branch
                  FROM events
                  JOIN branches ON events.branch_id = branches.branch_id
                  WHERE events.event_id = ?;`;


  req.pool.query(query, [eventID], function (err, results) {
    if (err) {
      console.log(err);
      res.status(500).json({ success: false, message: 'Error retrieving event information' });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }

    // Send the event details
    res.json(results[0]);
  });
});

// NEWS ROUTES

router.get('/news/id/:articleID/details.json', function (req, res, next) {
  let article_id = req.params.articleID;
  // Check if the article exists
  let query = "SELECT EXISTS(SELECT * FROM news WHERE article_id = ?) AS article_exists;";
  tools.sqlHelper(query, [article_id], req).then(function (results) {
    if (results[0].article_exists == 0) {
      // Article does not exist
      res.status(404).send("Article not found");
      return;
    }
    // Get the article details
    query = `SELECT n.title, n.content, DATE_FORMAT(n.date_published, '%D %M') AS date,
    n.image_url, n.is_public AS public, n.branch_id AS branch,
    b.branch_name AS location
    FROM news n
    JOIN branches b ON n.branch_id = b.branch_id
    WHERE n.article_id = ?;`;

    tools.sqlHelper(query, [article_id], req).then(function (results) {
      if (!results[0].public) {
        // Authenticate user
        if (!req.session.isLoggedIn || (!req.session.admin && !req.session.branches.includes(results[0].branch))) {
          // Not logged in or not correct branch
          res.status(403).send("Not a member of correct branch (or not logged in)");
          return;
        }
      }
      // Send the details
      res.json(results[0]);
      return;
    }).catch(function (err) { tools.sendError(res, err); });
  }).catch(function (err) { tools.sendError(res, err); });
});

router.get('/news/get', function (req, res, next) {
  let to_date = new Date().toISOString().slice(0, 10);
  let branches = req.query.branch;
  // Construct the SQL query
  let query = `SELECT n.article_id AS id, n.title, n.content,
             DATE_FORMAT(n.date_published, '%D %M') AS date,
             n.image_url, b.branch_name AS location, n.is_public AS public, n.branch_id AS branchID
             FROM news n
             JOIN branches b ON n.branch_id = b.branch_id
             WHERE n.is_public = TRUE`;

  let params = [];
  if (to_date !== undefined) {
    query += " AND n.date_published <= ?";
    params.push(to_date);
  }
  if (branches !== undefined) {
    query += " AND n.branch_id = ?";
    params.push([branches]);
  }
  query += " ORDER BY n.date_published DESC LIMIT 10;";
  // Query the SQL database
  req.pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    connection.query(query, params, function (err, rows, fields) {
      connection.release(); // release connection
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }
      res.type('json');
      res.send(JSON.stringify(rows));
      return;
    });
  });
});

router.get('/news/search', function (req, res, next) {
  // Get search terms
  let search_term = req.query.search;
  let from_date = req.query.from;
  let to_date = req.query.to;
  let max_num = req.query.n;
  let branches = req.query.branch;

  // Update to default if they weren't set (if there is a sensible default)
  let today = new Date().toISOString().slice(0, 10);
  if (to_date === undefined) {
    to_date = today;
  }
  if (max_num === undefined) {
    max_num = 20;
  } else {
    max_num = parseInt(max_num);
  }
  // Construct the SQL query
  let query = `SELECT n.article_id AS id, n.title, n.content,
             DATE_FORMAT(n.date_published, '%D %M') AS date,
             n.image_url, b.branch_name AS location, n.branch_id AS branchID
             FROM news n
             JOIN branches b ON n.branch_id = b.branch_id
             WHERE n.is_public = TRUE`;

  // MODIFY QUERY BASED ON FILTERS
  let params = [];
  if (search_term !== undefined) {
    query += " AND (n.title LIKE ? OR n.content LIKE ?)";
    params.push('%' + search_term + '%', '%' + search_term + '%');
  }
  if (to_date !== undefined) {
    query += " AND n.date_published <= ?";
    params.push(to_date);
  }
  if (from_date !== undefined) {
    query += " AND n.date_published >= ?";
    params.push(from_date);
  }

  if (branches !== undefined && branches.length > 0) {
    if (Array.isArray(branches)) {
      query += " AND n.branch_id IN (" + branches.map(() => '?').join(',') + ")";
      params = params.concat(branches);
    } else {
      query += " AND n.branch_id = ?";
      params.push(branches);
    }
  }

  query += " ORDER BY n.date_published DESC LIMIT ?;";
  params.push(max_num);

  // Query the SQL database
  req.pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    connection.query(query, params, function (err, rows, fields) {
      connection.release();
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }
      res.type('json');
      res.send(JSON.stringify(rows));
      return;
    });
  });
});

// for editing news
router.get('/api/get/news/:article_id/details.json', function (req, res, next) {
  const article_id = req.params.article_id;
  // Ensure the user is authenticated
  if (!req.session.isLoggedIn || !req.session.userID) {
    res.status(401).json({ success: false, message: 'User not logged in' });
    return;
  }

  // Query to get news details
  let query = `SELECT news.article_id, news.branch_id, news.title, news.content,
                      DATE_FORMAT(news.date_published, '%Y-%m-%d') AS date_published,
                      news.image_url, news.is_public, branches.branch_name
                      FROM news
                      JOIN branches ON news.branch_id = branches.branch_id
                      WHERE news.article_id = ?;`;

  req.pool.query(query, [article_id], function (err, results) {
    if (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Error retrieving news article' });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ success: false, message: 'News article not found' });
      return;
    }

    // Send the news article details
    res.json(results[0]);
  });
});

// BRANCH ROUTES

router.get('/branch/id/:branchID/details.json', function (req, res, next) {
  let branch_id = req.params.branchID;
  // Check if the branch exists
  let query = "SELECT EXISTS(SELECT * FROM branches WHERE branch_id = ?) AS branch_exists;";
  tools.sqlHelper(query, [branch_id], req).then(function (results) {
    if (results[0].branch_exists == 0) {
      // Branch does not exist
      res.status(404).send("Branch not found");
      return;
    }
    // Get the branch details
    query = `SELECT branch_name AS name, street_number, street_name, city, branch_state, postcode, email, phone, image_url, branch_description AS description
               FROM branches
               WHERE branch_id=?;`;
    tools.sqlHelper(query, [branch_id], req).then(function (results) {
      // Send the details
      res.json(results[0]);
      return;
    }).catch(function (err) { tools.sendError(res, err); });
  }).catch(function (err) { tools.sendError(res, err); });
});

router.get('/branches/get', function (req, res, next) {
  // Construct the SQL query
  let query = `SELECT branch_id AS id, branch_name AS name, street_number, street_name, city, branch_state, postcode, email, phone, image_url, branch_description AS description FROM branches`;

  let params = [];
  // Add any additional filters if needed
  if (req.query.city) {
    query += " WHERE city = ?";
    params.push(req.query.city);
  }

  query += " ORDER BY branch_name ASC LIMIT 10;";

  // Query the SQL database
  req.pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    connection.query(query, params, function (err, rows, fields) {
      connection.release(); // release connection
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }
      res.type('json');
      res.send(JSON.stringify(rows));
      return;
    });
  });
});

router.post('/branches/join/:branchID', function (req, res, next) {
  const branchID = req.params.branchID;
  // user id from session
  const userID = req.session.userID;
  let user_branches = req.session.branches;
  let branchIdInt = parseInt(branchID);

  if (!req.session.isLoggedIn || !userID) {
    res.status(401).json({ success: false, message: 'User not logged in' });
    return;
  }

  // Check if user is already a member of branch
  let query = `SELECT COUNT(*) AS count FROM user_branch_affiliation WHERE user_id = UUID_TO_BIN(?) AND branch_id = ?;`;
  req.pool.query(query, [userID, branchID], function (err, affiliationResults) {
    if (err) {
      console.log(err);
      res.status(500).json({ success: false, message: 'Error checking user affiliation' });
      return;
    }
    if (affiliationResults[0].count > 0) {
      res.status(400).json({ success: false, message: 'User is already a member of the branch' });
      return;
    }
    // Add user to branch
    query = `INSERT INTO user_branch_affiliation (user_id, branch_id) VALUES (UUID_TO_BIN(?), ?);`;
    req.pool.query(query, [userID, branchID], function (err, results) {
      if (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'Error adding user to branch' });
        return;
      }
      req.session.branches.push(branchIdInt);
      res.status(200).json({ success: true, message: 'User successfully joined the branch' });
    });
  });
});

router.get('/branches/events/get', function (req, res, next) {
  let from_date = new Date().toISOString().slice(0, 10);
  let branches = req.query.branch;
  // Construct the SQL query
  let query = `SELECT event_id AS id, event_name AS title, event_description AS description, DATE_FORMAT(start_date_time, '%D %M') AS date, DATE_FORMAT(start_date_time, '%l:%i %p') AS startTime, DATE_FORMAT(end_date_time, '%l:%i %p') AS endTime, DAYOFWEEK(start_date_time) AS dayOfWeek, event_location AS location, event_image AS image_url FROM events WHERE is_public=TRUE`;
  let params = [];
  if (from_date !== undefined) {
    query += " AND start_date_time >= ?";
    params.push(from_date);
  }
  if (branches !== undefined) {
    query += " AND branch_id = ?";
    params.push([branches]);
  }
  query += " ORDER BY start_date_time ASC LIMIT 10;";
  // Query the SQL database
  req.pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    connection.query(query, params, function (err, rows, fields) {
      connection.release(); // release connection
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }
      res.type('json');
      res.send(JSON.stringify(rows));
      return;
    });
  });
});

// PROFILE ROUTES

router.get('/api/get/profile', function (req, res, next) {
  // Ensure the user is authenticated
  if (!req.session.isLoggedIn || !req.session.userID) {
    res.status(401).json({ success: false, message: 'User not logged in' });
    return;
  }

  // Get the user ID from session
  const UserID = req.session.userID;

  // Query to retrieve user details
  let query = `SELECT user_id, email, first_name, last_name, postcode, phone_num, image_url, email_notifications, branch_managed, system_admin
               FROM users
               WHERE user_id = UUID_TO_BIN(?);`;

  req.pool.query(query, [UserID], function (err, results) {
    if (err) {
      console.log(err);
      res.status(500).json({ success: false, message: 'Error retrieving user information' });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Send the user details
    res.json(results[0]);
  });
});

router.post('/api/set/profile', function (req, res, next) {
  if (!req.session.isLoggedIn || !req.session.userID) {
    res.status(401).json({ success: false, message: 'User not logged in' });
    return;
  }

  userID = req.session.userID;

  const { email, first_name, last_name, phone_num, postcode, image_url, email_notifications } = req.body;

  // // Update image_url if a file is uploaded
  // if (req.files && req.files['profile-image']) {
  //   // Assuming 'profile-image' is the name of the file input field
  //   image_url = req.files['profile-image'].name;
  // }

  // Simple validation and sanitization
  // for some reason when one of these fails i can't seem to find this 'message' anywhere in log outputs
  // not in browser console or node console which is very annoying. only the status code.
  if (!email || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    res.status(400).json({ success: false, message: 'Invalid email address' });
    return;
  }
  if (!first_name || typeof first_name !== 'string') {
    res.status(400).json({ success: false, message: 'Invalid first name' });
    return;
  }
  if (!last_name || typeof last_name !== 'string') {
    res.status(400).json({ success: false, message: 'Invalid last name' });
    return;
  }
  if (!phone_num || !/^\+?[0-9 ]*$/.test(phone_num)) {
    res.status(400).json({ success: false, message: 'Invalid phone number' });
    return;
  }
  if (!postcode || typeof postcode !== 'number') {
    res.status(400).json({ success: false, message: 'Invalid postcode' });
    return;
  }

  let query = `UPDATE users
               SET email = ?, first_name = ?, last_name = ?, phone_num = ?, postcode = ?, image_url = ?, email_notifications = ?
               WHERE user_id = UUID_TO_BIN(?)`;

  req.pool.query(query, [email, first_name, last_name, phone_num, postcode, image_url, email_notifications, userID], function (err, results) {
    if (err) {
      console.log(err);
      res.status(500).json({ success: false, message: 'Error updating user information' });
      return;
    }
    res.json({ success: true, message: 'Profile updated successfully' });
  });
});

// PAGE ROUTES
router.get('/events', function (req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'events.html'));
});

router.get('/events/id/:eventId', function (req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'event_details_example.html'));
});

router.get('/news', function (req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'news.html'));
});

router.get('/news/id/:newsId', function (req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'news_details_example.html'));
});

router.get('/branches', function (req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'branches.html'));
});

router.get('/login', function (req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
});

router.get('/profile', function (req, res, next) {
  if (req.session.isLoggedIn) {
    res.sendFile(path.join(__dirname, '..', 'public', 'profile_page.html'));
  } else {
    res.redirect('/login');
  }
});

router.get('/register', function (req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'register.html'));
});

router.get('/branches/id/:branchId', function (req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'branch_details.html'));
});

router.get('/branches', function (req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'branches.html'));
});

router.get('/private_policy', function (req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'private_policy.html'));
});

module.exports = router;
