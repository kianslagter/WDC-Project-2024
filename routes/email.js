var express = require('express');
var router = express.Router();

var nodemailer = require('nodemailer');

// Just for testing
// router.get('/test', function(req, res, next) {
//     console.log("querying");
//     let query = "SELECT email FROM users LIMIT 5";

//     req.pool.getConnection(function(err, connection) {
//         if (err) {
//             console.log(err);
//             res.sendStatus(500);
//             return;
//         }

//         connection.query(query, function(err, rows, fields) {
//             connection.release(); // release connection
//             if (err) {
//             console.log(err);
//             res.sendStatus(500);
//             return;
//             }

//             parseReceivers(rows);
//             res.sendStatus(200);
//         });
//     });
//   });

// Call on JSON of relevant users to get receivers list.
function parseReceivers(rows) {
    // console.log(rows);

    var receivers = "";
    for (let i = 0; i < rows.length; i++) {
        receivers += rows[i].email + " ";
    }

    // console.log(receivers);
}

// --- Email Notification Service ---
const transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
        user: "realmealmates@outlook.com",
        pass: String.raw`9l}F1d:E>*x;;\ZfCAb(I"s88`,
    },
});

var testUpdateDetails = {
    id: 3,
    title: 'Welcome Adelaide!',
    description: "Meal Mates opens its Adelaide branch at 129 Waymouth Street, inviting all to join in addressing hunger and building community from 9 am to 5 pm. With nutritious meals and empowerment initiatives, they strive for a hunger-free future in Adelaide.",
    details: [
        "Adelaide, a new dawn has arrived! We are thrilled to inaugurate Meal Mates' Adelaide branch, located at 129 Waymouth Street, and extend a heartfelt welcome to all. Opening our doors from 9 am to 5 pm, we embark on a journey of compassion, solidarity, and nourishment. With a deep-rooted commitment to serving nutritious meals and fostering community connections, we stand ready to make a meaningful impact.",
        "From cooking classes to nutrition workshops, our aim is not just to feed, but to empower. Adelaide, let's write a new chapter together—one where hunger becomes a thing of the past and every individual thrives.",
        "For more details contact adelaide@mealmates.org"
    ],
    date_posted: '3/8/24',
    time_posted: '12.00pm',
    posted_by_branch: 'Adelaide',
    image_url: '/not_an_image.jpg',
};

// Interface
sendMail(
    // from:
    '"Meal Mates Updates" <realmealmates@outlook.com>',
    // to:
    "realmealmates@outlook.com, realmealmates@outlook.com",
    // subject
    testUpdateDetails.title,
    // text (plain text)
    testUpdateDetails.details[0],
    // html
    // can simply make these as templates
    `<div style="background-color: grey">
    <br>
    <div style="background-color: crimson; padding: 20px; border-radius: 20px; margin: 10px">
      <b style="colour: white">${testUpdateDetails.title}</b>
    </div>
    <div style="background-color: white; padding: 10px; border-radius: 20px; margin: 10px">
      <p>${testUpdateDetails.details[0]}</p>
      <img src="https://communityactioncenter.org/wp-content/uploads/2022/10/CAC-Faribault-Food-Market.jpg" alt="image" width="200">
    </div>
    <br>
  </div>`
);

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
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

    return;
}
// --- End ---

module.exports = router;