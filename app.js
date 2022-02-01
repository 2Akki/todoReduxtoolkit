const bcrypt = require("bcryptjs/dist/bcrypt");
const { application } = require("express");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const PORT = 8000;
const User = require("./models/user");
const Todo = require("./models/todo");

const jwt = require("jsonwebtoken");
const {JWT_SECRET,MONGOURI} = require("./config/keys");
mongoose.connect(
 MONGOURI,
  {
    useNewUrlParser: true,
  }
);
mongoose.connection.on("connected", () => {
  console.log("connected to mongo");
});
mongoose.connection.on("connectionerror", (err) => {
  console.log(err);
});
//bTrV1omp2ABSL7Ey
//mongodb+srv://Akki:bTrV1omp2ABSL7Ey@cluster0.les3i.mongodb.net/tododb ?retryWrites=true&w=majority
// app.get('/',(req,res)=>{
//     res.json({message: 'hello'})
// })
app.use(express.json());

const requireLogin = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ error: "you must be looged in " });
  }
  try {
    const { userId } = jwt.verify(authorization, JWT_SECRET);
    req.user = userId;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ error: "you must be looged in " });
  }
};
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(422).json({ error: "please add all the fields" });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res
        .status(422)
        .json({ error: "user already excists with that email" });
    }
    const hashedPasword = await bcrypt.hash(password, 12);
    await new User({
      email,
      password: hashedPasword,
    }).save();
    res.status(200).json({ message: "signup Success You can Login Now" });
  } catch (error) {
    console.log(error);
  }
});
app.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(422).json({ error: "please add all the fields" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ error: "user does not exstint with that email" });
    }
    const doMatch = await bcrypt.compare(password, user.password);
    if (doMatch) {
      const token = jwt.sign({ userId: user._id }, JWT_SECRET);
      res.status(201).json({ token });
    } else {
      return res.status(401).json({ error: "email or pasword is invalid" });
    }
  } catch (error) {
    console.log(error);
  }
});

app.get("/test", requireLogin, (req, res) => {
  res.json({ message: req.user });
});

app.post("/createtodo", requireLogin, async(req, res) => {
  const data =await new Todo({
    todo: req.body.todo,
    todoBy: req.user,
  }).save();
  res.status(201).json({message:data})
});

app.get("/gettodo", requireLogin,async(req, res)=>{
    const data =await Todo.find({
        todoBy:req.user
    })
    res.status(201).json({message:data})
})
app.delete("/remove/:id",requireLogin,async (req, res)=>{
   const removedTodo =await Todo.findOneAndRemove({_id: req.params.id})
   res.status(200).json({message:removedTodo })
})



if(process.env.NODE_ENV == 'production'){
  const path = require('path');

  app.get("/",(req,res)=>{
    app.use(express.static(path.resolve(__dirname,"client","build")))
    res.sendFile(path.resolve(__dirname,"client","build","index.html"))
  })
}





app.listen(PORT, () => {
  console.log("lisning");
});
