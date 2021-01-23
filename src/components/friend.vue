<template>
  <div class="friend">
    <el-card class="box-card">
      <div slot="header" class="d-flex align-items-center">
        <img class="card-icon" src="../assets/lianjie.png" />
        <span>广告</span>
      </div>

      <el-form :model="adForm" v-show="this.isLogin">
        <el-form-item style="width: 100%">
          <el-upload
            class="ad-uploader"
            list-type="picture-card"
            ref="upload"
            action
            :show-file-list="false"
            :before-upload="uploadBefore"
            :http-request="picUpload"
            :on-success="handleChange"
          >
            <img
              v-if="adForm.image"
              style="width: 100% !important"
              :src="adForm.image"
              class="oss-upload-img ad-uploader"
            />
            <i
              v-else
              class="el-icon-plus uploader-icon ad-uploader"
              style="width: 100% !important"
            ></i>
          </el-upload>
        </el-form-item>
        <el-form-item>
          <el-input v-model="adForm.name" placeholder="广告名称"></el-input>
        </el-form-item>

        <el-form-item>
          <el-input v-model="adForm.link" placeholder="广告链接"></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" style="width: 100%" @click="addAd()">+添加</el-button>
        </el-form-item>
      </el-form>

      <el-card :body-style="{ padding: '0px' }" v-for="item in ads" :key="item.id">
        <a :href="item.link" target="_blank">
        <img
          :src="item.image"
          class="image"
        /></a>
        <div style="padding: 14px">
          <span>{{item.name}}</span>
          <div class="bottom clearfix">
            <!-- <time class="time">广告</time> -->
            <el-button
               class="card-icon"
              style="float: right; padding: 0px 0; width: 25px; height: 20px"
              icon="el-icon-delete"
              v-show="isLogin" 
             @click="adDelete(item.id)"

            ></el-button>
          </div>
        </div>
        
      </el-card>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isLogin: false,
      adForm: {
        image: '',
        name: "",
        link: "",
      },
      ads: [],

    };
  },
  methods: {
    addAd() {
      this.$api.post("/blog/home/advertisements", this.adForm).then((response) => {
        if (response.success) {
          this.ads.unshift(response.content);
           this.adForm = {
             name: "",
            link: "",
          };
        }
      });
    },

    adDelete(id) {
      var that = this;

      if (window.confirm("确定删除改内容？")) {
        //alert("确定");
        this.$api
          .post("/blog/home/advertisements/" + id + "/delete")
          .then((response) => {
            if (response.success) {
              for (var i = 0; i < that.ads.length; i++) {
                if (id === that.ads[i].id) {
                  that.ads.splice(i, 1);
                  break;
                }
              }
            }
          });
      } else {
        //alert("取消");
      }
    },

    get_suffix(filename) {
      let pos = filename.lastIndexOf(".");
      let suffix = "";
      if (pos != -1) {
        suffix = filename.substring(pos);
      }
      return suffix;
    },
    random_string(len) {
      len = len || 32;
      var chars = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
      var maxPos = chars.length;
      var pwd = "";
      for (let i = 0; i < len; i++) {
        pwd += chars.charAt(Math.floor(Math.random() * maxPos));
      }
      return pwd;
    },
    async picUpload(file) {
      let pro = new Promise((resolve, rej) => {
        // 判断签名有没有过期
        var res = sessionStorage.getItem("ossToken");
        var timestamp = Date.parse(new Date()) / 1000;
        if (res && res.expire - 3 > timestamp) {
          resolve(res);
        } else {
          this.$api
            .get("/ali/oss/signature")
            .then(function (response) {
              if (response.success) {
                sessionStorage.setItem("ossToken", response.content);
                resolve(response.content);
              }
            })
            .catch(function (error) {});
        }
      });
      var that = this;
      pro.then((success) => {
        var data = success;
        var ossData = new FormData();
        ossData.append("name", file.file.name);
        //key就代表文件层级和阿里云上的文件名
        let filename = file.file.name;
        let picName = this.random_string(10) + this.get_suffix(filename);
        let keyValue = data.dir + picName;
        ossData.append("key", keyValue);
        ossData.append("policy", data.policy);
        ossData.append("OSSAccessKeyId", data.accessid);
        ossData.append("success_action_status", 200);
        ossData.append("signature", data.signature);
        ossData.append("file", file.file, file.file.name);
        this.$axios
          .post(data.host, ossData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          .then((res) => {
            if (res.status == 200) {
              //               console.log(imageUrl)

              // this.imageUrl = URL.createObjectURL(file.file.raw)

              let url = data.host + keyValue;
              this.url = url;
              this.adForm.image = data.host + keyValue;

              var image = new Image();

              //   this.postForm.ratio = image.width / image.height;
              //   alert(image.width)

              // 这个URL就是上传后得到的绝对路径
              this.$emit("uploadSuccess", url);
            }
          })
          .catch((error) => {});
      });
    },
    uploadBefore(file) {
      var that = this;

      // 上传文件之前校验图片格式和大小
      const isJPG =
        file.type === "image/svg+xml" ||
        file.type === "image/png" ||
        file.type === "image/jpeg";
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isJPG) {
        this.$message.error("上传图片只能是 PNG、SVG 格式!");
        return false;
      }
      if (!isLt5M) {
        this.$message.error("上传图片大小不能超过5MB!");
        return false;
      }
    },
    handleChange(response, file, fileList) {},
  },
  created() {
    var that = this;
    this.$api
      .get("/blog/plaza/advertisements?userId=1&page=0&size=20")
      .then(function (response) {
        if (response.success) {
          that.ads = response.content ? response.content : [];
        }
      })
      .catch(function (error) {
       });

    let token = localStorage.getItem("token");
    if (token != null && token.length > 0) {
      this.isLogin = true;
    }
  },
  name: "friend",
};
</script>

<style scoped>
.width-100 {
  width: 100%;
}
.box-card .item a {
  text-decoration: none;
  /*color: #F56C6C;*/
}
.box-card span {
  font-weight: bold;
}
.card-icon {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}
.image {
  width: 100%;
  display: block;
}

.ad-uploader {
  width: 100% !important;
}
</style>