class YurgenSelect {
  constructor(selector, options) {
    this.select = document.querySelector(selector);

    let defaultOptions = {
      placeholder: "hidden",
      search: false,
      change: () => {},
      ready: () => {},
    };

    this.options = Object.assign(defaultOptions, options);
    this.selectElems = {};

    this.creating();
    this.filling();
    this.availableList();
    this.events();

    this.options.ready(this);
  }

  creating (){
    let selectBody = document.createElement('div');
    selectBody.classList.add('select__container');

    if(this.options.search){
      selectBody.innerHTML = `
      <div class="select__search">
        <input type="search" class="select__input">
      </div>
      <div class="select__values hidden">
        <ul class="select__list"></ul>
      </div>
      `;
      this.selectElems.selectSearch = selectBody.querySelector('.select__search');
      this.selectElems.selectInput = selectBody.querySelector('.select__input');
    } else {
      selectBody.innerHTML = `
      <button type="button" class="select__field"></button>
      <div class="select__values hidden">
        <ul class="select__list"></ul>
      </div>
      `;
      this.selectElems.selectField = selectBody.querySelector('.select__field');
    }

    this.selectElems.selectWrapper = selectBody;
    this.selectElems.selectListWrap = this.selectElems.selectWrapper.querySelector('.select__values');
    this.selectElems.selectList = this.selectElems.selectWrapper.querySelector('.select__list');
  }

  filling (){
    [...this.select.options].forEach(item => {
      let selectListItem = document.createElement('li');
      selectListItem.innerHTML = `<button type="button" data-value="${item.value}" class="select__option"><span>${item.label}</span></button>`;
      this.selectElems.selectList.append(selectListItem);

      let selectOption = selectListItem.querySelector('.select__option');

      if(item.selected) {
        if(!this.options.search) {
          this.selectElems.selectField.textContent = item.label;
          this.selectElems.selectField.dataset.value = item.value;
          
          if(item.value == 0){
            selectOption.classList.add('select__option--placeholder');
          }else {
            selectOption.classList.add('active');
          }
        } else {
          if(item.value == 0) {
            this.selectElems.selectInput.placeholder = item.label;
          }else {
            this.selectElems.selectInput.value = item.label;
            this.selectElems.selectInput.dataset.value = item.value;
            selectOption.classList.add('active');
          }
        }
      }

      if(item.value == 0) {
        switch (this.options.placeholder) {
          case 'disabled': selectOption.disabled = true;
            selectOption.classList.add('disabled');
            break;
          case 'visible': break;
          default: selectOption.closest('li').classList.add('hidden');
            break;
        }
      }
      if(item.disabled) {
        selectOption.classList.add('disabled');
        selectOption.disabled = true;
      }

      this.select.before(this.selectElems.selectWrapper)
    });
    this.selectElems.selectValues = [...this.selectElems.selectList.querySelectorAll('.select__option')];
  }

  availableList() {
    this.selectElems.activeList = [];
    this.selectElems.selectValues.forEach(item => {
      if(!item.closest('li').classList.contains('hidden')){
        this.selectElems.activeList.push(item);
      }
    })
  }

  events () {
    // select Open/Close
    this.selectElems.selectWrapper.addEventListener('click', (ev) => {
      let target = ev.target;
      
      if(!target.closest('.select__values')){
        this.selectOpen()
      }
    })

    document.addEventListener('click', (ev) => {
      let activeSelect = document.querySelectorAll('.select__container.active');
      let target = ev.target.closest('.select__container');

      if(activeSelect.length == 1){
        if(target !== activeSelect[0]) {
          this.selectClose()
        }
      }else if(activeSelect.length){
        this.selectClose(target)
      }
    })
    // =========================
    // select option list
    this.selectElems.selectValues.forEach(item => {
      item.addEventListener('click', () => {
        this.changeValue(item)
      })

      item.addEventListener('mouseenter', () => {
        if(item.dataset.value != 0){
          this.removeClass(this.selectElems.selectValues, 'highlight');
          item.classList.add('highlight')
        }
      })
    })
    // ========================
    // search == true
    if(this.options.search) {
      this.selectElems.selectInput.addEventListener('keydown', (ev) => {
        let keycode = ev.keycode ? ev.keycode : ev.which;
        if(keycode == 38 || keycode == 40){
          ev.preventDefault();
          this.searchArrows(keycode);
        }
        if(keycode == 13) {
          ev.preventDefault();
          this.searchEnter();
        }
      })
      this.selectElems.selectInput.addEventListener('input', () => {
        this.search();
        this.availableList();
        this.changeHighlight();
      })
    }
    // ========================
  }

  selectOpen () {
    this.changeHighlight('open');

    if(this.selectElems.selectWrapper.classList.contains('active')) {
      this.selectClose()
    } else {
      this.selectScroll('opening');
      this.selectElems.selectListWrap.classList.remove('hidden')
      this.selectElems.selectWrapper.classList.add('active')

      if(this.options.search) {
        this.search();
      }
    }
  }

