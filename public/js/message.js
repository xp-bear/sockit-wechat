var socket = io("http://localhost:3000");
var username, avatar;
var time;

function LoginFn() {
  var username = $("#username").val().trim();
  var password = $("#password").val();
  if (!username) {
    alert("请输入用户名");
    return;
  }
  if (!password) {
    alert("请输入密码");
    return;
  }
  //获取头像
  var avatar = $(".user").attr("src");
  // 需要告诉socketio服务，登录
  socket.emit("login", {
    username,
    password,
    avatar,
  });
}

$(".btn").on("click", function () {
  LoginFn(); //登录函数
});

// 监听按钮回车事件
$(".login-box").on("keyup", function (event) {
  // 按下的键码
  var keyCode = event.keyCode || event.which;
  // 判断是否是回车键
  if (keyCode === 13) {
    LoginFn(); //登录函数
  }
});

//监听登录失败的请求
socket.on("loginError", (data) => {
  alert("有此用户,登录失败了");
});

//监听登录成功的请求
socket.on("loginSuccess", (data) => {
  $(".login-box").fadeOut();
  $(".chat").fadeIn();
  $(".own img").attr("src", data.avatar);
  $(".own span").html(data.username);
  // console.log(data);

  username = data.username;
  avatar = data.avatar;
});

//监听添加用户的消息
socket.on("addUser", (data) => {
  time = new Date().toLocaleString();
  $(".center").append(`<div class="center-message" style="color:#ff9889">"${data.username}"加入了聊天室 ${time}</div>`);
  $(".center").children(":last").get(0).scrollIntoView(false);
});

socket.on("userList", (data) => {
  $(".people").html("");
  data.forEach((item) => {
    $(".people").append(`<div class="row"><img src="${item.avatar}"><span>${item.username}</span></div>`);
  });
  $(".title").html(`熊仔聊天室(${data.length})`);
});

//监听用户离开的消息
socket.on("delUser", (data) => {
  time = new Date().toLocaleString();
  $(".center").append(`<div class="center-message">"${data.username}"离开了聊天室 ${time}</div>`);
  // console.log(data);
  $(".center").children(":last").get(0).scrollIntoView(false);
});

//聊天功能
$(".song").on("click", () => {
  let content = $(".write").html().trim();
  $(".write").html("");
  if (!content) {
    return alert("请输入内容");
  }

  // 处理base64图片编码图片
  // console.log(content);
  // var regex = /<img.*?src=["'](.*?)["']/;
  // var match = regex.exec(content);
  // // console.log(match[1]);
  // function uploadBase64Image(base64Image) {
  //   var xhr = new XMLHttpRequest();
  //   xhr.open("POST", "/uploadbase64", true);
  //   xhr.setRequestHeader("Content-Type", "application/json");

  //   xhr.onreadystatechange = function () {
  //     if (xhr.readyState === 4 && xhr.status === 200) {
  //       // 上传完成
  //       var response = JSON.parse(xhr.responseText);
  //       console.log(response);
  //     }
  //   };

  //   var requestBody = JSON.stringify({ image: base64Image });
  //   xhr.send(requestBody);
  // }
  // uploadBase64Image(match[1]);

  //发送给服务器
  socket.emit("sendMessage", {
    msg: content,
    username,
    avatar,
  });
});

//绑定键盘事件
$(".write").bind("keyup", getKeyCode);

function getKeyCode(e) {
  e.preventDefault();
  var evt = e || window.event;
  var keyCode = evt.keyCode || evt.which || evt.charCode;
  if (e.keyCode == 13) {
    let content = $(".write").html().trim().replace(/<br>/g, "");
    $(".write").html("");
    if (!content) {
      return alert("请输入内容");
    }
    //发送给服务器
    socket.emit("sendMessage", {
      msg: content,
      username,
      avatar,
    });
  }
}

