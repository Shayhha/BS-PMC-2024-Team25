DROP DATABASE IF EXISTS BugFixer;
CREATE DATABASE BugFixer;

CREATE TABLE Users (
    userId INT IDENTITY(1,1) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    userName VARCHAR(255) NOT NULL DEFAULT 'user',
    fname VARCHAR(255) NOT NULL,
    lname VARCHAR(255) NOT NULL,
    userType VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    isDeleted INT NOT NULL DEFAULT 0 CHECK (isDeleted IN (0, 1)), -- flag for soft deletion
    CHECK (email LIKE '%@%.%'), -- basic email format validation
    CHECK (userType IN ('Coder', 'Tester', 'Manager')),
    PRIMARY KEY(userId, email)
);

CREATE TABLE Projects (
    projectId INT IDENTITY(1,1) UNIQUE NOT NULL,
    projectName VARCHAR(255) UNIQUE NOT NULL,
    managerId INT NOT NULL, -- referencing the project manager
    projectDesc VARCHAR(255) DEFAULT '', -- description of project
    PRIMARY KEY(projectId),
    FOREIGN KEY (managerId) REFERENCES Users(userId) 
);

CREATE TABLE Bugs (
    bugId INT IDENTITY(1,1) UNIQUE NOT NULL,
    bugName VARCHAR(255) NOT NULL,
    projectId INT NOT NULL, -- project that is assigned
    createdId INT NOT NULL, -- user that opened the bug
    assignedId INT NULL, -- user that is assigned to fix bug
    bugDesc VARCHAR(255) DEFAULT '', -- description of bug
    status VARCHAR(255) NOT NULL DEFAULT 'New',
    priority INT NOT NULL,
    importance INT NOT NULL,
    numOfComments INT NOT NULL DEFAULT 0,
    creationDate VARCHAR(10) NOT NULL,
    openDate VARCHAR(10), -- storing as string in dd/mm/yyyy format
    closeDate VARCHAR(10),
    category VARCHAR(20) NOT NULL DEFAULT 'Functionality',
    bugSuggest VARCHAR(MAX) NULL DEFAULT '',
    updateCounter INT DEFAULT 0,
    updateDates VARCHAR(MAX) DEFAULT '',
    PRIMARY KEY (bugId, projectId),
    FOREIGN KEY (createdId) REFERENCES Users(userId),
    FOREIGN KEY (assignedId) REFERENCES Users(userId),
    FOREIGN KEY (projectId) REFERENCES Projects(projectId),
    CHECK (TRY_CONVERT(DATE, creationDate, 103) IS NOT NULL), -- ensure creationDate is a valid date
    CHECK (openDate IS NULL OR TRY_CONVERT(DATE, openDate, 103) >= TRY_CONVERT(DATE, creationDate, 103)), -- openDate should be NULL or on/after creationDate
    CHECK (closeDate IS NULL OR TRY_CONVERT(DATE, closeDate, 103) >= TRY_CONVERT(DATE, creationDate, 103)), -- closeDate should be NULL or on/after creationDate
    CHECK (closeDate IS NULL OR openDate IS NULL OR TRY_CONVERT(DATE, closeDate, 103) >= TRY_CONVERT(DATE, openDate, 103)), -- closeDate should be NULL or on/after openDate
    CHECK (status IN ('New', 'In Progress', 'Done')),
    CHECK (priority BETWEEN 1 AND 10), -- priority should be between 1 and 10
    CHECK (importance BETWEEN 1 AND 10), -- importance should be between 1 and 10
    CHECK (category IN ('UI', 'Functionality', 'Performance', 'Usability', 'Security'))
);

CREATE TABLE BugComments (
    commentId INT IDENTITY(1,1) UNIQUE NOT NULL,
    bugId INT NOT NULL,
    userId INT NOT NULL, 
    commentInfo VARCHAR(255) DEFAULT '',
    PRIMARY KEY (commentId, userId, bugId),
    FOREIGN KEY (userId) REFERENCES Users(userId),
    FOREIGN KEY (bugId) REFERENCES Bugs(bugId) 
);

