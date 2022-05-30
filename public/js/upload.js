// promise封装ajax
function ajaxPromise(url, method, data) {
  return new Promise(function (resolve, reject) {
    var ajax = new XMLHttpRequest();
    var method = method || "GET";
    var data = data || null;
    ajax.open(method, url);
    ajax.send(data);
    ajax.onreadystatechange = function () {
      if (ajax.readyState == 4 && ajax.status == 200) {
        resolve(ajax.responseText);
      }
    };
    setTimeout(function () {
      reject("请求服务器失败");
    }, 1000);
  });
}

const baseURL = "http://cdn.xxoutman.cn/chat/";
let file = document.querySelector("#file");

file.addEventListener("change", function (e) {
  let pro = ajaxPromise("http://localhost:3000/uploadToken");

  pro.then((res) => {
    let token = JSON.parse(res).uploadToken;
    const putExtra = {
      mimeType: null,
    };
    const config = {
      useCdnDomain: true,
      region: qiniu.region.z2,
    };

    let observable = qiniu.upload(file.files[0], file.files[0].name, token, putExtra, config);
    let observer = {
      next(res) {
        // console.log(res.total.loaded, res.total.total, res.total.percent);
      },
      error(err) {},
      complete(res) {
        let key = encodeURIComponent(res.key);
        // console.log(key);
        socket.emit("sendImage", {
          username,
          avatar,
          img: "http://cdn.xxoutman.cn/" + key,
        });
      },
    };
    let subscription = observable.subscribe(observer); // 上传开始
  });
});
