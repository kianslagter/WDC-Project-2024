USE volunteer_management_system;

-- BRANCHES
INSERT INTO branches
    (branch_name, street_number, street_name, city, branch_state, postcode, email, phone, image_url, branch_description)
VALUES
    ("Adelaide", 129, "Waymouth Street", "Adelaide", "SA", 5000, "adelaidebranch@mealmates.com", "0412345678", "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/11_Gloddaeth_Street%2C_Llandudno_shop_front.jpg/320px-11_Gloddaeth_Street%2C_Llandudno_shop_front.jpg", "The Adelaide branch of Meal Mates is located in the heart of the city. This branch has been serving the community for over a decade, providing nutritious meals to those in need. With a dedicated team of volunteers, they work tirelessly to prepare and distribute food. They also collaborate with local farms and businesses to source fresh ingredients, ensuring that every meal is not only filling but also healthy"),
    ("Sydney", 212, "York Street", "Sydney", "NSW", 2000, "sydneybranch@mealmates.com", "0412345678", "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/11_Gloddaeth_Street%2C_Llandudno_shop_front.jpg/320px-11_Gloddaeth_Street%2C_Llandudno_shop_front.jpg", "Situated in the bustling city of Sydney, the Meal Mates branch here is known for its large-scale operations. They have a vast network of volunteers who collect surplus food from restaurants, supermarkets, and households, and distribute it to people in need. This branch has made a significant impact in reducing food waste in the city while ensuring that no one goes hungry."),
    ("Melbourne", 73, "Lonsdale Street", "Melbourne", "VIC", 3000, "melbournebranch@mealmates.com", "0412345678", "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/11_Gloddaeth_Street%2C_Llandudno_shop_front.jpg/320px-11_Gloddaeth_Street%2C_Llandudno_shop_front.jpg", "The Melbourne branch of Meal Mates is renowned for its innovative approach to tackling food insecurity. They run community kitchens where people in need are invited to share a meal, fostering a sense of community and belonging. This branch not only provides food relief but also organizes cooking classes and nutrition workshops, empowering individuals to make healthy food choices.");

-- USERS
INSERT INTO users
    (username, email, password_hash, postcode, first_name, last_name, phone_num, system_admin)
