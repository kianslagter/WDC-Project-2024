Meal Mates Volunteer Organisation Website
========

## Introduction

The developed website is for a fictional not-for-profit foodbank organisation called "Meal Mates".

## Installation

Install required packages using `npm install`.

(To install node.js and npm follow the steps [here](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm))

## Usage

Start, create and populate the SQL database using the following commands:

* service mysql start
* mysql < createDB.sql
* mysql < addData.sql

Then use `npm start` to run the web server.

## User Accounts

The following user accounts exists which can be used to test the website:

### System Admin:

Username: admin@mealmates.com

Password: adminPWD

### Branch manager (Adelaide)
username: adelaide.mealmates@mealmates.com

password: Adelaide Mealmates

A manager exists for each branch with the username and password in the same format.
For example Gold Coast:

username: gold.coast.mealmates@mealmates.com

password: Gold Coast Mealmates

### A regular user account
Belongs to Adelaide branch

username: christina.green@yahoo.com

password: bRRK3$pDkd

## Authors

The UG_Group 22 has the following members:

* Sean Priestley
* Dean Macri
* Arnav Vaid
* Kian Slagter
