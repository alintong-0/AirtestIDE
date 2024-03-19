Vue.component('base-checkbox', {
    model: {
      prop: 'checked',
      event: 'change'
    },
    props: {
      checked: Boolean,
      value: String
    },
    methods: {
      changevalue: function(checked) {
          this.checked = checked;
      }
    },
    watch: {
      checked: function(newVal, oldVal) {
        this.$emit("check-value", this.value, newVal);
      }
    },
    template: `
      <input
        type="checkbox"
        v-bind:checked="checked"
        v-on:change="$emit('change', $event.target.checked)"
        v-bind:value="value"
      >
    `
  });
  Vue.component('pfm-file-item', {
    props: ['name'],
    data: function () {
      return {
        selected: false
      }
    },
    template: `<label class="form-checkbox">
                <base-checkbox v-model="selected" v-bind:value="name" v-on:check-value="onCheckValue" ref="checkboxChild"></base-checkbox>
                <i class="form-icon"></i> {{ name }}
              </label>`,
    methods: {
      onCheckValue: function (v, checked) {
        this.$emit("check-value", v, checked);
      }
    },
    computed: {
      isChecked: function() {
        return this.$refs.checkboxChild.checked;
      }
    }
  });
  Vue.component('chip-list', {
      props: ['options'],
      methods: {
        cancelChecked: function(item) {
          this.$emit("click-close", item);
        }
      },
      template: `
            <div class="chip-list" >
            <div class="chip" v-for="item in options">
              {{ item }}
              <a href="javascript:void(0);" class="btn btn-clear" aria-label="Close" v-on:click="cancelChecked(item)" role="button"></a>
            </div>
            </div>
            `
  });
  var selectedFiles = ["file3"];
  var allFileList = ["file1", "file2", "file3"];
  Array.prototype.remove = function(val) {
    var index = this.indexOf(val);
    if (index > -1) {
    this.splice(index, 1);
    }
    };
  var app1 = new Vue({
    el: "#app-1",
    data: {
      options: allFileList,
      selectedOptions: ['file1'],
      filelist: [],
      temp: ""
    },
    methods: {
      onCheckValue: function (v, checked) {
        if (checked) {
          this.$refs.chiplist.options.push(v);
        } else {
          this.$refs.chiplist.options.remove(v);
        }
      },
      onCancelClicked: function(v) {
        this.$refs.headerChild.forEach(function (item) {
          if (item.name == v) {
            item.selected = false;
          }
        })
      }
    },
    computed: {
      checklist: function() {
        let temp = [];
        if (this.$refs && this.$refs.headerChild) {
            this.$refs.headerChild.forEach(function (item){
                if (item.isChecked) {
                    temp.push(item.$refs.checkboxChild.value);
                }
           });
        }
        return temp;
      }
    },
    watch: {
      selectedOptions: function (newVal, oldVal) {
        alert(newVal);
      }
    }
  });