VALUES
    ("admin", "admin@mealmates.com", "adminPWD", 5000, "System", "Admin", "0401111222", TRUE),
    ("hthompson", "hthompson@gmail.com", "P@ssw0rd1", 2000, "Hannah", "Thompson", "0401 234 567", FALSE),
    ("mmartin", "mmartin@outlook.com", "S3cur3P@ss", 3000, "Michael", "Martin", "0402 345 678", FALSE),
    ("jdoe", "jdoe@gmail.com", "An0th3rP@ss", 4000, "John", "Doe", "0403 456 789", FALSE),
    ("asmith", "asmith@gmail.com", "Yet@noth3r", 5000, "Alice", "Smith", "0404 567 890", FALSE),
    ("bjones", "bjones@gmail.com", "Last1P@ss", 6000, "Bob", "Jones", "0405 678 901", FALSE),
    ("ljohnson", "ljohnson@gmail.com", "S3cur3Pwd!", 7000, "Laura", "Johnson", "0406 789 012", FALSE),
    ("dlee", "davidlee@gmail.com", "MyP@ssw0rd2", 8000, "David", "Lee", "0407 890 123", FALSE),
    ("jwilson", "jwilson@gmail.com", "P@ssW0rd3!", 9000, "Julia", "Wilson", "0408 901 234", FALSE),
    ("kwhite", "kwhite@gmail.com", "4n0th3rPass", 1001, "Kevin", "White", "0409 012 345", FALSE),
    ("hmorris", "hmorris@gmail.com", "S@fePwd123", 2001, "Holly", "Morris", "0410 123 456", FALSE),
    ("ajames", "ajames@gmail.com", "StrongP@ss!", 3001, "Alex", "James", "0411 234 567", FALSE),
    ("bking", "bking@gmail.com", "P@ssw0rd4", 4001, "Brandon", "King", "0412 345 678", FALSE),
    ("kturner", "kturner@gmail.com", "S3curePwd5", 5001, "Karen", "Turner", "0413 456 789", FALSE),
    ("cclark", "cclark@outlook.com", "MyS3cur3Pwd", 6001, "Chris", "Clark", "0414 567 890", FALSE),
    ("rmitchell", "rmitchell@outlook.com", "An0th3r1!", 7001, "Rachel", "Mitchell", "0415 678 901", FALSE),
    ("plewis", "plewis@hotmail.com", "Y3tAn0th3r", 8001, "Peter", "Lewis", "0416 789 012", FALSE),
    ("staylor", "staylor@hotmail.com", "L@stOne123", 9001, "Samantha", "Taylor", "0417 890 123", FALSE),
    ("jyoung", "jyoung@outlook.com", "P@ssWord!", 1002, "Jack", "Young", "0418 901 234", FALSE),
    ("tmorris", "tmorris@gmail.com", "NewP@ss123", 2002, "Tom", "Morris", "0419 012 345", FALSE),
    ("wmoore", "wmoore@gmail.com", "S3cur3It!", 3002, "Wendy", "Moore", "0420 123 456", FALSE),
    ("clong", "clong@gmail.com", "P@ssw0rd5", 4002, "Charlotte", "Long", "0421 234 567", FALSE),
    ("dlee2", "dlee2@outlook.com", "PassWord!2", 5002, "Danielle", "Lee", "0422 345 678", FALSE),
    ("aharris", "aharris@gmail.com", "P@ssw0rd6", 6002, "Aaron", "Harris", "0423 456 789", FALSE),
    ("kcollins", "kcollins@outlook.com", "MyNewP@ss", 7002, "Katherine", "Collins", "0424 567 890", FALSE),
    ("rthompson", "rthompson@icloud.com", "P@ssw0rd7", 8002, "Ryan", "Thompson", "0425 678 901", FALSE),
    ("ephillips", "ephillips@outlook.com.au", "S3cur3New!", 9002, "Emily", "Phillips", "0426 789 012", FALSE),
    ("lmurphy", "lmurphy@outlook.com", "S@f3Pwd!", 1003, "Laura", "Murphy", "0427 890 123", FALSE),
    ("jward", "jward@gmail.com", "L@stOne12", 2003, "James", "Ward", "0428 901 234", FALSE),
    ("ehall", "ehall@gmail.com", "N3wP@ssw0rd", 3003, "Evelyn", "Hall", "0429 012 345", FALSE),
    ("rking", "rking@outlook.com.au", "P@ss1234", 4003, "Rebecca", "King", "0430 123 456", FALSE);

-- Add a few managers
UPDATE users
    SET branch_managed = 2
    WHERE username="hthompson";
UPDATE users
    SET branch_managed = 3
    WHERE username="mmartin";
UPDATE users
    SET branch_managed = 1
    WHERE username="asmith";

-- Add USERS to BRANCHES
INSERT INTO user_branch_affiliation
    (user_id, branch_id)