//监听聊天消息
socket.on("receiveMessage", (data) => {
  //把接收到的消息显示到哪天窗口中
  if (data.username === username) {
    $(".center").append(`
            <div class="right-message">
                    <img src="${data.avatar}" >
                    <div class="text">
                        <span class="name">${data.username}</span>
                        <span class="tage title-menu-min"><i><img src="img/right.png"></i>${data.msg}</span>
                    </div>
            </div>
            `);
    $(".right-message br").empty();
  } else {
    $(".center").append(`
            <div class="left-message">
                    <img src="${data.avatar}" >
                    <div class="text">
                        <span class="name">${data.username}</span>
                        <span class="tage title-menu-min"><i><img src="img/left.png" ></i>${data.msg}</span>
                    </div>
                </div>
            `);
    $(".right-message br").empty();
  }

  //滚动到当前元素的底部
  $(".center").children(":last").get(0).scrollIntoView(false);
});

//发送图片功能呢
// $("#file").on("change", (event) => {
//   var files = event.target.files;
//   var file = files[0];
//   console.log(file);

//   // 需要把这个文件发送到服务器
//   var fr = new FileReader();
//   fr.readAsDataURL(file);
//   fr.onload = function (e) {
//     // console.log("--", e.target.result);
//     // console.log(fr.result);
//     socket.emit("sendImage", {
//       username,
//       avatar,
//       img: fr.result,
//     });
//   };
// });

//监听图片消息
socket.on("receiveImage", (data) => {
  let height;
  let str = data.img.split("."); //获取后缀数组
  //把接收到的消息显示到哪天窗口中
  if (data.username === username) {
    if (str[str.length - 1] == "jpg" || str[str.length - 1] == "png" || str[str.length - 1] == "jpeg" || str[str.length - 1] == "gif" || str[str.length - 1] == "webpg") {
      $(".center").append(`
      <div class="right-message">
              <img src="${data.avatar}" >
              <div class="text">
                  <span class="name">${data.username}</span>
                  <span class="tage titlex"><i><img src="img/right.png" ></i><img src="${data.img}" class="tu"> </span>
              </div>
      </div>
      `);
      if ($(".tage img").length > 0) {
        height = 50;
      } else {
        height = 0;
      }
      // console.log(height);

      $(".center")
        .children(":last")
        .css({ height: height + 69 + "px" });
    } else {
      $(".center").append(`
      <div class="right-message">
              <img src="${data.avatar}" >
              <div class="text">
                  <span class="name">${data.username}</span>
                  <span class="tage titlex"><i><img src="img/right.png" ></i> <video src="${data.img}" loop autoplay muted class="tu"></video></span>
              </div>
      </div>
      `);
      if ($(".tage img").length > 0) {
        height = 50;
      } else {
        height = 0;
      }
      // console.log(height);

      $(".center")
        .children(":last")
        .css({ height: height + 69 + "px" });
    }
  } else {
    if (str[str.length - 1] == "jpg" || str[str.length - 1] == "png" || str[str.length - 1] == "jpeg" || str[str.length - 1] == "gif" || str[str.length - 1] == "webpg") {
      $(".center").append(`
      <div class="left-message">
              <img src="${data.avatar}" >
              <div class="text">
                  <span class="name">${data.username}</span>
                  <span class="tage titlex"><i><img src="img/left.png" ></i><img src="${data.img}" class="tu"> </span>
              </div>
          </div>
      `);
      if ($(".tage img").length > 0) {
        height = 50;
      } else {
        height = 0;
      }
      $(".center")
        .children(":last")
        .css({ height: height + 69 + "px" });
    } else {
      $(".center").append(`
      <div class="left-message">
              <img src="${data.avatar}" >
              <div class="text">
                  <span class="name">${data.username}</span>
                  <span class="tage titlex"><i><img src="img/left.png" ></i><video src="${data.img}" loop autoplay muted class="tu"></video> </span>
              </div>
          </div>
      `);
      if ($(".tage img").length > 0) {
        height = 50;
      } else {
        height = 0;
      }
      $(".center")
        .children(":last")
        .css({ height: height + 69 + "px" });
    }
  }

  //滚动到当前元素的底部
  $(".center").children(":last").get(0).scrollIntoView(false);
});

