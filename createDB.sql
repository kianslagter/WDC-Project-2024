CREATE DATABASE volunteer_management_system;
USE volunteer_management_system;

CREATE TABLE users (
    user_id BINARY(16) DEFAULT (UUID_TO_BIN(UUID())),
    username VARCHAR(64) UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    postcode INT, -- Add check for validity (4 digits, not negative)
    first_name VARCHAR(64) NOT NULL,
    last_name VARCHAR(64) NOT NULL,
    phone_num VARCHAR(14), -- Add check for validity
    email VARCHAR(320) NOT NULL, -- Add check for validity
    system_admin BOOLEAN DEFAULT FALSE,

    PRIMARY KEY (user_id)
);

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

    PRIMARY KEY (branch_id)
);

CREATE TABLE events (
    event_id INT AUTO_INCREMENT,
    branch_id INT NOT NULL,
    event_name VARCHAR(64) NOT NULL,
    start_date_time DATETIME NOT NULL,
    end_date_time DATETIME, -- Check after start time?
    event_description VARCHAR(2048) NOT NULL,
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
    is_manager BOOLEAN DEFAULT FALSE,

    PRIMARY KEY (branch_id, user_id),
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE user_event_attendance (
    event_id INT,
    user_id BINARY(16),
    rsvp BOOLEAN NOT NULL,

    PRIMARY KEY (event_id, user_id),
    FOREIGN KEY (event_id) REFERENCES events(event_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
