
window.addEventListener("load", () => {
  let select = new YurgenSelect(".select", {
    // placeholder: 'visible',
    // search: true,
    // change: (item) => {
    //   console.log(item.select.value);
    // }
  })
  let select1 = new YurgenSelect(".select-1", {
    speed: 200,
    // placeholder: 'disabled',
    search: true,
    // change: (item) => {
    //   console.log('changed')
    // },
    // ready: (item) => {
    //   console.log(item, 'i am ready')
    // }
  })

  let a = $('.js-example-basic-single').select2();
  // console.log(a)
})