CREATE TABLE ChatMessages (
    messageId INT IDENTITY(1,1) UNIQUE NOT NULL,
    senderId INT NOT NULL,
    receiverId INT NOT NULL,
    messageInfo VARCHAR(255) DEFAULT '',
    creationDate VARCHAR(10) DEFAULT '1/1/1970',
    creationTime VARCHAR(8) DEFAULT '00:00:00',
    senderName VARCHAR(255),
    PRIMARY KEY(messageId),
    FOREIGN KEY (senderId) REFERENCES Users(userId),
    FOREIGN KEY (receiverId) REFERENCES Users(userId) 
);

CREATE TABLE Notifications (
    id INT IDENTITY(1,1),
    userId INT NOT NULL,
    message VARCHAR(255) NOT NULL,
    creationDate VARCHAR(10) NOT NULL,
    creationHour VARCHAR(8) NOT NULL, 
    [read] INT DEFAULT 0 CHECK ([read] IN (0, 1)),
    PRIMARY KEY (id),
    FOREIGN KEY (userId) REFERENCES Users(userId),
    CHECK (TRY_CONVERT(DATE, creationDate, 103) IS NOT NULL) -- ensure creationDate is a valid date
);

CREATE TABLE Reports (
    reportId INT IDENTITY(1,1) UNIQUE NOT NULL,
    managerId INT NOT NULL,
    openBugs INT NOT NULL DEFAULT 0,
    closedBugs INT NOT NULL DEFAULT 0,
    priorityBugs INT NOT NULL DEFAULT 0,
    importanceBugs INT NOT NULL DEFAULT 0,
    creationDate VARCHAR(10) DEFAULT '1/1/1970',
    creationTime VARCHAR(8) DEFAULT '00:00:00',
    PRIMARY KEY(reportId),
    FOREIGN KEY (managerId) REFERENCES Users(userId)
);

INSERT INTO Users (email, userName, fname, lname, userType, password)
VALUES ('shay@shay.com', 'Shay', 'Shay', 'Hahiashvili', 'Coder', 'a0ae799a2910f035b250e5175a02576f0ed0970c18ece1e65ce706767fa85c72');

INSERT INTO Users (email, userName, fname, lname, userType, password)
VALUES ('max@max.com', 'Maxim', 'Maxim', 'Subotin', 'Manager', '6beea10f9cf47563eb475c4c6f0126b7d4230173c9429eb9a291fa1cfb136721');

INSERT INTO Users (email, userName, fname, lname, userType, password)
VALUES ('ayman@ayman.com', 'Ayman', 'Ayman', 'Omar', 'Tester', '31b9d9d5e64cf62ecc7228e5f9861a7a1a994af39e52c70b137e2e38ba6c112d');

INSERT INTO Users (email, userName, fname, lname, userType, password)
VALUES ('ala@ala.com', 'Ala', 'Ala', 'Bargita', 'Coder', 'fcde2b2edba56bf408601fb721fe9b5c338d10ee429ea04fae5511b68fbf8fb9');

INSERT INTO Projects (projectName, managerId, projectDesc)
VALUES ('Project Example', 3, 'This is a description of Project Example.');

INSERT INTO Bugs (bugName, projectId, createdId, assignedId, bugDesc, status, priority, importance, creationDate, openDate)
VALUES ('Bug 1', 1, 1, 2, 'This is a description of Bug 1.', 'New', 5, 7, '01/01/2024', '02/01/2024');

INSERT INTO Bugs (bugName, projectId, createdId, assignedId, bugDesc, status, priority, importance, creationDate, openDate)
VALUES ('Bug 2', 1, 1, 2, 'This is a description of Bug 2.', 'New', 6, 8, '01/01/2024', '03/01/2024');