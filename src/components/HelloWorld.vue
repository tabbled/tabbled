<script lang="ts">
//import { ref } from 'vue'
import { defineComponent, defineProps } from 'vue';
//import internal from "stream";
const props = defineProps<{
    msg: string
    count: number
}>()

export default defineComponent({
    data() {
        return {
            count: 0
        }
    },
    mounted() {
        console.log("mounted hello-world")
        this.count = 0
        console.log(this)
    },
    beforeUpdate() {
        // do something
    },
    methods: {
        handle() {
             this.count++;
            this.$root.login('wulff007@gmail.com', 'Fsx75u__').then(res => {
                console.log('login', res)
            })
            //this.$root.findOneUser('ssss')
        }
    }
})


</script>

<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <button type="button" @click="handle">count is {{ count }}</button>
    <p>
      Edit
      <code>components/HelloWorld.vue</code> to test HMR
    </p>
  </div>

  <p>
    Check out
    <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank"
      >create-vue</a
    >, the official Vue + Vite starter
  </p>
  <p>
    Install
    <a href="https://github.com/johnsoncodehk/volar" target="_blank">Volar</a>
    in your IDE for a better DX
  </p>
  <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
