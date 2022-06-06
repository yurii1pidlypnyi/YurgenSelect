
window.addEventListener("load", () => {
  let select = new YurgenSelect(".select", {
    allowClear: true,
    // placeholder: 'visible',
    // search: true,
    // change: (item) => {
    //   console.log(item.select.value);
    // }
  })
  let select1 = new YurgenSelect(".select-1", {
    search: true,
    allowClear: true,
    // change: (item) => {
    //   console.log('changed')
    // },
    // ready: (item) => {
    //   console.log(item, 'i am ready')
    // }
  })

  let select2 = new YurgenSelect(".select-3", {
    multiply: true,
    // search: true,
    // change: (item) => {
    //   console.log('changed')
    // },
    // ready: (item) => {
    //   console.log(item, 'i am ready')
    // }
  })


  let a = $('.js-example-basic-single').select2();

  let btn = document.querySelector('.btn');
  btn.addEventListener('click', () => {
    let select = document.querySelector('.select-3');
    // this.select.value = 'kv';
    console.dir(select);
    // select.selectedOptions.push('kv');
    // this.select.value = 'lv';
    // select[1].selected = true;
    // select[2].selected = true;
    // select[3].selected = true;
    // [...select.options].forEach(item => {
    // })

  })
})