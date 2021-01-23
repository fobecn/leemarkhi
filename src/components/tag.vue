<template>
  <div class="tag">
    <el-card class="box-card">
      <div slot="header" class="clearfix align-items-center">
        <img class="card-icon" src="../assets/biaoqian.png" />
        <span>标签</span>
        <el-button
          class="ml-auto"
          style="float: right; padding: 3px 0"
          type="text"
        >
        </el-button>
      </div>
      <div class="text item">
        <el-form
          :model="labelForm"
          ref="labelForm"
          :inline="true"
          v-show="isLogin"
        >
          <el-form-item label-width="30px">
            <el-input
              v-model="labelForm.name"
              placeholder="输入需要添加的标签名称"
            ></el-input>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="addLabel">添加</el-button>
          </el-form-item>
        </el-form>

        <el-tag
          v-show="isLogin"
          size="mini"
          class="tag-item"
          @click="tag('Java')"
          type="info"
          closable
          @close="deleteLabel(item.id)"
          v-for="item in labels"
          :key="item.id"
          >{{ item.name }}</el-tag
        >

        <el-tag
          v-show="!isLogin"
          size="mini"
          class="tag-item"
          @click="tag('Java')"
          type="info"
          v-for="item in labels"
          :key="item.id"
          >{{ item.name }}</el-tag
        >
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      labelForm: {
        name: "",
      },
      labels: [],
      isLogin: false,
    };
  },

  name: "tag",
  methods: {
    tag(name) {
      this.$router.push({
        name: "tag",
        params: {
          name: name,
        },
      });
    },
    addLabel() {
      this.$api.post("/blog/home/labels", this.labelForm).then((response) => {
        if (response.success) {
          this.labelForm.name = "";
          this.labels.push(response.content);
        }
      });
    },
    deleteLabel(id) {
      var that = this;
      if (window.confirm("确定删除改内容？")) {
        this.$api
          .post("/blog/home/labels/" + id + "/delete")
          .then((response) => {
            if (response.success) {
              for (var i = 0; i < that.labels.length; i++) {
                if (id === that.labels[i].id) {
                  that.labels.splice(i, 1);
                  break;
                }
              }
            }
          });
      }
    },
  },
  created() {
    var that = this;
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

    let token = localStorage.getItem("token");
    if (token != null && token.length > 0) {
      this.isLogin = true;
    }
  },
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