VALUES
    ((SELECT user_id FROM users WHERE username="admin"), (SELECT branch_id FROM branches WHERE branch_name="Adelaide")),
    ((SELECT user_id FROM users WHERE username="hthompson"), (SELECT branch_id FROM branches WHERE branch_name="Sydney")),
    ((SELECT user_id FROM users WHERE username="mmartin"), (SELECT branch_id FROM branches WHERE branch_name="Melbourne")),
    ((SELECT user_id FROM users WHERE username="jdoe"), (SELECT branch_id FROM branches WHERE branch_name="Sydney")),
    ((SELECT user_id FROM users WHERE username="asmith"), (SELECT branch_id FROM branches WHERE branch_name="Adelaide")),
    ((SELECT user_id FROM users WHERE username="bjones"), (SELECT branch_id FROM branches WHERE branch_name="Melbourne")),
    ((SELECT user_id FROM users WHERE username="ljohnson"), (SELECT branch_id FROM branches WHERE branch_name="Adelaide")),
    ((SELECT user_id FROM users WHERE username="dlee"), (SELECT branch_id FROM branches WHERE branch_name="Sydney")),
    ((SELECT user_id FROM users WHERE username="jwilson"), (SELECT branch_id FROM branches WHERE branch_name="Sydney")),
    ((SELECT user_id FROM users WHERE username="kwhite"), (SELECT branch_id FROM branches WHERE branch_name="Melbourne")),
    ((SELECT user_id FROM users WHERE username="hmorris"), (SELECT branch_id FROM branches WHERE branch_name="Adelaide")),
    ((SELECT user_id FROM users WHERE username="ajames"), (SELECT branch_id FROM branches WHERE branch_name="Melbourne")),
    ((SELECT user_id FROM users WHERE username="bking"), (SELECT branch_id FROM branches WHERE branch_name="Sydney")),
    ((SELECT user_id FROM users WHERE username="kturner"), (SELECT branch_id FROM branches WHERE branch_name="Adelaide")),
    ((SELECT user_id FROM users WHERE username="cclark"), (SELECT branch_id FROM branches WHERE branch_name="Melbourne")),
    ((SELECT user_id FROM users WHERE username="rmitchell"), (SELECT branch_id FROM branches WHERE branch_name="Adelaide")),
    ((SELECT user_id FROM users WHERE username="plewis"), (SELECT branch_id FROM branches WHERE branch_name="Sydney")),
    ((SELECT user_id FROM users WHERE username="staylor"), (SELECT branch_id FROM branches WHERE branch_name="Melbourne")),
    ((SELECT user_id FROM users WHERE username="jyoung"), (SELECT branch_id FROM branches WHERE branch_name="Sydney")),
    ((SELECT user_id FROM users WHERE username="tmorris"), (SELECT branch_id FROM branches WHERE branch_name="Adelaide")),
    ((SELECT user_id FROM users WHERE username="wmoore"), (SELECT branch_id FROM branches WHERE branch_name="Melbourne")),
    ((SELECT user_id FROM users WHERE username="clong"), (SELECT branch_id FROM branches WHERE branch_name="Sydney")),
    ((SELECT user_id FROM users WHERE username="dlee2"), (SELECT branch_id FROM branches WHERE branch_name="Sydney")),
    ((SELECT user_id FROM users WHERE username="aharris"), (SELECT branch_id FROM branches WHERE branch_name="Adelaide")),
    ((SELECT user_id FROM users WHERE username="kcollins"), (SELECT branch_id FROM branches WHERE branch_name="Melbourne")),
    ((SELECT user_id FROM users WHERE username="rthompson"), (SELECT branch_id FROM branches WHERE branch_name="Sydney")),
    ((SELECT user_id FROM users WHERE username="ephillips"), (SELECT branch_id FROM branches WHERE branch_name="Melbourne")),
    ((SELECT user_id FROM users WHERE username="lmurphy"), (SELECT branch_id FROM branches WHERE branch_name="Adelaide")),
    ((SELECT user_id FROM users WHERE username="jward"), (SELECT branch_id FROM branches WHERE branch_name="Sydney")),
    ((SELECT user_id FROM users WHERE username="ehall"), (SELECT branch_id FROM branches WHERE branch_name="Melbourne")),
    ((SELECT user_id FROM users WHERE username="rking"), (SELECT branch_id FROM branches WHERE branch_name="Adelaide"));



-- EVENTS
INSERT INTO events
    (branch_id, event_name, start_date_time, end_date_time, event_description, is_public)
