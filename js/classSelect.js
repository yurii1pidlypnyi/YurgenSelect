class YurgenSelect {
  constructor(selector, options) {
    this.select = document.querySelector(selector);

    let defaultOptions = {
      search: false,
      multiply: false,
      allowClear: false,
      change: () => {},
      ready: () => {},
    };

    this.options = Object.assign(defaultOptions, options);
    this.selectElems = {};
    this.selectElems.optionsObj = {};
    this.flags = {
      clearing: false,
      noChoise: true,
    }

    this.creating();
    this.filling();
    this.availableList();
    this.events();
    this.options.ready(this);
  }

  creating() {
    let selectBody = document.createElement('div');
    selectBody.classList.add('select__container');

    if(this.options.multiply){
      selectBody.classList.add('select-multiply')
    }

    selectBody.innerHTML = `
    <div class="select__field"></div>
    <div class="select__values hidden">
      <ul class="select__list"></ul>
    </div>
    `;

    this.selectElems.selectWrapper = selectBody;
    this.selectElems.selectListWrap = this.selectElems.selectWrapper.querySelector('.select__values');
    this.selectElems.selectList = this.selectElems.selectWrapper.querySelector('.select__list');
    this.selectElems.selectField = this.selectElems.selectWrapper.querySelector('.select__field');

    if(this.options.search){
      this.selectElems.selectListWrap.insertAdjacentHTML('afterbegin', `
      <div class="select__search">
        <input type="search" class="select__input">
      </div>
      `)
      this.selectElems.selectSearch = this.selectElems.selectWrapper.querySelector('.select__search');
      this.selectElems.selectInput = this.selectElems.selectWrapper.querySelector('.select__input');
    }
  }

  filling() {
    [...this.select.options].forEach(item => {

      this.selectElems.optionsObj[item.value] = item;

      if(this.options.multiply){
        return false
      }

      let selectListItem = document.createElement('li');
      selectListItem.innerHTML = `
      <button type="button" data-value="${item.value}" class="select__option">
        <span>${item.label}</span>
      </button>
      `;
      this.selectElems.selectList.append(selectListItem);

      let selectOption = selectListItem.querySelector('.select__option');
      if(item.selected) {
        this.selectElems.selectField.innerHTML = `<span class="select-field__text">${item.label}</span>`;
        this.selectElems.selectField.dataset.value = item.value;

        if(item.value != 0){
          selectOption.classList.add('active');
        }
      }

      if(item.value == 0) {
        selectOption.closest('li').classList.add('hidden');

        if(this.options.search){
          this.selectElems.selectInput.placeholder = item.label;
        }
      }

      if(item.disabled) {
        selectOption.classList.add('disabled');
        selectOption.disabled = true;
      }
    });
    if(this.options.multiply){
      this.multiplyList('filling');
    }
    this.select.before(this.selectElems.selectWrapper)
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

  events() {
    // select Open/Close
    this.selectElems.selectWrapper.addEventListener('click', (ev) => {

      let target = ev.target;

      if(target.classList.contains('select__clear')){
        this.clearValue();
      }
      if(!target.closest('.select__values')){
        this.selectOpen();
      }
    })

    document.addEventListener('click', (ev) => {
      let activeSelect = document.querySelectorAll('.select__container.active');
      let target = ev.target.closest('.select__container');

      if(activeSelect.length == 1){
        if(target !== activeSelect[0] && !this.flags.clearing) {
          this.selectClose()
        }
      }else if(activeSelect.length){
        this.selectClose(target)
      }

      this.flags.clearing = false;
    })
    // =========================
    // select option list
    this.selectElems.selectValues.forEach(item => {
      item.addEventListener('click', () => {
        if(this.options.multiply){
          this.chooseValue(item);
        } else {
          this.changeValue(item)
        }
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
        this.selectScroll('focus');

        if(this.selectElems.activeList.length == 0) {
          let noFind = document.createElement('li');
          noFind.innerHTML = `
          <button type="button" class="select__option no-find disabled">No results found</button>
          `;
          if(!this.selectElems.selectList.classList.contains('no-result')){
            this.selectElems.selectList.classList.add('no-result')
            this.selectElems.selectList.prepend(noFind);
          }
        } else {
          if(this.selectElems.selectList.classList.contains('no-result')){
            this.selectElems.selectList.classList.remove('no-result')
            this.selectElems.selectList.querySelector('.no-find').remove()
          }
        }
      })
    }
    // ========================
  }

  selectOpen() {
    if(this.options.search) {
      this.selectElems.selectInput.value = '';
      this.search();
      this.availableList();
    }

    this.changeHighlight();

    if(this.selectElems.selectWrapper.classList.contains('active') && !this.flags.clearing) {
      this.selectClose();
    } else {
      this.selectScroll('focus');
      this.selectElems.selectListWrap.classList.remove('hidden');
      this.selectElems.selectWrapper.classList.add('active');

      if(this.options.search) {
        this.selectElems.selectInput.focus();
      }
    }
  }

  selectClose(target) {
    if(!target){
      this.selectElems.selectListWrap.classList.add('hidden')
      this.selectElems.selectWrapper.classList.remove('active');
    } else {
      let activeSelect = [...document.querySelectorAll('.select__container.active')];
      activeSelect.splice(activeSelect.indexOf(target),1)
      activeSelect[0].classList.remove('active');
      activeSelect[0].querySelector('.select__values').classList.add('hidden');
    }
    this.removeClass(this.selectElems.selectValues,'highlight');
  }

  changeValue(item) {
    if(!item) {
      return false
    }

    this.select.value = item.dataset.value;
    this.removeClass(this.selectElems.selectValues,'active')
    item.classList.add('active');

    if(this.options.allowClear){
      this.selectElems.selectField.innerHTML = `
      <span class="select-field__text">${this.selectElems.optionsObj[item.dataset.value].label}</span>
      <span class="select__clear"></span>`;
    } else {
      this.selectElems.selectField.innerHTML = `<span>${this.selectElems.optionsObj[item.dataset.value].label}</span>`;
    }

    this.selectElems.selectField.dataset.value = item.dataset.value;
    this.selectClose();
    this.options.change(this);
  }

  chooseValue(item) {
    if(!item){return false}
    if(this.flags.noChoise){
      this.selectElems.optionsObj[0].selected = false;
    }
    if(this.options.search){
      this.selectElems.selectInput.focus();
    }
    let optionEl = this.selectElems.optionsObj[item.dataset.value];
    let action = optionEl.selected ? 'remove' : 'add';
    switch (action){
      case 'add':
        item.classList.add('active');
        optionEl.selected = true;
        this.multiplyList('render');
        break;
      case 'remove':
        item.classList.remove('active');
        optionEl.selected = false;
        this.multiplyList('render');
        break;
    }

    if(this.select.selectedOptions.length == 0){
      this.selectElems.optionsObj[0].selected = true;
      this.flags.noChoise = true;
    }
  }

  multiplyList(action) {
    switch (action) {
      case 'filling':
        [...this.select.options].forEach(item =>{
          let selectListItem = document.createElement('li');
          selectListItem.innerHTML = `
          <button type="button" data-value="${item.value}" class="select__option">
            <span>${item.label}</span>
          </button>`;

          this.selectElems.selectList.append(selectListItem);
          let selectOption = selectListItem.querySelector('.select__option');

          if(item.selected && item.value != 0){
            selectOption.classList.add('active');
          }

          if(item.value == 0) {
            this.selectElems.selectField.innerHTML = `<span class="select-field__text">${item.label}</span>`;
            this.selectElems.selectField.dataset.value = item.value;
            selectOption.closest('li').classList.add('hidden');
            if(this.options.search){
              this.selectElems.selectInput.placeholder = item.label;
            }
          }

          if(item.disabled) {
            selectOption.classList.add('disabled');
            selectOption.disabled = true;
          }
        });
        this.multiplyList('render');
        break;
      case 'render':
        if(this.selectElems.renderedList) {
          this.selectElems.renderedList.remove()
        }
        let list = document.createElement('ul');
        list.classList.add('select-multiply__list');
        this.selectElems.renderedList = list;
        [...this.select.selectedOptions].forEach(item => {
          let conditionOne = this.select.selectedOptions.length == 1;
          let conditionTwo = this.select.selectedOptions[0].value == 0;
          if( !(conditionOne && conditionTwo) ){
            if(item.selected && item.value != 0){
              let listItem = document.createElement('li');
              listItem.classList.add('select-multiply__item');
              listItem.dataset.value = item.value;
              listItem.innerHTML = `
              <span class="select-multiply__text">${item.label}</span><span class="select-multiply__cancel"></span>
              `;
              list.append(listItem);
              listItem.addEventListener('click', () => {
                this.removingMultiply(listItem);
              })
            } else {
              item.selected = false;
            }
          }
        })
        this.select.after(list);
        break;
    }
  }

  removingMultiply(item) {
    console.log(item)
    let optionEl = this.selectElems.optionsObj[item.dataset.value];
    optionEl.selected = false;
    let selectElem = this.selectElems.selectList.querySelector(`[data-value="${optionEl.value}"]`);
    selectElem.classList.remove('active');
    item.remove();
    if(this.selectElems.renderedList.children.length == 0){
      this.select.value = 0;
      this.selectElems.renderedList.remove();
    }
  }

  removeClass(arr, classname) {
    arr.forEach(item => {
      item.classList.remove(classname);
    })
  }

  selectScroll(key, el) {
    switch (key) {
      case 'focus' :
        let focusEl = this.selectElems.selectList.querySelector('.active');

        if(this.options.search){
          focusEl = this.selectElems.selectList.querySelector('.highlight');
        }

        if(focusEl) {
          this.selectElems.selectList.scrollTop = focusEl.offsetTop;
        }else {
          this.selectElems.selectList.scrollTop = 0;
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
    }
  }

  search() {
    let searchStr = this.selectElems.selectInput.value;
    let searItems = [...this.selectElems.selectValues];
    searItems.splice(0,1);

    if(searchStr.length) {
      this.clearSearch(searItems);

      [].filter.call(searItems, (item) => {
        if(searchStr.length>0 && item.classList.contains('disabled')){
          item.closest('li').classList.add('hidden');
        }
        if (!item.textContent.toUpperCase().includes(searchStr.toUpperCase())) {
          item.closest('li').classList.add('hidden');
        }
      });
    } else {
      this.clearSearch(searItems)
    }
  }

  searchArrows(key) {
    let highlightEl = this.selectElems.selectList.querySelector('.highlight');
    let curInx = this.selectElems.activeList.indexOf(highlightEl);

    if(curInx != -1 && highlightEl){
      switch (key) {
        case 38:
          let prevEl = this.selectElems.activeList[curInx - 1];
          if(prevEl && prevEl.classList.contains('disabled')){
            prevEl = this.selectElems.activeList[curInx - 2];
          }
          if(prevEl){
            highlightEl.classList.remove('highlight');
            prevEl.classList.add('highlight');
            this.selectScroll('arrows', prevEl);
          }
          break;
        case 40:
          let nextEl = this.selectElems.activeList[curInx + 1];

          if(nextEl && nextEl.classList.contains('disabled')){
            nextEl = this.selectElems.activeList[curInx + 2];
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

  searchEnter() {
    let choosenItem = this.selectElems.selectList.querySelector('.highlight');
    if(this.options.multiply){
      this.chooseValue(choosenItem);
    }else {
      this.changeValue(choosenItem);
    }
  }

  clearSearch(items) {
    items.forEach(item => {
      item.closest('li').classList.remove('hidden');
    });
  }

  changeHighlight() {
    let activeElement = this.selectElems.selectList.querySelector('.select__option.active');
    this.removeClass(this.selectElems.selectValues, 'highlight');

    if(activeElement && this.selectElems.activeList.indexOf(activeElement) != -1){
      activeElement.classList.add('highlight');
    } else {
      if(this.options.search) {
        if(this.selectElems.activeList[0]){
          this.selectElems.activeList[0].classList.add('highlight');
        }
      }
    }
  }

  clearValue() {
    this.removeClass(this.selectElems.selectValues, 'active');
    this.removeClass(this.selectElems.selectValues, 'highlight');

    this.select.value = '0';
    this.selectElems.selectField.innerHTML = `
    <span class="select-field__text">${this.selectElems.optionsObj[0].label}</span>`;
    this.selectElems.selectField.dataset.value = 0;
    this.flags.clearing = true;
  }
}