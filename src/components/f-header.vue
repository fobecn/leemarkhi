<template>
  <div>
    <el-menu
      :default-active="activeIndex"
      class="d-flex"
      mode="horizontal"
      router="true"
      type="flex"
    >
      <el-menu-item class="mr-auto">LEEMARKHI</el-menu-item>
      <el-menu-item index="/home">首页</el-menu-item>
      <el-menu-item index="/archive">归档</el-menu-item>
      <el-menu-item index="/about">关于</el-menu-item>
      <el-menu-item
        v-if="isLogin"
        index="/login"
        @click="loginFormVisible = true"
        >登录</el-menu-item
      >
      <el-menu-item v-else index="/logout" @click="logout">登出</el-menu-item>
    </el-menu>

    <el-dialog title="登录" :visible.sync="loginFormVisible">
      <el-form :model="loginForm">
        <el-form-item label="账号" :label-width="formLabelWidth">
          <el-input v-model="loginForm.account" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码" :label-width="formLabelWidth">
          <el-input v-model="loginForm.password" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="loginFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="login">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeIndex: "/home",
      loginFormVisible: false,
      isLogin: false,
      loginForm: {
        account: "",
        password: "",
      },
    };
  },
  methods: {
    toggleLang(lang) {
      if (lang === "zh") {
        localStorage.setItem("locale", "zh");
        this.$i18n.locale = localStorage.getItem("locale");
        this.$message({
          message: "切换为中文！",
          type: "success",
        });
      } else if (lang === "en") {
        localStorage.setItem("locale", "en");
        this.$i18n.locale = localStorage.getItem("locale");
        this.$message({
          message: "Switch to English!",
          type: "success",
        });
      }
    },
    login() {
      (this.loginFormVisible = false),
        this.$api.post("/login", this.loginForm).then((response) => {
          if (response.success) {
            localStorage.setItem("token", "Bearer " + response.content.token);
            this.token = "Bearer " + response.content.token;
            location.reload();
          }
        });
    },
    logout() {
       this.$api.post("/logout", this.loginForm).then(() => {
        this.token = "";
        localStorage.removeItem("token");
        location.reload();
      });
    },
  },
  created() {
    if (!localStorage.getItem("token")) {
      this.isLogin = true;
    }
  },
};
</script>

<style scoped>
</style>