VALUES
    ( (SELECT branch_id FROM branches WHERE branch_name="Adelaide"), "My test event", "2024-06-29 13:00:00", "2024-06-29 15:00:00", "The event description, which should be longer probably", FALSE),
    ( (SELECT branch_id FROM branches WHERE branch_name="Sydney"), "Meal Mates Community Picnic for Meal Mates", "2024-01-30 16:12:22", "2024-01-30 20:12:22", "Velit scelerisque in dictum non consectetur a. Ullamcorper a lacus vestibulum sed arcu non odio. Eget velit aliquet sagittis id consectetur purus ut faucibus. Aliquam ut porttitor leo a diam sollicitudin. Porttitor rhoncus dolor purus non enim praesent elementum. Sit amet massa vitae tortor condimentum lacinia quis. Pellentesque habitant morbi tristique senectus et netus et malesuada fames. Feugiat pretium nibh ipsum consequat nisl. Est placerat in egestas erat. Id diam vel quam elementum pulvinar. Vitae auctor eu augue ut lectus arcu bibendum at. Lectus magna fringilla urna porttitor rhoncus dolor purus non.", FALSE ),
    ( (SELECT branch_id FROM branches WHERE branch_name="Adelaide"), "Meal Mates Volunteer Recruitment Fair for Meal Mates", "2024-06-26 10:38:44", "2024-06-26 15:38:44", "In fermentum et sollicitudin ac orci phasellus egestas tellus rutrum. At consectetur lorem donec massa sapien faucibus et molestie. Eget magna fermentum iaculis eu non diam. Feugiat vivamus at augue eget arcu. Semper eget duis at tellus at urna. Augue eget arcu dictum varius duis at. Ac feugiat sed lectus vestibulum mattis. Viverra justo nec ultrices dui sapien eget. Duis at consectetur lorem donec massa sapien faucibus. Tellus integer feugiat scelerisque varius. Mi ipsum faucibus vitae aliquet nec ullamcorper sit amet risus. Feugiat in fermentum posuere urna nec tincidunt praesent semper. Ipsum nunc aliquet bibendum enim facilisis gravida neque convallis. Etiam non quam lacus suspendisse faucibus. Eget mauris pharetra et ultrices neque ornare aenean euismod elementum. Euismod in pellentesque massa placerat duis. Sem et tortor consequat id porta nibh venenatis cras sed. Amet facilisis magna etiam tempor orci. Aliquam etiam erat velit scelerisque in dictum non consectetur a. Non sodales neque sodales ut etiam sit amet.", FALSE ),
    ( (SELECT branch_id FROM branches WHERE branch_name="Melbourne"), "Meal Mates Community BBQ for Meal Mates", "2024-08-14 12:10:18", "2024-08-14 16:10:18", "Facilisis mauris sit amet massa vitae tortor condimentum lacinia quis. Vel pretium lectus quam id leo in. Scelerisque in dictum non consectetur a erat nam at lectus. Dictum at tempor commodo ullamcorper. Etiam dignissim diam quis enim lobortis scelerisque fermentum dui faucibus. Quam viverra orci sagittis eu volutpat odio. Vivamus arcu felis bibendum ut tristique et egestas quis ipsum. Nibh venenatis cras sed felis eget velit. Mattis pellentesque id nibh tortor id aliquet. Ac tortor dignissim convallis aenean et tortor at risus viverra. Dictum varius duis at consectetur lorem donec massa sapien faucibus. Ultrices gravida dictum fusce ut placerat orci nulla.", TRUE ),
    ( (SELECT branch_id FROM branches WHERE branch_name="Sydney"), "Meal Mates Volunteer Training Session for Meal Mates", "2024-04-12 10:55:47", "2024-04-12 13:55:47", "Et tortor consequat id porta nibh venenatis cras sed felis. Vestibulum lectus mauris ultrices eros in cursus turpis massa. Ipsum nunc aliquet bibendum enim facilisis gravida neque convallis. Feugiat in ante metus dictum at tempor commodo. At imperdiet dui accumsan sit amet nulla facilisi morbi tempus. Pharetra massa massa ultricies mi quis hendrerit dolor magna eget. Et molestie ac feugiat sed lectus vestibulum mattis ullamcorper velit. Pulvinar pellentesque habitant morbi tristique senectus et netus et malesuada. Suspendisse potenti nullam ac tortor vitae purus faucibus ornare suspendisse. Aenean sed adipiscing diam donec adipiscing tristique risus nec. Ultricies mi quis hendrerit dolor magna eget est lorem. Volutpat commodo sed egestas egestas fringilla phasellus faucibus scelerisque. Aliquam sem et tortor consequat id porta nibh venenatis cras. Leo integer malesuada nunc vel risus commodo viverra. Pellentesque nec nam aliquam sem et tortor. Elit ullamcorper dignissim cras tincidunt lobortis feugiat vivamus at.", FALSE ),
    ( (SELECT branch_id FROM branches WHERE branch_name="Adelaide"), "Meal Mates Mobile Soup Kitchen for Meal Mates", "2024-10-07 08:08:14", "2024-10-07 12:08:14", "Morbi tincidunt ornare massa eget egestas purus viverra accumsan. Tincidunt tortor aliquam nulla facilisi cras fermentum odio eu. Morbi enim nunc faucibus a pellentesque sit amet porttitor. Aliquet sagittis id consectetur purus ut faucibus pulvinar elementum. Quam pellentesque nec nam aliquam sem et tortor consequat id. Nullam non nisi est sit amet. Varius sit amet mattis vulputate enim. Nunc sed velit dignissim sodales ut. Amet nisl purus in mollis nunc sed id. Egestas integer eget aliquet nibh praesent tristique magna sit. Eget sit amet tellus cras adipiscing enim. Pretium quam vulputate dignissim suspendisse in est ante in nibh. Et malesuada fames ac turpis egestas integer eget aliquet nibh. Risus quis varius quam quisque id. Sed risus pretium quam vulputate dignissim suspendisse in. Diam ut venenatis tellus in metus vulputate. Sollicitudin tempor id eu nisl nunc. Aliquam id diam maecenas ultricies mi. Tempus urna et pharetra pharetra massa massa ultricies mi. Eu consequat ac felis donec et odio pellentesque diam volutpat. Purus ut faucibus pulvin.", TRUE ),
    ( (SELECT branch_id FROM branches WHERE branch_name="Melbourne"), "Meal Mates Community Garden Planting Day", "2024-09-15 09:00:00", "2024-09-15 13:00:00", "Join us for a day of planting and caring for our community garden. No experience necessary, just bring your enthusiasm!", TRUE ),
    ( (SELECT branch_id FROM branches WHERE branch_name="Sydney"), "Meal Mates Youth Mentorship Program", "2024-10-10 14:00:00", "2024-10-10 17:00:00", "Become a mentor and make a difference in the lives of young people in our community. Training provided!", FALSE ),
    ( (SELECT branch_id FROM branches WHERE branch_name="Adelaide"), "Meal Mates Monthly Bingo Night", "2024-11-20 18:30:00", "2024-11-20 20:30:00", "Join us for a fun-filled evening of bingo, prizes, and snacks. Open to all ages!", TRUE ),
    ( (SELECT branch_id FROM branches WHERE branch_name="Melbourne"), "Meal Mates Community Cleanup", "2024-12-05 10:00:00", "2024-12-05 12:00:00", "Help us keep our neighborhood clean and beautiful by participating in our community cleanup event. Gloves and trash bags provided.", TRUE ),
    ( (SELECT branch_id FROM branches WHERE branch_name="Sydney"), "Meal Mates Fundraising Gala Dinner", "2024-11-30 19:00:00", "2024-11-30 22:00:00", "Join us for an elegant evening of dinner, dancing, and fundraising to support our mission of ending hunger in our community.", FALSE ),
    ( (SELECT branch_id FROM branches WHERE branch_name="Adelaide"), "Meal Mates Family Cooking Class", "2024-10-25 11:00:00", "2024-10-25 14:00:00", "Bring the whole family and learn how to cook nutritious and delicious meals together. Fun for all ages!", TRUE ),
    ( (SELECT branch_id FROM branches WHERE branch_name="Melbourne"), "Meal Mates Movie Night Under the Stars", "2024-11-08 19:30:00", "2024-11-08 22:30:00", "Grab your blankets and popcorn and join us for an outdoor movie night featuring family-friendly films.", FALSE ),
    ( (SELECT branch_id FROM branches WHERE branch_name="Sydney"), "Meal Mates Community Health Fair", "2024-12-15 10:00:00", "2024-12-15 14:00:00", "Get free health screenings, learn about healthy living, and connect with local health resources at our community health fair.", TRUE ),
    ( (SELECT branch_id FROM branches WHERE branch_name="Adelaide"), "Meal Mates Dog Walking Group", "2024-11-05 08:00:00", "2024-11-05 10:00:00", "Bring your furry friends and join us for a morning walk in the park. Socialize with other dog lovers while getting some exercise!", TRUE ),
    ( (SELECT branch_id FROM branches WHERE branch_name="Melbourne"), "Meal Mates Charity Auction", "2024-12-20 18:00:00", "2024-12-20 21:00:00", "Bid on a variety of items and experiences donated by local businesses and individuals. All proceeds support Meal Mates programs.", FALSE ),
    ( (SELECT branch_id FROM branches WHERE branch_name="Sydney"), "Meal Mates Holiday Gift Wrapping Event", "2024-12-10 12:00:00", "2024-12-10 16:00:00", "Volunteer to wrap holiday gifts for a good cause! All supplies provided, just bring your festive spirit.", TRUE ),
    ( (SELECT branch_id FROM branches WHERE branch_name="Adelaide"), "Meal Mates Community Book Club", "2024-11-12 19:00:00", "2024-11-12 21:00:00", "Join us for lively discussions about our latest book selection. All are welcome, and refreshments will be served.", FALSE ),
    ( (SELECT branch_id FROM branches WHERE branch_name="Melbourne"), "Meal Mates Kids' Art Workshop", "2024-12-15 14:00:00", "2024-12-15 16:00:00", "Let your creativity soar at our kids' art workshop! Supplies provided, and kids can take home their masterpieces.", TRUE ),
    ( (SELECT branch_id FROM branches WHERE branch_name="Sydney"), "Meal Mates Community Talent Show", "2024-11-22 18:00:00", "2024-11-22 21:00:00", "Showcase your talents or simply come to enjoy the show! Singing, dancing, comedy, and more.", FALSE ),
    ( (SELECT branch_id FROM branches WHERE branch_name="Adelaide"), "Meal Mates Senior Social Hour", "2024-12-02 10:30:00", "2024-12-02 12:30:00", "Seniors are invited to socialize, enjoy light refreshments, and participate in activities designed for older adults.", TRUE ),
    ( (SELECT branch_id FROM branches WHERE branch_name="Melbourne"), "Meal Mates Community Sports Day", "2024-11-16 09:00:00", "2024-11-16 13:00:00", "Join us for friendly competition and fun outdoor activities for all ages. Bring your A-game and your sportsmanship!", FALSE ),
    ( (SELECT branch_id FROM branches WHERE branch_name="Sydney"), "Meal Mates Community Potluck", "2024-12-08 17:00:00", "2024-12-08 19:00:00", "Bring a dish to share and enjoy a delicious meal with friends and neighbors at our community potluck dinner.", TRUE ),
    ( (SELECT branch_id FROM branches WHERE branch_name="Adelaide"), "Meal Mates Teen Volunteer Day", "2024-11-18 13:00:00", "2024-11-18 16:00:00", "Teens can earn volunteer hours while making a difference in the community. Activities include gardening, cleaning, and more!", FALSE ),
    ( (SELECT branch_id FROM branches WHERE branch_name="Melbourne"), "Meal Mates Yoga in the Park", "2024-11-30 08:30:00", "2024-11-30 10:30:00", "Start your day with a refreshing yoga session in the park. All levels welcome, just bring a mat and water bottle.", TRUE ),
    ( (SELECT branch_id FROM branches WHERE branch_name="Sydney"), "Meal Mates Community Movie Marathon", "2024-12-14 12:00:00", "2024-12-14 20:00:00", "Join us for a day of movie-watching fun! We'll be screening a variety of films for all ages.", FALSE );

