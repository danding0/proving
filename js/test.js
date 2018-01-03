define(function (require, exports, module) {
  var WorksEditor = require('inn/widget/works_editor');
  var SkillsEditor = require('inn/widget/skills_editor');
  require('datetimepicker');
  var core = require('core');
  var util = require('../util');
  var ImageUploader = require('inn/widget/image_uploader');
  var BindMobileWidget = require('../widget/bind_mobile');
  var $infoLoadingPage = '<div class="ui active inverted dimmer"><div class="ui text loader"></div></div>';
  var page = {
    init: function (data) {
      this.data = data;
      // 作品编辑器
      new WorksEditor($('[data-widget="works-editor"]'));
      this.initSkillsEditor();
      this.initAccordion();
      this.events();
      this.initCommon();
      this.selectWorkTime();
      this.selectAddress();

      if ($('#settingform .J_Company').length) {
        this.initCompanySelect();
      }
      if ($('#settingform .J_Title').length) {
        this.initTitleSelect();
      }
    },
    fetchSelectData: function (url, query, callback) {
      core.ajax.post({
        url: url,
        data: {
          keyword: query
        }

      }).done(function (res) {
        callback && callback(res);
      });
    },
    showError: function (message) {
      $('#customized_footer_dimmer_info').html('<i class="red warning sign icon"></i>' + message);
      $('#footer_dimmer').dimmer('show');
    },
    initCompanySelect: function () {
      var _this = this;
      var url = '/api/simple_data/select_company';
      var $selectize = $('#settingform .J_Company').selectize({
        valueField: 'name',
        labelField: 'name',
        searchField: 'name',
        create: true,
        maxOptions: 5,
        render: {
          option: function (item, escape) {
            return '<div>' + item.name + '</div>';
          }
        },
        load: function (query, callback) {
          if (!query.length) return callback();
          _this.fetchSelectData(url, query, function (res) {
            callback(res.data);
          });
        }
      });
      var selectize = $selectize[0].selectize;
      this.fetchSelectData(url, '', function (res) {
        selectize.addOption(res.data);
      });
    },
    initTitleSelect: function () {
      var _this = this;
      var url = '/api/simple_data/select_title';
      var $selectize = $('#settingform .J_Title').selectize({
        valueField: 'name',
        labelField: 'name',
        searchField: 'name',
        create: true,
        maxOptions: 5,
        render: {
          option: function (item, escape) {
            return '<div>' + item.name + '</div>';
          }
        },
        load: function (query, callback) {
          if (!query.length) return callback();
          _this.fetchSelectData(url, query, function (res) {
            callback(res.data);
          });
        }
      });
      var selectize = $selectize[0].selectize;
      this.fetchSelectData(url, '', function (res) {
        selectize.addOption(res.data);
      });
    },
    selectWorkTime: function () {
      $('.J_WorkTime.end').each(function () {
        if (this.value) {
          $(this).parent().find('.checkbox input').attr('checked', true);
        }
      });
      $('.J_WorkTime').datetimepicker({
        format: "H:i",
        datepicker: false,
        defaultSelect: false
      });
    },
    selectAddress: function () {
      $(".province_list").live('click', function () {
        var province = $("#province").attr("value");
        $('#loding_div').html($infoLoadingPage);
        $.ajax({
          type: "POST",
          url: baseUrl + "setting/ajax",
          data: "provinceAjax=" + province,
          datatype: "text",
          success: function (list) {
            $('#loding_div').html('');
            $("#city").parent().html(list);
            $('.dropdown').dropdown({
              transition: 'drop'
            });
            getDistrict();
          }
        });
      });
      $('.J_City').on('click', '.item', function () {
        var city = $("#city").attr("value");
        getDistrict()
      });

      function getDistrict() {
        var city = $('#city').val();
        $('#loding_div').html($infoLoadingPage);
        $('.J_District .text').text('');
        $(".J_District").find('.menu').html('');
        $.ajax({
          type: "POST",
          url: '/api/geo/get_district_list_by_city',
          data: {
            city_id: city
          },
          success: function (res) {
            $('#loding_div').html('');
            var html = '';
            if (res.data.length) {
              html = res.data.map(function (item, index) {
                return '<div class="item city_list" data-value="' + item.id + '">' + item.name + '</div>';
              });
              $(".J_District").find('.menu').html(html);
              $('.J_District .text').removeClass('default').text(res.data[0].name);
              $('.dropdown').dropdown({
                transition: 'drop'
              });
            }
          }
        });
      }
    },
    // 技能编辑器
    initSkillsEditor: function () {
      var me = this;
      var $container = $('[data-widget="skills-editor"]');
      new SkillsEditor($container);
      $('#skills_submit_btn').on('click', function () {
        var data = $container.find('[name]').serialize();
        data += '&action=saveSkills';
        if ($('.J_SkillSelect').val() == '') {
          me.showError('请填写您的技能');
          return;
        }
        if ($('.worksfields[data-id]').length < 3) {
          me.showError('请至少填写3个作品');
          return;
        }
        var wokrsInfo = true;
        var worksFlag = 1;
        $('.worksfields').each(function () {
          var $item = $(this);
          worksFlag = $(this).index() + 1;
          if ($item.find('.worksname').val() == '') {
            wokrsInfo = false;
          } else if ($item.find('.worksurl').val() == '') {
            wokrsInfo = false;
          } else if ($item.find('.duty').val() == '') {
            wokrsInfo = false;
          } else if ($item.find('.description').val() == '') {
            wokrsInfo = false;
          } else if ($item.find('.industry_id').val() == 0) {
            wokrsInfo = false;
          } else if (!$item.find("input[name='function']:checked").length) {
            wokrsInfo = false;
          }
          if (!wokrsInfo) {
            return false;
          }
        });
        if (!wokrsInfo) {
          me.showError('请完善第' + worksFlag + '个作品信息');
          return false;
        }
        $('#J_Loading').html($infoLoadingPage);
        inn.ajax.post({
          url: '/outsource/developer',
          data: data
        }).done(function (data) {
          $('#J_Loading').html('');
          if (data.status) {
            location.href = '/sign/identity'
          } else {
            me.showError(data.info);
          }
        }).fail(function () {
          $('#J_Loading').html('');
        });
      });
    },
    initImageUpload: function () {
      this.uploader1 = new ImageUploader($('#upload1'), {
        formData: {
          'file_group': 'developer_auth'
        }
      });
      this.uploader2 = new ImageUploader($('#upload2'), {
        formData: {
          'file_group': 'developer_auth'
        }
      });
      this.uploader3 = new ImageUploader($('#upload3'), {
        formData: {
          'file_group': 'work_identity_auth'
        }
      });
    },
    initAccordion: function () {
      var self = this;
      var $accordion = $('.ui.accordion');
      var names = [];
      var i = 0;
      $('.ui.accordion .title').each(function () {
        var name = $(this).attr('class').replace('title', '').trim();
        names.push(name);
      })

      $accordion.accordion({
        onChange: function () {
          if (!self.initImageUploadRun && $('.title.realinfo').hasClass('active')) {
            self.initImageUploadRun = true;
            self.initImageUpload();
          }
        }
      });

      function open(name) {
        var index = names.indexOf(name);
        if (index >= 0) {
          $accordion.accordion('open', index);
        }
      }
      /* var openName;
       if (!this.data.personinfo) {
           openName = 'personinfo';
       } else if (!this.data.realinfo) {
           openName = 'realinfo';
       } else if (!this.data.resumeinfo) {
           openName = 'resumeinfo';
       } else if (!this.data.worksinfo) {
           openName = 'worksinfo';
       } else if (!this.data.skillsinfo) {
           openName = 'skillsinfo';
       }

       if (openName) {
           open(openName);
       }*/
    },
    events: function () {
      $('[name="work_area_checkbox"]').on('change', function () {
        if ($(this).prop('checked')) {
          // 选中
          $('.work-area-input').prop('disabled', false).val($('#J_WorkAreaTxt').html());
          $('#J_WorkAreaTxt').html('').hide();
        } else {
          // 未选中
          var $input = $('.work-area-input'),
            txt = $input.val() || $input.attr('placeholder');
          $input.prop('disabled', true).val('');
          $('#J_WorkAreaTxt').show().html(txt);
        }
      });
      $('.verified').on('click', function () {
        alert('修改手机号请联系右下角在线客服');
      });
    },
    initCommon: function () {
      var self = this;
      // 已参考个人资料
      $('#haveReadSample input').on('change', function () {
        var checked = $(this).is(":checked");
        $.ajax({
          type: 'POST',
          url: '/outsource/developer',
          dataType: 'json',
          data: {
            action: 'haveReadSample',
            checked: checked ? 1 : 0,
          }
        }).done(function (data) {
          window.location.reload();
        });
      });

      $('.fonctioncategory')
        .popup({
          inline: true,
          hoverable: true,
          position: 'bottom left',
          delay: {
            show: 300,
            hide: 800
          }
        });

      $(".field").on('click', '.occupation_list', function () {
        var occupation = $("#occupation").attr("value");
        $('#loding_div').html($infoLoadingPage);
        $.ajax({
          type: "POST",
          url: baseUrl + "setting/ajax",
          data: "selectOccupation=" + occupation,
          datatype: "text",
          success: function (direction) {
            $('#loding_div').html('');
            $("#direction").parent().html(direction);
            $('.dropdown').dropdown({
              transition: 'drop'
            });
          }
        });
      });
      $(".field").on('click', '.province_list', function () {
        var province = $("#province").attr("value");
        $('#loding_div').html($infoLoadingPage);
        $.ajax({
          type: "POST",
          url: baseUrl + "setting/ajax",
          data: "provinceAjax=" + province,
          datatype: "text",
          success: function (list) {
            $('#loding_div').html('');
            $("#city").parent().html(list);
            $('.dropdown').dropdown({
              transition: 'drop'
            });
          }
        });
      });

      function validateInfoForm(field) {
        var $form = $('#settingform');
        var rules = {
          introduction: function (value) {
            if (value == undefined) {
              return;
            }
            value = value.trim();
            if (value === '') {
              return '简介不能为空';
            }
            if (value.length < 2) {
              return '简介太短了';
            }
            if (value.length > 50) {
              return '简介太长了';
            }
            return '';
          },
          work_price: function (value) {
            if (value == '') {
              return;
            }
            value = parseInt(value.trim());
            if (!value) {
              return '日薪必须为数字';
            } else if (value > 2000 || value < 300) {
              return "日薪超出范围";
            }
            return '';
          }
        }
        var firstError = '';
        for (var k in rules) {
          var $input = $form.find('[name=' + k + ']');
          var v = $input.val();
          var err = rules[k](v);
          if (err) {
            $input.closest('.field').toggleClass('error', true);
            if (!firstError) {
              firstError = err;
            }
          } else {
            $input.closest('.field').toggleClass('error', false);
          }
        }
        return firstError;
      }

      function validateRealForm(field) {
        var $form = $('#real_settingform');
        var rules = {
          realname: function (value) {
            value = value.trim();
            if (value === '') {
              return '姓名不能为空';
            }
          },
          id_card_no: function (value) {
            value = value.trim();
            if (value === '') {
              return '身份证号码不能为空';
            }
            if (!/^(\d{15}|\d{17}[\dx])$/i.test(value)) {
              return '身份证号错误';
            }
          },
          alipay: function (value) {
            value = value.trim();
            if (value === '') {
              return '支付宝帐号不能为空';
            }
          },
          weixin: function (value) {
            /*if (value.trim() === '') {
                return '微信不能为空';
            }*/
          },
          qq: function (value) {
            /*if (value.trim() === '') {
                return 'QQ不能为空';
            }*/
          },
          email: function (value) {
            if (!/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(value)) {
              return '请输入正确的邮箱格式';
            }
          }
        };
        for (var k in rules) {
          var $input = $form.find('[name=' + k + ']');
          var v = $input.val();
          var err = rules[k](v);
          if (err) {
            $input.parent('.field').addClass('error');
            return err;
          } else {
            $input.parent('.field').removeClass('error');
          }
        }
        return false;
      }

      $("#set_submit").click(function () {
        $(this).addClass('loading');
        var industry = $('#industry').val();
        var direction = $('#direction').val();
        var company = $('.J_Company').val();
        var title = $('.J_Title').val();
        var city = $('#city').val();
        var err = validateInfoForm();
        if (industry == '0') {
          $("#set_submit").removeClass('loading');
          $('#set_submit').html('请选择行业类型');
          return;
        }
        if (direction == '0') {
          $("#set_submit").removeClass('loading');
          $('#set_submit').html('请选择职业');
          return;
        }
        if (company == '') {
          $("#set_submit").removeClass('loading');
          $('#set_submit').html('请输入公司名称');
          return;
        }
        if (title == '') {
          $("#set_submit").removeClass('loading');
          $('#set_submit').html('请输入职位名称');
          return;
        }
        if (city == '0') {
          $("#set_submit").removeClass('loading');
          $('#set_submit').html('请选择城市');
          return;
        }
        if (err) {
          $('#set_submit').html(err);
          $("#set_submit").removeClass('loading');
        } else {
          var timeLen = $('.J_SelectTime .checkbox input:checked').length;
          var flag = 1;
          var workdayStart = '';
          var workdayEnd = '';
          var weekendStart = '';
          var weekendEnd = '';
          if (!timeLen) {
            $("#set_submit").removeClass('loading');
            $("#set_submit").html('<i class="remove icon"></i>请选择可工作时间');
            return;
          }
          $('.J_SelectTime .checkbox input:checked').each(function () {
            var $item = $(this).parents('.J_SelectTime');
            var startTime = $item.find('.start').val();
            var endTime = $item.find('.end').val();
            var type = $item.find('label').text();
            if (!startTime) {
              $("#set_submit").html('<i class="remove icon"></i>请选择' + type + '的开始时间');
              flag = 0;
            } else if (!endTime) {
              $("#set_submit").html('<i class="remove icon"></i>请选择' + type + '的结束时间');
              flag = 0;
            } else if (startTime == endTime) {
              $("#set_submit").html('<i class="remove icon"></i>' + type + '的结束时间不能等于开始时间');
              flag = 0;
            }
            if ($item.data('type') == 'workday') {
              workdayStart = $item.find('.start').val();
              workdayEnd = $item.find('.end').val();
            } else {
              weekendStart = $item.find('.start').val();
              weekendEnd = $item.find('.end').val();
            }
          });
          if (!flag) {
            $("#set_submit").removeClass('loading');
            return;
          }
          $('.J_WorkTimeVal').val('{ "workday": ["' + workdayStart + '", "' + workdayEnd + '"], "weekend": ["' + weekendStart + '", "' + weekendEnd + '"] }');
          var formData = $('#settingform').serialize();
          if (!$('#settingform input[name="work_remote"]').prop('checked')) {
            formData += '&work_remote=0'
          }
          if (!$('#settingform input[name="work_area"]').prop('checked')) {
            formData += '&work_area=0'
          }
          $.post("/ajax/saveUserInfo", formData, function (data) {
            $('#loding_div').html('');
            if (data.status >= 0) {
              $("#set_submit").html('<i class="checkmark icon"></i>更新成功');
              window.location.reload();
            } else {
              $("#set_submit").html('<i class="remove icon"></i>' + data.info);
            }
            $("#set_submit").removeClass('loading');
          }, "json");
        }
      });
      var me = this;
      $("#real_submit").click(function () {
        var err = validateRealForm();
        if (err) {
          me.showError(err);
        } else {
          var formData = util.formData($("#real_settingform"));
          var id_card_images = [];
          var mobile = $('#J_Mobile').val();
          var image1 = self.uploader1.getFileInfo();
          var image2 = self.uploader2.getFileInfo();
          var workImg = $('#upload3 img').attr('src');
          var email = $('#email').val();
          var weixin = $('#weixin').val();
          if (image1) {
            id_card_images.push(image1._id);
          }

          if (image2) {
            id_card_images.push(image2._id);
          }
          var thumbnailImg1 = $('#upload1').attr('data-thumbnail'),
            thumbnailImg2 = $('#upload2').attr('data-thumbnail');
          if ((!image1 && !thumbnailImg1) || (!image2 && !thumbnailImg2)) {
            me.showError('请上传身份证照片');
            $('#J_Loading').html('');
            return;
          }

          if (id_card_images.length) {
            formData['id_card_images'] = id_card_images.join(',');
          }
          if (!mobile) {
            me.showError('请验证你的手机号码');
            return;
          }
          if (weixin == '') {
            me.showError('请输入你的微信');
            return;
          }
          if (!workImg) {
            me.showError('请添加一项工作证明图片');
            return;
          }
          $('#J_Loading').html($infoLoadingPage);
          $.post("/ajax/saveUserInfo", formData, function (data) {
            if (data.status) {
              $.ajax({
                type: "POST",
                url: baseUrl + "outsource/developer",
                data: {
                  action: 'join'
                },
                dataType: "json",
                success: function (data) {
                  $('#J_Loading').html('');
                  if (data.status == "yes") {
                    location.href = '/sign/success';
                  } else {
                    me.showError(data.info);
                  }
                }
              });
            } else {
              $('#J_Loading').html('');
              me.showError(data.info);
            }
          }, "json");
        }
      });

      $("#submit_btn").click(function () {
        $("#submit_btn").addClass("loading");
        $.ajax({
          type: "POST",
          url: baseUrl + "outsource/developer",
          data: {
            action: 'join'
          },
          dataType: "json",
          success: function (data) {
            $("#submit_btn").removeClass("loading")
            if (data.status == "yes") {
              $("#submitinfo").show().html('<i class="checkmark icon"></i>' + data.info);
              alert('您已成功提交申请，我们将在一天之内给您回复');
              location.href = '/outsource/todo';
            } else {
              $("#submitinfo").show().html('<i class="remove icon"></i>' + data.info);
            }
          }
        });
      });

      $("#save_workstatus").live("click", function () {
        var worktime = $("#work_time").val();
        var $this = $(this);
        $this.addClass("loading");
        $.ajax({
          type: "POST",
          url: baseUrl + "setting/changeworktime",
          data: {
            worktime: worktime
          },
          dataType: "json",
          success: function (response) {
            $this.removeClass("loading");
            if (response.status == 'yes') {
              $this.html("保存成功");
              var work_status = $("#work_status").attr("value");
              if (work_status == "-1") {
                $("#work_status").click();
                $("#save_workstatus_info").show().html("自动开启接单，在右侧关闭");
              }
              //setTimeout('window.location.reload()', 2000);
            } else {
              alert(response.info);
            }
          }
        });
      });

      $('#finish_works').on('click', function () {
        $(this).addClass("loading");
        if ($('.worksfields[data-id]').length < 3) {
          $('#finish_works_error').show().transition('shake');
          $(this).removeClass("loading");
          return false;
        }
        window.location.reload();
        return true;
      });
    }
  };

  module.exports = page;
});