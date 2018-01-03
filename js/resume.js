$(function () {
  // 个人履历页面js
  // 选择工作状态
  $('.dropdown_status').on('click', function (e) {
    if( $('.menu_direction').hasClass('show')){
      $('.menu_direction').toggleClass('show');
    }
    if( $('.menu_occupation').hasClass('show')){
      $('.menu_occupation').toggleClass('show');
    }
    e.stopPropagation();
    console.log(e.target);
    $('.menu_work').toggleClass('show');
    $('.menu_work .item').on('click', function () {
      var value = $(this).html();
      $('#status').attr("value", value);
      $('.status_text').html(value).css('color','black');
    })
  })
  $(document).click(function(){
    $('.menu_work').removeClass('show');
    $('.menu_occupation').removeClass('show');
    $('.menu_direction').removeClass('show');
  });
  // 选择职业方向
  $('.dropdown_occupation').on('click', function (e) {
    if( $('.menu_direction').hasClass('show')){
      $('.menu_direction').toggleClass('show');
    }
    if( $('.menu_work').hasClass('show')){
      $('.menu_work').toggleClass('show');
    }
    e.stopPropagation();
    $('.menu_occupation').toggleClass('show');
    $('.menu_occupation .item').on('click', function () {
      var value = $(this).html();
      $('#occupation').attr("value", value);
      $('.occupation_text').html(value).css('color','black');
    })
  })
  // 选择具体职业
  $('.dropdown_direction').on('click', function (e) {
    if( $('.menu_work').hasClass('show')){
      $('.menu_work').toggleClass('show');
    }
    if( $('.menu_occupation').hasClass('show')){
      $('.menu_occupation').toggleClass('show');
    }
    e.stopPropagation();
    $('.menu_direction').toggleClass('show');
    $('.menu_direction .item').on('click', function () {
      var value = $(this).html();
      $('#direction').attr("value", value);
      $('.direction_text').html(value).css('color','black');
    })
  })


let i=1;
let j=1;
// 工作经历
  $('.J_ResumeFields').on('click',".J_AddResume",function(){
    i++;
    let that=$(this).parent().parent()
    cloneItem(that,".J_ResumeFields")
  })

  // 教育
  $('.J_EduFields').on('click',".J_Add",function(){
    j++
    let that=$(this).parent().parent()
    cloneItem(that,".J_EduFields")
  })

  // 删除 工作经历
  $('.J_ResumeFields').on('click',".mb20 .trash",function(){
    let that=$(this)
    if(i>1){
      dalete(that);
      i--;
    }else{
      alert("至少需要保留一条数据")
      return;
    }
  })
  // 删除 教育经历
  $('.J_EduFields').on('click',".mb20 .fields .trash",function(){
    let that=$(this)
    if(j>1){
      dalete(that);
      j--;
    }else{
      alert("至少需要保留一条数据")
      return;
    }
  })
  // 克隆函数
  function cloneItem(clonebox,mainbox){
    $(clonebox).clone().appendTo(mainbox);
  }
  // 移除函数
  function dalete(that){
    that.parent().parent().remove('.mb20')
  }
  
  // 初始化富文本
    var E = window.wangEditor;
    // var editor2 = new E('#content');
    var editor2 = new E('.richText');
    editor2.create()

})