//初始化jquery-emoji.插件
$(".write").on("click", function () {
  $(".write").emoji({
    button: ".face",
    showTab: false,
    // animation: 'slide',
    position: "topRight",
    icons: [
      {
        name: "QQ表情",
        path: "./dist/img/emoji/",
        maxNum: 84,
        // excludeNums: [41, 45, 54],
        file: ".png",
      },
    ],
  });
  let height;
  if ($(".emoji_icon").length > 0) {
    height = 0;
  }
  // console.log(height);

  $(".center")
    .children(":last")
    .css({ height: height + 69 + "px" });
});

//双击选中@用户
$(".people").on("dblclick", "div", function () {
  let dbPeople = $(this).children("span").html().trim();
  let content = $(".write").html().trim();
  content = `@${dbPeople} ${content}`;

  $(".write").html("");
  if (!content) {
    return alert("请输入内容");
  }
  $(".write").html(content + "&nbsp;");
});

// 点击发送按钮
$(".song").on("click", function () {
  socket.on("receivePerson", (data) => {
    //把接收到的消息显示到哪天窗口中
    if (data.username === username) {
      $(".center").append(`
            <div class="right-message">
                    <img src="${data.avatar}" >
                    <div class="text">
                        <span class="name">${data.username}</span>
                       <span class="tage title-menu-min"><i><img src="img/right.png" ></i>${data.msg}</span>
                    </div>
            </div>
            `);
      $(".right-message br").empty();
    } else {
      $(".center").append(`
            <div class="left-message">
                    <img src="${data.avatar}" >
                    <div class="text">
                        <span class="name">${data.username}</span>
                        <span class="tage title-menu-min"><i><img src="img/left.png" ></i>${data.msg}</span>
                    </div>
            </div>
            `);
      $(".right-message br").empty();
    }

    //滚动到当前元素的底部
    $(".center").children(":last").get(0).scrollIntoView(false);
  });
});

// 随机图片logo
let num = Math.floor(Math.random() * 8 + 1);
$(".photo img").attr("src", "img/" + num + ".png");

// 随机名字
// 生成随机姓名
function getName() {
  var familyNames = [
    "赵",
    "钱",
    "孙",
    "李",
    "周",
    "吴",
    "郑",
    "王",
    "冯",
    "陈",
    "褚",
    "卫",
    "蒋",
    "沈",
    "韩",
    "杨",
    "朱",
    "秦",
    "尤",
    "许",
    "何",
    "吕",
    "施",
    "张",
    "孔",
    "曹",
    "严",
    "华",
    "金",
    "魏",
    "陶",
    "姜",
    "戚",
    "谢",
    "邹",
    "喻",
    "柏",
    "水",
    "窦",
    "章",
    "云",
    "苏",
    "潘",
    "葛",
    "奚",
    "范",
    "彭",
    "郎",
    "鲁",
    "韦",
    "昌",
    "马",
    "苗",
    "凤",
    "花",
    "方",
    "俞",
    "任",
    "袁",
    "柳",
    "酆",
    "鲍",
    "史",
    "唐",
    "费",
    "廉",
    "岑",
    "薛",
    "雷",
    "贺",
    "倪",
    "汤",
    "滕",
    "殷",
    "罗",
    "毕",
    "郝",
    "邬",
    "安",
    "常",
    "乐",
    "于",
    "时",
    "傅",
    "皮",
    "卞",
    "齐",
    "康",
    "伍",
    "余",
    "元",
    "卜",
    "顾",
    "孟",
    "平",
    "黄",
    "和",
    "穆",
    "萧",
    "尹",
  ];
  var givenNames = [
    "子璇",
    "淼",
    "国栋",
    "夫子",
    "瑞堂",
    "甜",
    "敏",
    "尚",
    "国贤",
    "贺祥",
    "晨涛",
    "昊轩",
    "易轩",
    "益辰",
    "益帆",
    "益冉",
    "瑾春",
    "瑾昆",
    "春齐",
    "杨",
    "文昊",
    "东东",
    "雄霖",
    "浩晨",
    "熙涵",
    "溶溶",
    "冰枫",
    "欣欣",
    "宜豪",
    "欣慧",
    "建政",
    "美欣",
    "淑慧",
    "文轩",
    "文杰",
    "欣源",
    "忠林",
    "榕润",
    "欣汝",
    "慧嘉",
    "新建",
    "建林",
    "亦菲",
    "林",
    "冰洁",
    "佳欣",
    "涵涵",
    "禹辰",
    "淳美",
    "泽惠",
    "伟洋",
    "涵越",
    "润丽",
    "翔",
    "淑华",
    "晶莹",
    "凌晶",
    "苒溪",
    "雨涵",
    "嘉怡",
    "佳毅",
    "子辰",
    "佳琪",
    "紫轩",
    "瑞辰",
    "昕蕊",
    "萌",
    "明远",
    "欣宜",
    "泽远",
    "欣怡",
    "佳怡",
    "佳惠",
    "晨茜",
    "晨璐",
    "运昊",
    "汝鑫",
    "淑君",
    "晶滢",
    "润莎",
    "榕汕",
    "佳钰",
    "佳玉",
    "晓庆",
    "一鸣",
    "语晨",
    "添池",
    "添昊",
    "雨泽",
    "雅晗",
    "雅涵",
    "清妍",
    "诗悦",
    "嘉乐",
    "晨涵",
    "天赫",
    "玥傲",
    "佳昊",
    "天昊",
    "萌萌",
    "若萌",
  ];

  var i = parseInt(10 * Math.random()) * 10 + parseInt(10 * Math.random());
  var familyName = familyNames[i];

  var j = parseInt(10 * Math.random()) * 10 + parseInt(10 * Math.random());
  var givenName = givenNames[i];

  var name = familyName + givenName;

  // 获取到用户的ip地址
  let pro = ajaxPromise("http://localhost:3000/ip");
  pro.then((res) => {
    const obj = JSON.parse(res);
    let ip = obj.data.client_ip;
    let province = obj.data.province;
    // $("#username").attr("value", ip);
    // $("#username").attr("disabled", true);
  });

  $("#username").attr("value", name);
  $("#username").attr("disabled", false); //可以修改用户名
}
getName();

