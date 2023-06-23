const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const cors = require("cors");
const qiniu = require("qiniu");
const axios = require("axios");
const multer = require("multer");
const bodyParser = require("body-parser");
const fs = require("fs");

const upload = multer({ dest: "public/uploads/" }); // 指定文件上传的目录

//记录所有已经登录过的用户
const users = [];
app.use(require("express").static("public")); // 托管静态资源
app.use(cors());
app.use(bodyParser.json());
var accessKey = "EGGnEY8AQ2_FKIfrcXerQ7Dntu7L0QEicVhYoHjS";
var secretKey = "v-QNWJJh2S5MZ2B5nVAIce7TWAs7cH8uOev4aiSV";
var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
// 返回上传文件的token值,返回给前端,根据token值进行一个上传
//匹配GET请求路径设置回调函数
app.get("/uploadToken", function (req, res) {
  //
  var options = {
    scope: "cookies",
    force: true,
  };
  var putPolicy = new qiniu.rs.PutPolicy(options);
  var uploadToken = putPolicy.uploadToken(mac);
  res.json({ uploadToken });
});

app.get("/", (req, res) => {
  res.redirect("/index.html");
});

app.get("/ip", (req, res) => {
  // 发起请求,获取用户的IP地址
  let data = req.ip;
  res.json({ data: data });
});

// 上传头像文件
app.post("/upload", upload.single("file"), (req, res) => {
  // req.file 包含上传的文件信息
  if (req.file) {
    // console.log(req.file);
    // res.json({ message: "文件上传成功" });
    let oldName = req.file.path; // 上传后默认的文件名 : 15daede910f2695c1352dccbb5c3e897
    let name = req.file.originalname.split(".")[0] + "-" + Date.now();
    let suffix = req.file.originalname.split(".")[1];
    let newName = "public/uploads/" + name + "." + suffix; // 指定文件路径和文件名
    let spaceName = newName.replace("public/", "");
    // 3. 将上传后的文件重命名
    fs.renameSync(oldName, newName);
    // 4. 文件上传成功,返回上传成功后的文件路径
    res.send({
      code: 200,
      url: "http://localhost:3000/" + spaceName, // 复制URL链接直接浏览器可以访问
    });
  } else {
    res.status(400).json({ message: "文件上传失败" });
  }
});

// 上传base64图片
app.post("/uploadbase64", upload.single("image"), (req, res) => {
  if (req.file) {
    // 文件已经上传到服务器的uploads/目录下
    // 可以根据需要进行处理，比如保存到数据库或其他操作
    // res.json({ message: "文件上传成功" });
    let oldName = req.file.path; // 上传后默认的文件名 : 15daede910f2695c1352dccbb5c3e897
    let name = req.file.originalname.split(".")[0] + "-" + Date.now();
    let suffix = req.file.originalname.split(".")[1];
    let newName = "public/uploads/" + name + "." + suffix; // 指定文件路径和文件名
    let spaceName = newName.replace("public/", "");
    // 3. 将上传后的文件重命名
    fs.renameSync(oldName, newName);
    // 4. 文件上传成功,返回上传成功后的文件路径
    res.send({
      code: 200,
      url: "http://localhost:3000/" + spaceName, // 复制URL链接直接浏览器可以访问
    });
  } else {
    res.status(400).json({ message: "文件上传失败" });
  }
});

server.listen(3000, () => {
  console.log("websocket启动成功,监听http://localhost:3000/");
});

io.on("connection", (socket) => {
  //监听登录消息
  socket.on("login", (data) => {
    let user = users.find((user) => user.username === data.username);
    if (user) {
      //    登录失败
      socket.emit("loginError", { msg: "有此用户,登录失败" });
      console.log("登录失败");
    } else {
      users.push(data);
      socket.emit("loginSuccess", data);
      console.log("登录成功");

      //告诉所有的用户，有用户加入到了哪天室，广播消息
      //socket.emit：告诉当前用户
      //io.emit：广播事件
      io.emit("addUser", data);

      //告诉所有的甲户，目前聊天室中有多少人
      io.emit("userList", users);

      //把登录成功的用户名和头像存储起来
      socket.username = data.username;
      socket.avatar = data.avatar;
    }
  });

  //用户断开连接
  socket.on("disconnect", (data) => {
    //把当前用户的信息Musers中删除h
    //1，告诉所有人，有人离开聊天室,
    let idx = users.findIndex((item) => item.username === socket.username);
    // console.log(users)
    // console.log(idx)
    users.splice(idx, 1);
    io.emit("delUser", {
      username: socket.username,
      avatar: socket.avatar,
    });
    //更新userList
    io.emit("userList", users);
  });

  //发送消息
  socket.on("sendMessage", (data) => {
    // console.log(data)
    //广播给所有用户
    io.emit("receiveMessage", data);
  });

  //按收图片信息
  socket.on("sendImage", (data) => {
    console.log(data);
    io.emit("receiveImage", data);
  });

  //给个人发消息
  socket.on("sendPerson", (data) => {
    console.log(data);
    socket.emit("receivePerson", data);
  });
});
