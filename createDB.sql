CREATE DATABASE volunteer_management_system;
USE volunteer_management_system;

CREATE TABLE users (
    user_id BINARY(16) DEFAULT (UUID_TO_BIN(UUID())),
    username VARCHAR(64) UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    postcode INT,
    first_name VARCHAR(64),
    last_name VARCHAR(64),
    phone_num VARCHAR(12),
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
    email VARCHAR(64),
    phone VARCHAR(12),
    image_url VARCHAR(256),
    branch_description VARCHAR(1024),

    PRIMARY KEY (branch_id)
);

CREATE TABLE events (
    event_id INT AUTO_INCREMENT,
    branch_id INT,
    event_name VARCHAR(64),
    start_date_time DATETIME,
    end_date_time DATETIME,
    event_description VARCHAR(2048),
    is_public BOOLEAN DEFAULT FALSE,

    PRIMARY KEY (event_id),
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id)
);

CREATE TABLE news (
    article_id INT AUTO_INCREMENT,
    branch_id INT,
    title VARCHAR(64),
    content VARCHAR(1024),
    is_public BOOLEAN DEFAULT FALSE,
    date_published DATE DEFAULT (CURRENT_DATE),
    image_url VARCHAR(64),

    PRIMARY KEY (article_id),
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id)
);

CREATE TABLE user_branch_affiliation (
    branch_id INT,
    user_id BINARY(16),
    is_manager BOOLEAN NOT NULL DEFAULT FALSE,

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