-- Add USER responses to events
INSERT INTO user_event_attendance
    (event_id, user_id, rsvp)
VALUES
    ( (SELECT event_id FROM events WHERE event_name="My test event"), (SELECT user_id FROM users WHERE username="kwhite"), TRUE),
    ( (SELECT event_id FROM events WHERE event_name="Meal Mates Community Picnic for Meal Mates"), (SELECT user_id FROM users WHERE username="jyoung"), FALSE),
    ( (SELECT event_id FROM events WHERE event_name="Meal Mates Volunteer Recruitment Fair for Meal Mates"), (SELECT user_id FROM users WHERE username="ephillips"), FALSE),
    ( (SELECT event_id FROM events WHERE event_name="Meal Mates Community BBQ for Meal Mates"), (SELECT user_id FROM users WHERE username="lmurphy"), TRUE),
    ( (SELECT event_id FROM events WHERE event_name="Meal Mates Volunteer Training Session for Meal Mates"), (SELECT user_id FROM users WHERE username="bking"), FALSE),
    ( (SELECT event_id FROM events WHERE event_name="Meal Mates Mobile Soup Kitchen for Meal Mates"), (SELECT user_id FROM users WHERE username="ajames"), TRUE),
    ( (SELECT event_id FROM events WHERE event_name="My test event"), (SELECT user_id FROM users WHERE username="hthompson"), FALSE),
    ( (SELECT event_id FROM events WHERE event_name="Meal Mates Community Picnic for Meal Mates"), (SELECT user_id FROM users WHERE username="dlee2"), TRUE),
    ( (SELECT event_id FROM events WHERE event_name="Meal Mates Volunteer Recruitment Fair for Meal Mates"), (SELECT user_id FROM users WHERE username="jyoung"), FALSE),
    ( (SELECT event_id FROM events WHERE event_name="Meal Mates Community BBQ for Meal Mates"), (SELECT user_id FROM users WHERE username="jyoung"), TRUE),
    ( (SELECT event_id FROM events WHERE event_name="Meal Mates Volunteer Training Session for Meal Mates"), (SELECT user_id FROM users WHERE username="lmurphy"), FALSE);


