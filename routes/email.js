var nodemailer = require('nodemailer');

function createEventEmail(event_id, branch_id, req, res) {
    // Get the event content from the request body
    let title = req.body.title;
    let description = req.body.description;
    let details = req.body.details;
    let date = req.body.date;
    let start_time = req.body.startTime;
    let end_time = req.body.endTime;
    let location = req.body.location;
    let image_url = req.body.image_url;

    let dateArray = date.split('-');
    let reversedArray = dateArray.reverse();
    date = reversedArray.join(' ');

    // REDUCE LIMIT TO AVOID SPAM
    let query = `SELECT email FROM users INNER JOIN user_branch_affiliation ON user_branch_affiliation.user_id = users.user_id WHERE branch_id = ? AND users.email_notifications = TRUE;`;

    req.pool.getConnection(function(err, connection) {
        if (err) {
            // console.log(err);
            res.sendStatus(500);
            return;
        }

        connection.query(query, [branch_id], function(err, rows, fields) {
            connection.release(); // release connection
            if (err) {
                // console.log(err);
                res.sendStatus(500);
                return;
            }

            var receivers = parseReceivers(rows);

            // Interface
            sendMail(
                // from:
                '"Meal Mates Events" <realmealmates@outlook.com>',
                // to:
                receivers,
                // subject
                "New Event: " + title,
                // text (plain text)
                "Description: " + description + "\n" + "Date: " + date + "\n" + "Time: " + start_time + " - " + end_time + "\n" + "Location: " + location + "\n" +  "Details: " + "\n" + details,
                // html
                // can simply make these as templates
                // images: <img style="display: block; margin-left: auto; margin-right: auto;" src="https://communityactioncenter.org/wp-content/uploads/2022/10/CAC-Faribault-Food-Market.jpg" alt="image" width="200">
                `<div style="background-color: lightgrey">
                <br>
                <div style="background-color: crimson; padding: 20px; border-radius: 20px; margin: 10px">
                <b style="color: white"> Event Title: ${title}</b>
                </div>
                <div style="background-color: white; padding: 10px; border-radius: 20px; margin: 10px">
                <b> ${description} </b>
                <p><b>Date: </b> ${date}</p>
                <p><b>Time: </b> ${start_time} - ${end_time}</p>
                <p><b>Location: </b> ${location}</p>
                <p> <b> More details: </b> <a href="http://localhost:8080/events/id/${event_id}"> Event link </p>
                </div>
                <br>
            </div>`
            );
        });
    });
}

function createNewsEmail(news_id, branch_id, req, res) {
    let title = req.body.title;
    let content = req.body.content;
    let date_published = req.body.datePublished;
    let image_url = req.body.image_url;

    let dateArray = date_published.split('-');
    let reversedArray = dateArray.reverse();
    date_published = reversedArray.join(' ');

    // REDUCE LIMIT TO AVOID SPAM
    let query = `SELECT email FROM users INNER JOIN user_branch_affiliation ON user_branch_affiliation.user_id = users.user_id WHERE branch_id = ? AND users.email_notifications = TRUE;`;

    req.pool.getConnection(function(err, connection) {
        if (err) {
            // console.log(err);
            res.sendStatus(500);
            return;
        }

        connection.query(query, [branch_id], function(err, rows, fields) {
            connection.release(); // release connection
            if (err) {
                //console.log(err);
                res.sendStatus(500);
                return;
            }

            var receivers = parseReceivers(rows);

            // Interface
            sendMail(
                // from:
                '"Meal Mates News" <realmealmates@outlook.com>',
                // to:
                receivers,
                // subject
                "New Update: " + title,
                // text (plain text)
                content,
                // html
                // can simply make these as templates
                // images: <img style="display: block; margin-left: auto; margin-right: auto;" src="https://communityactioncenter.org/wp-content/uploads/2022/10/CAC-Faribault-Food-Market.jpg" alt="image" width="200">
                `<div style="background-color: lightgrey">
                <br>
                <div style="background-color: crimson; padding: 20px; border-radius: 20px; margin: 10px">
                <b style="color: white"> News Title: ${title}</b>
                </div>
                <div style="background-color: white; padding: 10px; border-radius: 20px; margin: 10px">
                <p> ${content} </p>
                <p> <b> More details: </b> <a href="http://localhost:8080/news/id/${news_id}"> News link </p>
                </div>
                <br>
            </div>`
            );
        });
    });
}

// Call on JSON of relevant users to get receivers list.
function parseReceivers(rows) {
    // console.log(rows);

    var receivers = "";
    for (let i = 0; i < rows.length; i++) {
        receivers += rows[i].email;
        if (i !== rows.length - 1) {
            receivers += ", ";
        }
    }

    return receivers;
    // console.log(receivers);
}

// --- Email Notification Service ---
const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
        user: "marian.lehner22@ethereal.email",
        pass: String.raw`ARBQpE3ANmf2A4VtnS`,
    },
});

// // Interface
// sendMail(
//     // from:
//     '"Meal Mates Updates" <realmealmates@outlook.com>',
//     // to:
//     "realmealmates@outlook.com, realmealmates@outlook.com",
//     // subject
//     testUpdateDetails.title,
//     // text (plain text)
//     testUpdateDetails.details[0],
//     // html
//     // can simply make these as templates
//     `<div style="background-color: lightgrey">
//     <br>
//     <div style="background-color: crimson; padding: 20px; border-radius: 20px; margin: 10px">
//       <b style="colour: white">${testUpdateDetails.title}</b>
//     </div>
//     <div style="background-color: white; padding: 10px; border-radius: 20px; margin: 10px">
//       <p>${testUpdateDetails.details[0]}</p>
//       <img src="https://communityactioncenter.org/wp-content/uploads/2022/10/CAC-Faribault-Food-Market.jpg" alt="image" width="200">
//     </div>
//     <br>
//   </div>`
// );

function sendMail(sender, receivers, title, plain_text, html_body) {
    var mailOptions = {
        from: sender,
        // Comma separated recipents.
        to: receivers, // list of receivers
        subject: title,
        text: plain_text, // plain text body
        // Not too sure how to incoporate image right now - can just remove.
        html: html_body, // html body
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            // console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

    return;
}

module.exports = {
    createEventEmail,
    createNewsEmail
};