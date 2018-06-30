
$(function() {


  LoadList();

  console.log("got here")
  function LoadList(){
    $.ajax({
      method:"GET",
      url: "/mylist/items",
      dataType: "json"
    }).done((items) => {
      items.forEach( function(element){

        var createdEl = createElement(element);

        if (element.category === 'to_watch'){
          $('.movies').append(createdEl)
        }
        else if (element.category === 'to_read'){
          $('.books').append(createdEl)
        }
        else if (element.category === 'to_buy'){
          $('.products').append(createdEl)
        }
        else if (element.category === 'to_eat'){
          $('.food').append(createdEl)
        }
        else{
          $('.other').append(createdEl)
        }


      })
    })
  }

  function createElement(obj){
    var $article = $('<article>');
    var category = obj.category;
    var content = obj.content;

    var $category = $(`<p>${category}</p>`);
    var $content = $(`
    <div class="dropdown">
      <button class="dropdown-toggle"  data-toggle="dropdown">${content}</button>
<ul class="dropdown-menu" aria-labelledby="dropdownMenu1">
    <li><a href="/update_category?content=${content}&category=to_eat">To eat</a></li>
    <li><a href="/update_category?content=${content}&category=to_buy">To buy</a></li>
    <li><a href="/update_category?content=${content}&category=to_watch">To watch</a></li>
    <li><a href="/update_category?content=${content}&category=to_read">To read</a></li>
    <li><a href="/update_category?content=${content}&category=other">To read</a></li>

    <li role="separator" class="divider"></li>
    <li><a href="/delete_item?content=${content}">Delete</a></li>
  </ul>
    </div>
    `);

    $($article).append($content);

    return $article

  }

})
