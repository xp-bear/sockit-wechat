$(function () {
  let count;
  let rotate;
  var timer = setInterval(function () {
    count = Math.round(Math.random() * 100);
    rotate = Math.round(Math.random() * 360);
    $(".top").css({
      background: "linear-gradient(" + rotate + "deg,#9980ff 0%,#bf93fa " + count + "% ,#3abcff 100%)",
      transition: "all .5s",
    });
  }, 500);

  $(".cats li").on("click", function () {
    $(this).addClass("now").siblings().removeClass("now");
    let source = $(this).children().attr("src");
    $(".user").attr("src", source);
  });

  $(".btn").hover(
    function () {
      $(this).css({
        "border-radius": "20px",
        transition: "all .3s",
      });
    },
    function () {
      $(this).css({
        "border-radius": "5px",
        transition: "all .3s",
      });
    }
  );

  $(".table label input").on("click", function () {
    $(this).parent().css({
      "border-bottom": "1px solid #2fc0f6",
      transition: "all .3s",
    });
    $(this).parent().siblings().css({
      "border-bottom": "1px solid #666",
      transition: "all .3s",
    });
  });
});
