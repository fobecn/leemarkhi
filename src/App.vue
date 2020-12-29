<template>
  <div id="app">
  
    <el-container>
      <el-header>

        <el-row :gutter="20">
        <el-col :span="5"><div class="grid-content bg-purple">leemarkhi.com</div></el-col>
        <el-col :span="14"><div class="grid-content bg-purple">_</div></el-col>

  <el-col :span="5">

    <el-menu   class="el-menu-demo" mode="horizontal" >

          <el-submenu index="1">
            <template slot="title">我的工作台</template>
            <el-menu-item index="2-1">发布（上传）</el-menu-item>
            <el-menu-item index="2-2">素材管理</el-menu-item>
          </el-submenu>

          <el-menu-item index="2">广告位管理</el-menu-item>
          <el-menu-item index="3">
            <el-button type="text" @click="loginFormVisible = true">登录</el-button>
 
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
          </el-menu-item>

          <el-menu-item index="4" @click="logout">登出</el-menu-item>
        </el-menu>
  </el-col>
</el-row>
      </el-header>
      <el-main >
        <div>
<el-upload
     list-type="picture-card"

      class="oss-upload"
      ref="upload"
      action
      :show-file-list="false"
      :before-upload="uploadBefore"
      :http-request="picUpload"
      :on-success="handleChange"
    >

 <img v-if="imageUrl"  width="100%" :src="imageUrl" class="oss-upload-img" />
      <i v-else class="el-icon-plus uploader-icon"></i>
    </el-upload>
            <el-button @click.native="upload">Upload</el-button>
            <el-button @click.native="home">Home</el-button>
            <el-button @click.native="plaza">Plaza</el-button>
    </div>
        </el-main>
      <el-footer>
           &copy; 2021 广州撞石网络信息科技有限公司 <a href="http://www.beian.miit.gov.cn">沪ICP备14047332号-1</a>
        </el-footer>
    </el-container>
    
  </div>
</template>

<script>

export default {
  data(){
    return {
        dialogFormVisible: false,
        loginFormVisible: false,

        loginForm: {
          account: '',
          password: ''
        },
        formLabelWidth: '120px',
        imageUrl: '',
    }
  },
  methods: {
    startHacking () {
      this.$notify({
        title: 'It works!',
        type: 'success',
        message: 'We\'ve laid the ground work for you. It\'s time for you to build something epic!',
        duration: 5000
      })
    },
    token: function(){
      alert(this.$store.state.token)
    },
    login () {

      // const loading = this.$loading({
      //     lock: true,
      //     text: 'Loading',
      //     spinner: 'el-icon-loading',
      //     background: 'rgba(0, 0, 0, 0.7)'
      //   });

      this.loginFormVisible = false,
      this.$api.post("/login",this.loginForm).then((response) => {
        if(response.success){
          console.log(response)
          this.$store.state.token = 'Bearer ' + response.content.token
        }
      })
      // this.$message({ 
      //     message: '登录成功.',
      //     type: 'success'
      //   });
      
      // alert(this.$store.state.token)
    },
    logout (){
      this.$store.state.token = ''
      this.$api.post("/logout",this.loginForm).then((response) => {
      })
    },
    home (){
      this.$api.get("/blog/home",this.loginForm).then((response) => {
        if(response.success){
          console.log(response)
        }
      })
    },
    plaza (){
      this.$api.get("/blog/plaza",this.loginForm).then((response) => {
        if(response.success){
          console.log(response)
        }
      })
    },
     get_suffix(filename) {
      let pos = filename.lastIndexOf('.')
      let suffix = ''
      if (pos != -1) {
        suffix = filename.substring(pos)
      }
      return suffix
    },
    random_string(len) {
      len = len || 32
      var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
      var maxPos = chars.length
      var pwd = ''
      for (let i = 0; i < len; i++) {
        pwd += chars.charAt(Math.floor(Math.random() * maxPos))
      }
      return pwd
    },
    async picUpload(file) {

      let pro = new Promise((resolve, rej) => {
        // 判断签名有没有过期
        var res = sessionStorage.getItem('ossToken')
        var timestamp = Date.parse(new Date()) / 1000
        if (res && res.expire - 3 > timestamp) {
          resolve(res)
        } else {
           this.$api.get('/ali/oss/signature').then(function(response){
              if(response.success){
                console.log(response.content);
                sessionStorage.setItem("ossToken",response.content)
                resolve(response.content)
              }
          }).catch(function(error){
                console.log(error);
          })
        }
      })
      var that = this
      pro.then(success => {
        var data = success
        var ossData = new FormData()
        ossData.append('name', file.file.name)
        //key就代表文件层级和阿里云上的文件名
        let filename = file.file.name
        let picName = this.random_string(10) + this.get_suffix(filename)
        let keyValue = data.dir +  picName
        ossData.append('key', keyValue)
        ossData.append('policy', data.policy)
        ossData.append('OSSAccessKeyId', data.accessid)
        ossData.append('success_action_status', 200)
        ossData.append('signature', data.signature)
        ossData.append('file', file.file, file.file.name)
        this.$axios
          .post(data.host, ossData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
          .then(res => {
            console.log(res)
            console.log(res.status)
            console.log(res.status == 200)

            if (res.status == 200) {
              //               console.log(imageUrl)

              // this.imageUrl = URL.createObjectURL(file.file.raw)

              let url = data.host  + keyValue
              this.url = url
              this.imageUrl = data.host  + keyValue
              console.log(url)

              // 这个URL就是上传后得到的绝对路径
              this.$emit('uploadSuccess', url)
            }
          })
          .catch(error => {})
      })
    },
    uploadBefore(file) {
      // 上传文件之前校验图片格式和大小
      const isJPG = file.type === 'image/svg+xml' || file.type === 'image/png' || file.type === 'image/jpeg'
      const isLt5M = file.size / 1024 / 1024 < 5
      if (!isJPG) {
        this.$message.error('上传图片只能是 PNG、SVG 格式!')
        return false
      }
      if (!isLt5M) {
        this.$message.error('上传图片大小不能超过5MB!')
        return false
      }
    },
    handleChange(){

    }
  }
}
</script>

<style>
#app {
  font-family: Helvetica, sans-serif;
  text-align: center;
}

.el-header, .el-footer {
    background-color: #B3C0D1;
    color: #333;
    text-align: center;
    line-height: 60px;
  }
  
  .el-aside {
    background-color: #D3DCE6;
    color: #333;
    text-align: center;
    line-height: 200px;
  }
  
  .el-main {
    background-color: #E9EEF3;
    color: #333;
    text-align: center;
    line-height: 160px;
  }
  
  body > .el-container {
    margin-bottom: 40px;
  }
  
  .el-container:nth-child(5) .el-aside,
  .el-container:nth-child(6) .el-aside {
    line-height: 260px;
  }
  
  .el-container:nth-child(7) .el-aside {
    line-height: 320px;
  }

  .header h3 {
    margin-top: 0;
    margin-bottom: 0;
    line-height: 40px;
  }
</style>
