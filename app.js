const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const cors = require("cors");
const qiniu = require("qiniu");
//记录所有已经登录过的用户
const users = [];

app.use(require("express").static("public"));
app.use(cors());

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
  res.send("ok");
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
