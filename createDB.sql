CREATE DATABASE volunteer_management_system;
USE volunteer_management_system;

CREATE TABLE branches (
    branch_id INT AUTO_INCREMENT,
    branch_name VARCHAR(64) NOT NULL,
    street_number INT,
    street_name VARCHAR(64),
    city VARCHAR(64),
    branch_state VARCHAR(64),
    postcode INT,
    email VARCHAR(64) NOT NULL,
    phone VARCHAR(12),
    image_url VARCHAR(256),
    branch_description VARCHAR(1024) NOT NULL,
    openingHours DATETIME DEFAULT '2024-01-01 09:00:00',
    closingHours DATETIME DEFAULT '2024-01-01 17:00:00',

    PRIMARY KEY (branch_id)
);

CREATE TABLE users (
    user_id BINARY(16) DEFAULT (UUID_TO_BIN(UUID())),
    google_uid decimal(21, 0) DEFAULT NULL,
    password_hash BINARY(60),
    first_name VARCHAR(64) NOT NULL,
    last_name VARCHAR(64) NOT NULL,
    phone_num VARCHAR(14) DEFAULT NULL, -- Add check for validity
    email VARCHAR(320) NOT NULL, -- Add check for validity
    postcode INT, -- Add check for validity (4 digits, not negative)
    image_url VARCHAR(64) DEFAULT '/image/1',
    email_notifications BOOLEAN DEFAULT TRUE,
    branch_managed INT DEFAULT NULL,
    system_admin BOOLEAN DEFAULT FALSE,

    PRIMARY KEY (user_id),
    FOREIGN KEY (branch_managed) REFERENCES branches(branch_id) ON DELETE SET NULL
);

CREATE TABLE events (
    event_id INT AUTO_INCREMENT,
    branch_id INT NOT NULL,
    event_name VARCHAR(64) NOT NULL,
    start_date_time DATETIME NOT NULL,
    end_date_time DATETIME, -- Check after start time?
    event_description VARCHAR(2048) NOT NULL,
    event_details VARCHAR(4096),
    event_location VARCHAR(64),
    event_image VARCHAR(64),
    is_public BOOLEAN DEFAULT FALSE,

    PRIMARY KEY (event_id),
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id)
);

CREATE TABLE news (
    article_id INT AUTO_INCREMENT,
    branch_id INT NOT NULL,
    title VARCHAR(128) NOT NULL,
    content VARCHAR(4096) NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    date_published DATE DEFAULT (CURRENT_DATE),
    image_url VARCHAR(64),

    PRIMARY KEY (article_id),
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id)
);

CREATE TABLE user_branch_affiliation (
    branch_id INT,
    user_id BINARY(16),

    PRIMARY KEY (branch_id, user_id),
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE user_event_attendance (
    event_id INT,
    user_id BINARY(16),
    rsvp BOOLEAN NOT NULL,

    PRIMARY KEY (event_id, user_id),
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE images (
    image_id INT AUTO_INCREMENT,
    branch_id INT,
    public BOOLEAN DEFAULT FALSE,
    filetype VARCHAR(64),
    file_name_rand BINARY(16) UNIQUE DEFAULT (UUID_TO_BIN(UUID())),
    file_name_orig VARCHAR(256),

    PRIMARY KEY (image_id),
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE CASCADE
);