  selectClose(target) {
    if(!target){
      this.selectElems.selectListWrap.classList.add('hidden')
      this.selectElems.selectWrapper.classList.remove('active');
      if(this.options.search){
        this.checkSearchValue()
        this.selectElems.selectInput.blur();
      }
    } else {
      let activeSelect = [...document.querySelectorAll('.select__container.active')];
      activeSelect.splice(activeSelect.indexOf(target),1)
      activeSelect[0].classList.remove('active');
      activeSelect[0].querySelector('.select__values').classList.add('hidden');
    }
    this.removeClass(this.selectElems.selectValues,'highlight');
  }

  changeValue(item) {
    this.select.value = item.dataset.value;
    this.removeClass(this.selectElems.selectValues,'active')
    item.classList.add('active');

    if(this.options.search){
      if(item.dataset.value == 0){
        this.selectElems.selectInput.value = '';
      } else {
        this.selectElems.selectInput.value = item.textContent;
      }
      this.selectElems.selectInput.dataset.value = item.dataset.value;

    } else {
      this.selectElems.selectField.textContent = item.textContent;
      this.selectElems.selectField.dataset.value = item.dataset.value;
    }
    
    this.selectClose()
    this.options.change(this);
  }

  removeClass (arr, classname) {
    arr.forEach(item => {
      item.classList.remove(classname);
    })
  }

  selectScroll (key, el) {
    switch (key) {
      case 'opening' :
        let focusEl = this.selectElems.selectList.querySelector('.active');

        if(this.options.search){
          focusEl = this.selectElems.selectList.querySelector('.highlight');
        }

        if(focusEl) {
          this.selectElems.selectList.scrollTop = focusEl.offsetTop;
        }
        break;

      case 'arrows' :
        let scrollPosition = this.selectElems.selectList.scrollTop;
        let scrollListHeight = this.selectElems.selectList.offsetHeight;

        let conditionOne = (scrollPosition + scrollListHeight) >= el.offsetTop + el.offsetHeight;
        let conditionTwo = scrollPosition <= el.offsetTop;

        if( !(conditionOne && conditionTwo)){
          if(el.offsetTop <= scrollPosition) {
            this.selectElems.selectList.scrollTop = el.offsetTop;
          } else {
            this.selectElems.selectList.scrollTop = el.offsetTop + el.offsetHeight - scrollListHeight;
          }
        }
        break;
        case 'focus':
          console.log('scroll to active element')
          break;
    }
  }

  search () {
    let searchStr = this.selectElems.selectInput.value;
    let searItems = [...this.selectElems.selectValues];
    searItems.splice(0,1);

    if(searchStr.length) {
      this.clearSearch(searItems);
      [].filter.call(searItems, (item) => {
        if (!item.textContent.toUpperCase().includes(searchStr.toUpperCase())) {
          item.closest('li').classList.add('hidden');
        }
      });
    } else {
      this.clearSearch(searItems)
    }
  }

  searchArrows (key) {
    let highlightEl = this.selectElems.selectList.querySelector('.highlight');
    let curInx = this.selectElems.activeList.indexOf(highlightEl);
    if(curInx != -1){
      switch (key) {
        case 38:
          let prevEl = highlightEl.closest('li').previousElementSibling.querySelector('.select__option');
          if(prevEl && prevEl.classList.contains('disabled')){
            prevEl = prevEl.closest('li').previousElementSibling.querySelector('.select__option');
          }
          if(prevEl.dataset.value != 0){
            highlightEl.classList.remove('highlight');
            prevEl.classList.add('highlight');
            this.selectScroll('arrows', prevEl);
          }
          break;
        case 40:
          let nextEl = highlightEl.closest('li').nextElementSibling ? highlightEl.closest('li').nextElementSibling.querySelector('.select__option') : null;
          if(nextEl && nextEl.classList.contains('disabled')){
            nextEl = nextEl.closest('li').nextElementSibling ? nextEl.closest('li').nextElementSibling.querySelector('.select__option') : null;
          }
          if(nextEl){
            highlightEl.classList.remove('highlight');
            nextEl.classList.add('highlight');
            this.selectScroll('arrows', nextEl);
          }
          break;
      }
    }
  }

  searchEnter () {
    let choosenItem = this.selectElems.selectList.querySelector('.highlight');
    this.changeValue(choosenItem);
  }

  clearSearch (items) {
    items.forEach(item => {
      item.closest('li').classList.remove('hidden');
    });
  }

  checkSearchValue() {
  }

  changeHighlight(ev) {
    switch(ev) {
      case 'open':
        let activeElement = this.selectElems.selectList.querySelector('.select__option.active');

        if(activeElement && this.selectElems.activeList.indexOf(activeElement) != -1){
          activeElement.classList.add('highlight');
        } else {
          if(this.options.search) {
            this.selectElems.activeList[0].classList.add('highlight');
          }
        }
        break;
      default:
        console.log('change highlight');
        break;
    }
  }
}