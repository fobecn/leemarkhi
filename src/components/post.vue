<template>
  <div class="tag">
    <el-card class="box-card">
      <div class="text item">
        <el-form :model="postForm" ref="postForm">
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
                v-if="postForm.image"
                style="width: 100%"
                :src="postForm.image"
                class="oss-upload-img"
              />
              <i v-else class="el-icon-plus uploader-icon"></i>
            </el-upload>
          </el-form-item>

          <el-form-item>
            <el-input
              v-model="postForm.content"
              placeholder="输入标题"
            ></el-input>
          </el-form-item>

          <el-form-item>
            <el-select
              v-model="postForm.labels"
              multiple
              placeholder="请选择标签"
              value-key="id" 
            >
              <el-option
                v-for="item in labels"
                :key="item.id"
                :label="item.name"
                :value="item"
              >
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              style="width: 100% !important"
              @click="post"
              >+添加</el-button
            >
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      postForm: {
        content: "",
        image: "",
        labels: [],
        ratio: 0,
      },
      labels: [],
    };
  },

  name: "post",
  methods: {
    tag(name) {
      this.$router.push({
        name: "tag",
        params: {
          name: name,
        },
      });
    },
    post() {
      this.$api.post("/blog/home/posts", this.postForm).then((response) => {
        if (response.success) {
          console.log(response);
        }
      });
      this.postFormVisible = false;
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
              this.postForm.image = data.host + keyValue;

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

          var that=this

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

      var reader = new FileReader();
      reader.onload = function (event) {
        var txt = event.target.result;
        var img = document.createElement("img");
        img.src = txt;
        img.onload = function () {
           console.log(img.width);
          console.log(img.height);
          that.postForm.ratio = img.height /img.width   ;
                     console.log(that.postForm.ratio );

        };
      };
      reader.readAsDataURL(file);
    },
    handleChange(response, file, fileList) {
      console.log(file.file.o);

      var image = new Image();

      alert(image.width);
    },
  },
  created(){
    var that=this
          this.$api.get('/blog/plaza/labels?userId=1&page=0&size=200').then(function(response){
              if(response.success){
                 that.labels = response.content ? response.content : []
              }
          }).catch(function(error){
                console.log(error);
          })
  }
};
</script>

<style scoped>
.box-card .item:hover {
  color: #409eff;
  cursor: pointer;
}

.box-card span {
  font-weight: bold;
}

.card-icon {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}

.tag-item {
  margin-right: 10px;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}
.clearfix:after {
  clear: both;
}
</style>