-- NEWS
INSERT INTO news
    (branch_id, title, content, is_public)
VALUES
    ( (SELECT branch_id FROM branches WHERE branch_name="Melbourne"), "Volunteers Rally to Support Local Community", "In a heartwarming display of solidarity, volunteers in Melbourne came together to support their local community. From organizing food drives to offering companionship to the elderly, these dedicated individuals are making a difference.", TRUE),
    ( (SELECT branch_id FROM branches WHERE branch_name="Adelaide"), "New Initiative Aims to Combat Food Insecurity", "An innovative new initiative has been launched in Adelaide to combat food insecurity in the community. By partnering with local farmers and businesses, organizers hope to ensure that no one goes hungry.", FALSE),
    ( (SELECT branch_id FROM branches WHERE branch_name="Sydney"), "Community Art Project Brightens Neighborhood", "A vibrant new art project is bringing color and creativity to the streets of Sydney. From murals to installations, local artists are transforming public spaces and sparking conversation.", TRUE),
    ( (SELECT branch_id FROM branches WHERE branch_name="Melbourne"), "Local Hero Recognized for Volunteer Efforts", "A dedicated volunteer in Melbourne has been recognized for their tireless efforts to give back to the community. Their selfless contributions have touched the lives of many and inspired others to get involved.", FALSE),
    ( (SELECT branch_id FROM branches WHERE branch_name="Adelaide"), "Youth Leadership Program Empowers Next Generation", "A dynamic youth leadership program in Adelaide is empowering the next generation of leaders. Through mentorship and skill-building activities, participants are gaining the confidence and tools to create positive change.", TRUE),
    ( (SELECT branch_id FROM branches WHERE branch_name="Sydney"), "New Podcast Highlights Stories of Resilience", "A compelling new podcast is sharing stories of resilience and hope from the Sydney community. From overcoming adversity to finding strength in difficult times, these inspiring tales are a testament to the human spirit.", FALSE),
    ( (SELECT branch_id FROM branches WHERE branch_name="Melbourne"), "Local Organization Launches Green Initiative", "A local organization in Melbourne is taking steps to reduce its environmental footprint with a new green initiative. From recycling programs to energy-efficient practices, they're committed to sustainability.", TRUE),
    ( (SELECT branch_id FROM branches WHERE branch_name="Adelaide"), "Community Outreach Program Expands Services", "A beloved community outreach program in Adelaide is expanding its services to reach even more individuals in need. From food assistance to job training, they're making a positive impact on the lives of many.", FALSE),
    ( (SELECT branch_id FROM branches WHERE branch_name="Sydney"), "Innovative Technology Boosts Community Engagement", "Innovative technology is revolutionizing community engagement in Sydney. From virtual town halls to interactive maps, residents are finding new ways to connect and participate.", TRUE),
    ( (SELECT branch_id FROM branches WHERE branch_name="Melbourne"), "Youth Mental Health Initiative Raises Awareness", "A youth mental health initiative in Melbourne is raising awareness and reducing stigma around mental health issues. Through workshops and events, they're fostering open conversations and providing support to young people.", FALSE),
    ( (SELECT branch_id FROM branches WHERE branch_name="Adelaide"), "Local Artist Collaboration Sparks Creativity", "A collaborative art project in Adelaide is sparking creativity and community spirit. From street murals to public installations, local artists are coming together to beautify their neighborhood.", TRUE),
    ( (SELECT branch_id FROM branches WHERE branch_name="Sydney"), "Community Garden Flourishes with Volunteer Help", "A community garden in Sydney is flourishing thanks to the dedication of volunteers. From planting to harvesting, these green-thumbed enthusiasts are reaping the rewards of their hard work.", FALSE),
    ( (SELECT branch_id FROM branches WHERE branch_name="Melbourne"), "Cultural Exchange Program Celebrates Diversity", "A cultural exchange program in Melbourne is celebrating diversity and promoting cross-cultural understanding. Through events and activities, participants are building connections and bridging divides.", TRUE),
    ( (SELECT branch_id FROM branches WHERE branch_name="Adelaide"), "Local Charity Receives Grant for Outreach Efforts", "A local charity in Adelaide has received a grant to support its outreach efforts in the community. With this funding, they'll be able to expand their programs and reach more individuals in need.", FALSE),
    ( (SELECT branch_id FROM branches WHERE branch_name="Sydney"), "Youth Volunteer Corps Makes Positive Impact", "A youth volunteer corps in Sydney is making a positive impact on the community. From environmental cleanups to youth mentorship programs, these young volunteers are leading by example.", TRUE),
    ( (SELECT branch_id FROM branches WHERE branch_name="Melbourne"), "Community Cookbook Raises Funds for Charity", "A community cookbook in Melbourne is raising funds for charity while celebrating local cuisine. From family recipes to culinary creations, it's a delicious way to support a good cause.", FALSE),
    ( (SELECT branch_id FROM branches WHERE branch_name="Adelaide"), "Local School Recognized for Environmental Initiatives", "A local school in Adelaide has been recognized for its environmental initiatives and commitment to sustainability. From recycling programs to garden projects, students are leading the way in eco-friendly practices.", TRUE),
    ( (SELECT branch_id FROM branches WHERE branch_name="Sydney"), "Art Therapy Program Supports Mental Health", "An art therapy program in Sydney is supporting mental health and well-being in the community. Through creative expression, participants are finding healing and hope.", FALSE),
    ( (SELECT branch_id FROM branches WHERE branch_name="Melbourne"), "Community Choir Spreads Joy through Music", "A community choir in Melbourne is spreading joy through music and song. From uplifting performances to community sing-alongs, they're bringing people together through the power of music.", TRUE),
    ( (SELECT branch_id FROM branches WHERE branch_name="Adelaide"), "Youth Leadership Summit Inspires Future Leaders", "A youth leadership summit in Adelaide is inspiring future leaders to make a difference in their communities. Through workshops and discussions, participants are gaining valuable skills and insights.", FALSE);