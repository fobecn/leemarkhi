<template>
  <div class="home">
    <!--大图-->
    <el-image-viewer
      v-if="showViewer"
      :on-close="closeViewer"
      :url-list="viewerImgList"
    />

    <el-row id="artList" type="flex" justify="space-around">
      <el-col :span="16">
        <el-row>
          <waterfall :line-gap="200" :watch="posts">
            <waterfall-slot :width="200" :height="isLogin?402:0"  >
              <div >
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
            </waterfall-slot>
            <!-- each component is wrapped by a waterfall slot -->
            <waterfall-slot
              v-for="(item, index) in posts"
              :width="200"
              :height="200 * item.ratio + 45"
              :order="index"
              :key="index"
            >
              <!--
						your component
						-->
              <div>
                <el-card :body-style="{ padding: '0px' }">
                  <img
                    :src="
                      item.image + '?x-oss-process=image/resize,w_200,m_fixed'
                    "
                    @click="viwer(item.image)"
                    class="image"
                  />
                  <div style="padding: 7px">
                    <span
                      >{{ item.content }}

                      <el-button v-show="isLogin"
                        class="card-icon"
                        style="
                          float: right;
                          padding: 0px 0;
                          width: 25px;
                          height: 20px;
                        "
                        @click="postDelete(item.id)"
                        icon="el-icon-delete"
                      ></el-button>
                    </span>
                    <!-- <div class="bottom clearfix">
                      <time class="time">2020-01-01</time>
                      <el-button type="text" class="button">操作按钮</el-button>
                    </div> -->
                  </div>
                </el-card>
              </div>
            </waterfall-slot>
          </waterfall>
        </el-row>

        <div class="block pagination">
          <el-row :gutter="24">
            <el-col :span="8" :offset="9">
              <el-button
                style="width: 200px"
                @click.native="more()"
                v-show="isMore"
                >加载更多</el-button
              >

              <span v-show="!isMore">没有更多了</span>
            </el-col>
          </el-row>
        </div>
      </el-col>
      <el-col :span="6" class="hidden-sm-and-down" id="side">
        <div class="item">
          <tag></tag>
        </div>
        <div class="item">
          <friend></friend>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import friend from "../components/friend";
import tag from "../components/tag";
import Waterfall from "vue-waterfall/lib/waterfall";
import WaterfallSlot from "vue-waterfall/lib/waterfall-slot";
// 导入组件
import ElImageViewer from "element-ui/packages/image/src/image-viewer";

export default {
  name: "home",
  components: {
    friend,
    tag,
    // post,
    Waterfall,
    WaterfallSlot,
    ElImageViewer,
  },
  data() {
    return {
      fromCreateTime: "",
      postForm: {
        content: "",
        image: "",
        labels: [],
        ratio: 0,
      },
      labels: [],
      posts: [],
      showViewer: false,
      isMore: true,
      isLogin: false,
      viewerImgList: [],
      data: [],
      col: 5,
      image:
        "https://fuss10.elemecdn.com/8/27/f01c15bb73e1ef3793e64e6b7bbccjpeg.jpeg",
      loading: false,
      gitHubData: {},
      page: 0,
      size: 20,
      userId: 1,
    };
  },
  methods: {
    viwer(src) {
      // this.imgs[0] = src;
      // this.isShowImageDialog = true;
      this.showViewer = true;
      this.viewerImgList[0] = src;
    },
    closeViewer() {
      this.showViewer = false;
      this.viewerImgList = [];
    },
    clearImg() {
      this.imgs = [];
    },
    tag(name) {
      this.$router.push({
        name: "tag",
        params: {
          name: name,
        },
      });
    },
    more() {
      this.page = this.page + 1;
      var that = this;
      this.$api
        .get(
          "/blog/plaza/posts?userId=" +
            this.userId +
            "&page=" +
            this.page +
            "&size=" +
            this.size
        )
        .then(function (response) {
          if (response.success) {
            that.posts = that.posts.concat(response.content);
            if (response.content.length == 0) {
              that.isMore = false;
            }
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    post() {
      this.$api.post("/blog/home/posts", this.postForm).then((response) => {
        if (response.success) {
          this.posts.unshift(response.content);
          console.log(response);
          this.postForm = {
            content: "",
            image: "",
            labels: [],
            ratio: 0,
          };
        }
      });
      this.postFormVisible = false;
    },
    postDelete(id) {
      var that = this;

      if (window.confirm("确定删除改内容？")) {
        //alert("确定");
        this.$api
          .post("/blog/home/posts/" + id + "/delete")
          .then((response) => {
            if (response.success) {
              for (var i = 0; i < that.posts.length; i++) {
                if (id === that.posts[i].id) {
                  that.posts.splice(i, 1);
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

      var reader = new FileReader();
      reader.onload = function (event) {
        var txt = event.target.result;
        var img = document.createElement("img");
        img.src = txt;
        img.onload = function () {
          console.log(img.width);
          console.log(img.height);
          that.postForm.ratio = img.height / img.width;
          console.log(that.postForm.ratio);
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

  created() {
    var that = this;
    this.$api
      .get("/blog/plaza/posts?userId=1&page=0&size=" + this.size)
      .then(function (response) {
        if (response.success) {
          that.posts = response.content ? response.content : [];
        }
      })
      .catch(function (error) {
        console.log(error);
      });

    this.$api
      .get("/blog/plaza/labels?userId=1&page=0&size=200")
      .then(function (response) {
        if (response.success) {
          that.labels = response.content ? response.content : [];
        }
      })
      .catch(function (error) {
        console.log(error);
      });
     let token = localStorage.getItem("token")
    if (token != null &&  token.length > 0) {
      this.isLogin = true;
    }
  },
};
</script>

<style scoped>
#side .item {
  margin-bottom: 30px;
}

.art-item {
  margin-bottom: 30px;
  position: relative;
}

.art-item .star {
  width: 60px;
  height: 60px;
  position: absolute;
  top: 0;
  right: 0;
}

img.tag {
  width: 16px;
  height: 16px;
}

.art-title {
  border-left: 3px solid #f56c6c;
  padding-left: 5px;
  cursor: pointer;
}

.art-title:hover {
  padding-left: 10px;
  color: #409eff;
}

.art-time {
  margin-right: 20px;
}

.art-body {
  display: flex;
  padding: 10px 0;
}
span {
  font-size: 13px;
  color: #999;
}
.side-img {
  height: 150px;
  width: 270px;
  overflow: hidden;
  margin-right: 10px;
}

img.art-banner {
  width: 100%;
  height: 100%;
  transition: all 0.6s;
}

img.art-banner:hover {
  transform: scale(1.4);
}

.side-abstract {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.art-abstract {
  flex: 1;
  color: #aaa;
}

.art-more {
  height: 40px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.art-more .view {
  color: #aaa;
}
h5 {
  font-size: 18px;
}
.pagination {
  background-color: #f9f9f9;
}
</style>