// 随机密码
$("#password").attr("value", "12345678");

// 截图按钮
$(".cut").on("click", function (e) {
  // alert("截图功能正在开发中...");
  let element = document.getElementById("right");

  html2canvas(element).then(function (canvas) {
    // 在回调函数中处理生成的 Canvas 元素
    var screenshotImage = new Image();
    screenshotImage.src = canvas.toDataURL();
    screenshotImage.class = "screenshot";
    document.querySelector(".write").appendChild(screenshotImage);
  });
});

// 点击图片,查看大图,通过事件委派
$(".center").on("click", function (e) {
  // 检查点击的元素是否为目标按钮
  if (e.target && e.target.matches("img")) {
    // 获取点击的图片元素和对应的 src 属性值
    const clickedImage = e.target;
    const srcText = clickedImage.getAttribute("src");
    // console.log(srcText);
    let openImg = document.querySelector(".overlay img");

    // 给大图进行赋值
    openImg.src = srcText;
    //  显示大图
    let overlay = document.querySelector(".overlay");
    overlay.style.display = "block";
  }
});
// 点击大图,关闭遮罩层
$(".overlay").on("click", function (e) {
  let overlay = document.querySelector(".overlay");
  let openImg = document.querySelector(".overlay img");
  openImg.src = "";
  overlay.style.display = "none";
});

// 登录页面,切换头像
$("#logoFile").on("change", function (e) {
  let fileInput = document.getElementById("logoFile");
  let file = fileInput.files[0];
  console.log(file);
  if (file) {
    var formData = new FormData();
    formData.append("file", file);
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/upload", true);
    // 进度条
    // xhr.upload.addEventListener(
    //   "progress",
    //   function (event) {
    //     if (event.lengthComputable) {
    //       var percent = (event.loaded / event.total) * 100;
    //       var progress = document.getElementById("progress");
    //       progress.innerHTML = "上传进度: " + percent.toFixed(2) + "%";
    //     }
    //   },
    //   false
    // );

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        // 上传完成
        var response = JSON.parse(xhr.responseText);
        console.log(response);
        // 进行图片赋值
        let userImg = document.querySelector(".user");
        userImg.src = response.url;
      }
    };

    xhr.send(formData);
  }
});
