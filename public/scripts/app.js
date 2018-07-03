
$(function() {


  LoadList();


  function LoadList(){
    $.ajax({
      method:"GET",
      url: "/mylist/items",
      dataType: "json"
    }).done((items) => {
      items.forEach( function(element){

        var createdEl = createElement(element);

        if (element.category === 'to_watch'){
          $('#movies').append(createdEl)
        }
        else if (element.category === 'to_read'){
          $('#books').append(createdEl)
        }
        else if (element.category === 'to_buy'){
          $('#products').append(createdEl)
        }
        else if (element.category === 'to_eat'){
          $('#food').append(createdEl)
        }
        else{
          $('#other').append(createdEl)
        }


      })
    })
  }

  function createElement(obj){
    var $article = $('<article>');
    var category = obj.category;
    var content = obj.content;
    var description = obj.description;
    var description2 = obj.description2;
    var description3 = obj.description3;
    var description4 = obj.description4;
    console.log(description)





    var $description = $(`<p>${category}</p>`);
    var $content = $(`


  <div class="item">
    <div class="btn-group drop-left">
    <div class="btn-group dropleft">

      <button class="dropdown-toggle"  data-toggle="dropdown">${content}</button>
      <ul class="dropdown-menu" aria-labelledby="dropdownMenu1">
        <li><a href="mylist/update_category?content=${content}&category=to_eat&oldcategory=${category}&description3=${description3}&description4=${description4}&description=${description}">To eat</a></li>
        <li><a href="mylist/update_category?content=${content}&category=to_buy&oldcategory=${category}&description3=${description3}&description4=${description4}&description=${description}">To buy</a></li>
        <li><a href="mylist/update_category?content=${content}&category=to_watch&oldcategory=${category}&description3=${description3}&description4=${description4}&description=${description}">To watch</a></li>
        <li><a href="mylist/update_category?content=${content}&category=to_read&oldcategory=${category}&description3=${description3}&description4=${description4}&description=${description}">To read</a></li>
        <li><a href="mylist/update_category?content=${content}&category=other&oldcategory=${category}&description3=${description3}&description4=${description4}&description=${description}">other</a></li>
        <li role="separator" class="divider"></li>
        <li><a href="mylist/delete_item?content=${content}">Delete</a></li>
      </ul>
    </div>
    <div class="item-description">
    <ul class="item-description-list">

      <li>${description}</li>
      <li>${description2}</li>
      <li>${description3}</li>
      <li>${description4}</li>
      </ul>

    </div>

    </div>

    `);

    $($article).append($content);

    return $article

  }

})
