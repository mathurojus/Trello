const express = require("express");
const jwt = require("jsonwebtoken");
const { authMiddleware } = require("./middleware")

let USERS_ID = 1;
let ORGANIZATION_ID = 1;
let BOARD_ID = 1;
let ISSUES_ID = 1;

const USERS = [];

const ORGANIZATIONS = [];

const BOARDS = [];

const ISSUES = [];

const app = express();
app.use(express.json());

// CORS Middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, token');

    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// CREATE
app.post("/signup", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const userExists = USERS.find(u => u.username === username);
    if (userExists) {
        res.status(411).json({
            message: "User with this username already exists"
        })
        return;
    }

    USERS.push({
        username,
        password,
        id: USERS_ID++
    })

    res.json({
        message: "You have signed up successfully"
    })

})

app.post("/signin", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const userExists = USERS.find(u => u.username === username && u.password === password);
    if (!userExists) {
        res.status(403).json({
            message: "Incorrect credentials"
        })
    }

    const token = jwt.sign({
        userId: userExists.id
    }, "attlasiationsupersecret123123password");
    // create a jwt for the user

    res.json({
        token
    })
})

// AUTHENTICATED ROUTE - MIDDLEWARE
app.post("/organization", authMiddleware, (req, res) => {
    const userId = req.userId;
    ORGANIZATIONS.push({
        id: ORGANIZATION_ID++,
        title: req.body.title,
        description: req.body.description,
        admin: userId,
        members: []
    })

    res.json({
        message: "Org created",
        id: ORGANIZATION_ID - 1
    })
})

app.post("/add-member-to-organization", authMiddleware, (req, res) => {
    const userId = req.userId;
    const organizationId = req.body.organizationId;
    const memberUserUsername = req.body.memberUserUsername;

    const organization = ORGANIZATIONS.find(org => org.id === organizationId);

    if (!organization || organization.admin !== userId) {
        res.status(411).json({
            message: "Either this org doesnt exist or you are not an admin of this org"
        })
        return
    }

    const memberUser = USERS.find(u => u.username === memberUserUsername);

    if (!memberUser) {
        res.status(411).json({
            message: "No user with this username exists in our db"
        })
        return
    }

    organization.members.push(memberUser.id);

    res.json({
        message: "New member added!"
    })
})

app.post("/board", authMiddleware, (req, res) => {
    const userId = req.userId;
    const organizationId = req.body.organizationId;
    const title = req.body.title;
    const description = req.body.description;

    const organization = ORGANIZATIONS.find(org => org.id === organizationId);

    if (!organization || organization.admin !== userId) {
        res.status(411).json({
            message: "Either this org doesnt exist or you are not an admin of this org"
        })
        return;
    }

    BOARDS.push({
        id: BOARD_ID++,
        title,
        description,
        organizationId,
        createdBy: userId
    })

    res.json({
        message: "Board created",
        id: BOARD_ID - 1
    })
})

app.post("/issue", (req, res) => {
    const boardId = req.body.boardId;
    const title = req.body.title;
    const description = req.body.description;
    const assignee = req.body.assignee;

    const board = BOARDS.find(b => b.id === boardId);

    if (!board) {
        res.status(411).json({
            message: "Board does not exist"
        })
        return;
    }

    ISSUES.push({
        id: ISSUES_ID++,
        title,
        description,
        boardId,
        assignee,
        status: "open"
    })

    res.json({
        message: "Issue created",
        id: ISSUES_ID - 1
    })
})

//GET endpoints
app.get("/organization", authMiddleware, (req, res) => {
    const userId = req.userId;
    const organizationId = parseInt(req.query.organizationId); // "1"

    const organization = ORGANIZATIONS.find(org => org.id === organizationId);

    console.log(organization);
    console.log(userId);
    if (!organization || organization.admin !== userId) {
        res.status(411).json({
            message: "Either this org doesnt exist or you are not an admin of this org"
        })
        return
    }

    res.json({
        organization: {
            ...organization,
            members: organization.members.map(memberId => {
                const user = USERS.find(user => user.id === memberId);
                return {
                    id: user.id,
                    username: user.username
                }
            })
        }
    })
})

app.get("/boards", authMiddleware, (req, res) => {
    const organizationId = parseInt(req.query.organizationId);

    if (!organizationId) {
        res.status(411).json({
            message: "organizationId query parameter is required"
        })
        return;
    }

    const organization = ORGANIZATIONS.find(org => org.id === organizationId);

    if (!organization) {
        res.status(411).json({
            message: "Organization does not exist"
        })
        return;
    }

    const boards = BOARDS.filter(board => board.organizationId === organizationId);

    res.json({
        boards
    })
})

app.get("/issues", (req, res) => {
    const boardId = req.query.boardId ? parseInt(req.query.boardId) : null;
    const assignee = req.query.assignee ? parseInt(req.query.assignee) : null;

    let issues = ISSUES;

    if (boardId) {
        issues = issues.filter(issue => issue.boardId === boardId);
    }

    if (assignee) {
        issues = issues.filter(issue => issue.assignee === assignee);
    }

    res.json({
        issues
    })
})

app.get("/members", authMiddleware, (req, res) => {
    const organizationId = parseInt(req.query.organizationId);
    const userId = req.userId;

    if (!organizationId) {
        res.status(411).json({
            message: "organizationId query parameter is required"
        })
        return;
    }

    const organization = ORGANIZATIONS.find(org => org.id === organizationId);

    if (!organization || organization.admin !== userId) {
        res.status(411).json({
            message: "Either this org doesnt exist or you are not an admin of this org"
        })
        return;
    }

    const members = organization.members.map(memberId => {
        const user = USERS.find(user => user.id === memberId);
        return {
            id: user.id,
            username: user.username
        }
    })

    res.json({
        members
    })
})


// UPDATE
app.put("/issues", (req, res) => {
    const issueId = req.body.issueId;
    const title = req.body.title;
    const description = req.body.description;
    const assignee = req.body.assignee;
    const status = req.body.status;

    const issue = ISSUES.find(i => i.id === issueId);

    if (!issue) {
        res.status(411).json({
            message: "Issue does not exist"
        })
        return;
    }

    if (title !== undefined) issue.title = title;
    if (description !== undefined) issue.description = description;
    if (assignee !== undefined) issue.assignee = assignee;
    if (status !== undefined) issue.status = status;

    res.json({
        message: "Issue updated",
        issue
    })
})

//DELETE
app.delete("/members", authMiddleware, (req, res) => {
    const userId = req.userId;
    const organizationId = req.body.organizationId;
    const memberUserUsername = req.body.memberUserUsername;

    const organization = ORGANIZATIONS.find(org => org.id === organizationId);

    if (!organization || organization.admin !== userId) {
        res.status(411).json({
            message: "Either this org doesnt exist or you are not an admin of this org"
        })
        return
    }

    const memberUser = USERS.find(u => u.username === memberUserUsername);

    if (!memberUser) {
        res.status(411).json({
            message: "No user with this username exists in our db"
        })
        return
    }

    if (!organization.members.includes(memberUser.id)) {
        res.status(411).json({
            message: "This user is not a member of this organization"
        })
        return
    }

    organization.members = organization.members.filter(user => user !== memberUser.id);

    res.json({
        message: "member deleted!"
    })
})

app.listen(3000);